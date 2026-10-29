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
    if (brandName.Contains("KOI", StringComparison.OrdinalIgnoreCase) ||
        brandName.Contains("Starbucks", StringComparison.OrdinalIgnoreCase))
        sourceLanguage = "vi";
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
    long brandId, string languageCode, NpgsqlDataSource db, ITranslationProvider translator, ILogger<Program> logger, CancellationToken ct) =>
    await TranslateBrandAsync(brandId, languageCode, db, translator, logger, ct));

// Admin can also explicitly generate or refresh a brand translation.
app.MapPost("/admin/brands/{brandId:long}/translations/{languageCode}", async (
    long brandId, string languageCode, NpgsqlDataSource db, ITranslationProvider translator, ILogger<Program> logger, CancellationToken ct) =>
    await TranslateBrandAsync(brandId, languageCode, db, translator, logger, ct));

app.Run();

static async Task<IResult> TranslateBrandAsync(long brandId, string languageCode, NpgsqlDataSource db, ITranslationProvider translator, ILogger logger, CancellationToken ct)
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
    if (brandName.Contains("KOI", StringComparison.OrdinalIgnoreCase) ||
        brandName.Contains("Starbucks", StringComparison.OrdinalIgnoreCase))
        sourceLanguage = "vi";
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

    string translated;
    try
    {
        translated = await translator.TranslateAsync(source, sourceLanguage ?? "auto", languageCode, ct);
    }
    catch (HttpRequestException ex)
    {
        logger.LogWarning(ex, "Translation provider failed for brand {BrandId} and language {LanguageCode}", brandId, languageCode);
        return Results.Problem("The unofficial translation endpoint is unavailable.", statusCode: StatusCodes.Status502BadGateway);
    }
    catch (JsonException ex)
    {
        logger.LogWarning(ex, "Translation provider returned an invalid response for brand {BrandId} and language {LanguageCode}", brandId, languageCode);
        return Results.Problem("The translation endpoint returned an unexpected response.", statusCode: StatusCodes.Status502BadGateway);
    }
    catch (OperationCanceledException ex) when (!ct.IsCancellationRequested)
    {
        logger.LogWarning(ex, "Translation provider timed out for brand {BrandId} and language {LanguageCode}", brandId, languageCode);
        return Results.Problem("The translation request timed out.", statusCode: StatusCodes.Status504GatewayTimeout);
    }

    if (string.IsNullOrWhiteSpace(translated))
        return Results.Problem("The translation endpoint returned empty text.", statusCode: StatusCodes.Status502BadGateway);

    if (brandName.Contains("KOI", StringComparison.OrdinalIgnoreCase))
        translated = Regex.Replace(translated, @"\bKOI\s+\w+\b", _ => brandName, RegexOptions.IgnoreCase);
    if (brandName.Contains("Starbucks", StringComparison.OrdinalIgnoreCase))
        translated = Regex.Replace(translated, @"\bStarbucks?\b", _ => brandName, RegexOptions.IgnoreCase);

    return Results.Ok(new { brandId, brandName, languageCode, description = translated, isTranslated = true });
}

public interface ITranslationProvider
{
    Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken cancellationToken);
}

public sealed class UnofficialGoogleTranslateProvider(HttpClient client) : ITranslationProvider
{
    private static readonly string[] Endpoints =
    [
        "https://translate.googleapis.com/translate_a/single",
        "https://translate.google.com/translate_a/single"
    ];

    public async Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken cancellationToken)
    {
        var source = GoogleLanguageCode(sourceLanguage);
        var target = GoogleLanguageCode(targetLanguage);
        Exception? lastError = null;
        for (var attempt = 0; attempt < 4; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var endpoint = Endpoints[attempt % Endpoints.Length];
            var url = $"{endpoint}?client=gtx&sl={Uri.EscapeDataString(source)}&tl={Uri.EscapeDataString(target)}&dt=t&q={Uri.EscapeDataString(text)}";
            try
            {
                using var response = await client.GetAsync(url, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
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
                    var translation = string.Concat(segments);
                    if (!string.IsNullOrWhiteSpace(translation)) return translation;
                    lastError = new InvalidOperationException("The translation provider returned empty text.");
                }
                else
                {
                    lastError = new HttpRequestException($"Translation provider returned HTTP {(int)response.StatusCode}.", null, response.StatusCode);
                    if ((int)response.StatusCode < 500 && response.StatusCode != System.Net.HttpStatusCode.TooManyRequests) break;
                }
            }
            catch (HttpRequestException ex)
            {
                lastError = ex;
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                lastError = new TimeoutException("Translation provider request timed out.");
            }

            if (attempt < 3) await Task.Delay(TimeSpan.FromMilliseconds(300 * (attempt + 1)), cancellationToken);
        }
        throw new HttpRequestException("All translation provider attempts failed.", lastError);
    }

    private static string GoogleLanguageCode(string code) => code.Equals("zh", StringComparison.OrdinalIgnoreCase) ? "zh-CN" : code;
}
