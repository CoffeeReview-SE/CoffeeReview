using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Text.Json;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5102"}");

var connectionString = builder.Configuration.GetConnectionString("Supabase")
    ?? throw new InvalidOperationException("ConnectionStrings:Supabase is required.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));
builder.Services.AddHttpClient<ITranslationProvider, UnofficialGoogleTranslateProvider>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(20);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("SaigonCoffee/0.1 translation-prototype");
});

var app = builder.Build();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/health") { await next(); return; }

    var expected = app.Configuration["Gateway:SharedKey"] ?? "";
    var supplied = context.Request.Headers["X-Gateway-Key"].ToString();
    if (string.IsNullOrEmpty(expected) || supplied.Length != expected.Length ||
        !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(supplied), Encoding.UTF8.GetBytes(expected)))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return;
    }

    await next();
});

// Public read: return the original description. Translations are generated on demand and not stored.
app.MapGet("/brands/{brandId:long}", async (long brandId, NpgsqlDataSource db, CancellationToken ct) =>
{
    const string sql = """
        SELECT b.brand_id, b.brand_name, COALESCE(b.description, ''), b.description_language_code
        FROM public.brand b
        WHERE b.brand_id = @brandId AND b.is_active
        """;
    await using var cmd = db.CreateCommand(sql);
    cmd.Parameters.AddWithValue("brandId", brandId);
    await using var reader = await cmd.ExecuteReaderAsync(ct);
    if (!await reader.ReadAsync(ct)) return Results.NotFound();

    var sourceLanguage = reader.IsDBNull(3) ? null : reader.GetString(3);
    return Results.Ok(new
    {
        id = reader.GetInt64(0),
        name = reader.GetString(1),
        description = reader.GetString(2),
        descriptionLanguageCode = sourceLanguage,
        isTranslated = false
    });
});

// User language selection translates on demand without persisting the translation.
app.MapPost("/brands/{brandId:long}/translations/{languageCode}", async (
    long brandId, string languageCode, NpgsqlDataSource db, ITranslationProvider translator, CancellationToken ct) =>
    await TranslateBrandAsync(brandId, languageCode, db, translator, ct));

// Admin can also explicitly generate or refresh a brand translation.
app.MapPost("/admin/brands/{brandId:long}/translations/{languageCode}", async (
    long brandId, string languageCode, NpgsqlDataSource db, ITranslationProvider translator, CancellationToken ct) =>
    await TranslateBrandAsync(brandId, languageCode, db, translator, ct));

app.Run();

static async Task<IResult> TranslateBrandAsync(long brandId, string languageCode, NpgsqlDataSource db, ITranslationProvider translator, CancellationToken ct)
{
    languageCode = languageCode.Trim().ToLowerInvariant();
    if (languageCode.Length is < 2 or > 10)
        return Results.BadRequest(new { error = "Invalid language code." });

    string source;
    string? sourceLanguage;
    string brandName;
    await using (var cmd = db.CreateCommand("""
        SELECT brand_name, COALESCE(description, ''), description_language_code
        FROM public.brand WHERE brand_id = @brandId AND is_active
        """))
    {
        cmd.Parameters.AddWithValue("brandId", brandId);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return Results.NotFound(new { error = "Brand not found." });
        brandName = reader.GetString(0);
        source = reader.GetString(1);
        sourceLanguage = reader.IsDBNull(2) ? null : reader.GetString(2);
    }

    if (string.IsNullOrWhiteSpace(source))
        return Results.Conflict(new { error = "The brand has no source description to translate." });
    if (source.Length > 5000)
        return Results.BadRequest(new { error = "Source description cannot exceed 5000 characters." });

    await using (var cmd = db.CreateCommand("""
        SELECT EXISTS(SELECT 1 FROM public.language WHERE language_code = @language AND is_enabled)
        """))
    {
        cmd.Parameters.AddWithValue("language", languageCode);
        if (!(bool)(await cmd.ExecuteScalarAsync(ct) ?? false))
            return Results.BadRequest(new { error = "Target language is not enabled." });
    }

    if (string.Equals(sourceLanguage, languageCode, StringComparison.OrdinalIgnoreCase))
        return Results.Ok(new { brandId, brandName, languageCode, description = source, isTranslated = false });

    // Protect only this brand's name. Replacing every brand in the text can
    // turn ordinary descriptions into mostly opaque tokens for the translator.
    var sourceNamesToProtect = new List<(string Term, string RestoreAs)> { (brandName, brandName) };
    if (brandName.Contains("KOI", StringComparison.OrdinalIgnoreCase))
    {
        sourceNamesToProtect.Add(("KOI The", brandName));
        sourceNamesToProtect.Add(("KOI Tea", brandName));
    }
    if (brandName.Contains("Starbucks", StringComparison.OrdinalIgnoreCase))
        sourceNamesToProtect.Add(("Starbuck", brandName));

    var protectedNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    var sourceForTranslation = source;
    foreach (var (term, restoreAs) in sourceNamesToProtect.OrderByDescending(value => value.Term.Length))
    {
        var token = $"ZXQBRAND{protectedNames.Count}QXZ";
        var replaced = Regex.Replace(sourceForTranslation, Regex.Escape(term), token, RegexOptions.IgnoreCase);
        if (replaced == sourceForTranslation) continue;
        protectedNames[token] = restoreAs;
        sourceForTranslation = replaced;
    }

    string translated;
    try
    {
        translated = await translator.TranslateAsync(sourceForTranslation, sourceLanguage ?? "auto", languageCode, ct);
    }
    catch (HttpRequestException)
    {
        return Results.Problem("The unofficial translation endpoint is unavailable.", statusCode: StatusCodes.Status502BadGateway);
    }
    catch (JsonException)
    {
        return Results.Problem("The translation endpoint returned an unexpected response.", statusCode: StatusCodes.Status502BadGateway);
    }
    catch (OperationCanceledException) when (!ct.IsCancellationRequested)
    {
        return Results.Problem("The translation request timed out.", statusCode: StatusCodes.Status504GatewayTimeout);
    }

    if (string.IsNullOrWhiteSpace(translated))
        return Results.Problem("The translation endpoint returned empty text.", statusCode: StatusCodes.Status502BadGateway);

    foreach (var (token, name) in protectedNames)
        translated = Regex.Replace(translated, Regex.Escape(token), _ => name, RegexOptions.IgnoreCase);

    return Results.Ok(new { brandId, brandName, languageCode, description = translated, isTranslated = true });
}

public interface ITranslationProvider
{
    Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken cancellationToken);
}

public sealed class UnofficialGoogleTranslateProvider(HttpClient client) : ITranslationProvider
{
    private const string Endpoint = "https://translate.googleapis.com/translate_a/single";

    public async Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken cancellationToken)
    {
        var source = GoogleLanguageCode(sourceLanguage);
        var target = GoogleLanguageCode(targetLanguage);
        var url = $"{Endpoint}?client=gtx&sl={Uri.EscapeDataString(source)}&tl={Uri.EscapeDataString(target)}&dt=t&q={Uri.EscapeDataString(text)}";
        using var response = await client.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (document.RootElement.ValueKind != JsonValueKind.Array || document.RootElement.GetArrayLength() == 0 ||
            document.RootElement[0].ValueKind != JsonValueKind.Array)
            throw new JsonException("Unexpected translation response shape.");

        var segments = new List<string>();
        foreach (var segment in document.RootElement[0].EnumerateArray())
        {
            if (segment.ValueKind == JsonValueKind.Array && segment.GetArrayLength() > 0 && segment[0].ValueKind == JsonValueKind.String)
                segments.Add(segment[0].GetString() ?? "");
        }
        return string.Concat(segments);
    }

    private static string GoogleLanguageCode(string code) => code.Equals("zh", StringComparison.OrdinalIgnoreCase) ? "zh-CN" : code;
}
