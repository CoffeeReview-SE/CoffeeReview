using Npgsql;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5104"}");
var cs = builder.Configuration.GetConnectionString("Supabase") ?? throw new InvalidOperationException("ConnectionStrings:Supabase missing");
builder.Services.AddSingleton(NpgsqlDataSource.Create(cs));
builder.Services.AddSingleton<ImageFileStore>();
var app = builder.Build();
app.MapBranchMedia();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.Use(async (ctx, next) => {
    if (ctx.Request.Path == "/health") { await next(); return; }
    var expected = app.Configuration["Gateway:SharedKey"];
    var supplied = ctx.Request.Headers["X-Gateway-Key"].ToString();
    if (string.IsNullOrEmpty(expected) || supplied.Length != expected.Length ||
        !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(supplied), Encoding.UTF8.GetBytes(expected))) {
        ctx.Response.StatusCode = 401; return;
    }
    await next();
});

app.MapGet("/admin/submissions",async(NpgsqlDataSource db)=>{
    // Legacy embedded images use the compatibility endpoint; file-backed image URLs pass through.
    await using var cmd=db.CreateCommand("""
        SELECT submission_id,target_type,COALESCE(suggested_name,''),COALESCE(suggested_address,''),status,created_at,COALESCE(created_by::text,''),
          ((data_json - 'logoUrl' - 'coverUrl' - 'menuImageUrl') || jsonb_build_object(
            'logoUrl', CASE WHEN data_json->>'logoUrl' LIKE 'data:%' THEN '/api/admin/submissions/' || submission_id || '/images/logo' ELSE data_json->>'logoUrl' END,
            'coverUrl', CASE WHEN data_json->>'coverUrl' LIKE 'data:%' THEN '/api/admin/submissions/' || submission_id || '/images/cover' ELSE data_json->>'coverUrl' END,
            'menuImageUrl', CASE WHEN data_json->>'menuImageUrl' LIKE 'data:%' THEN '/api/admin/submissions/' || submission_id || '/images/menu' ELSE data_json->>'menuImageUrl' END
          ))::text
        FROM submission ORDER BY created_at DESC LIMIT 500
        """);
    await using var r=await cmd.ExecuteReaderAsync();var list=new List<object>();while(await r.ReadAsync())list.Add(new{id=r.GetInt64(0),targetType=r.GetString(1),name=r.GetString(2),address=r.GetString(3),status=r.GetString(4),createdAt=r.GetDateTime(5),author=r.GetString(6),dataJson=r.GetString(7)});return Results.Ok(list);
});
app.MapGet("/admin/submissions/{id:long}/images/{kind}", async (long id, string kind, NpgsqlDataSource db, HttpContext context, CancellationToken ct) => {
    var field = kind switch { "logo" => "logoUrl", "cover" => "coverUrl", "menu" => "menuImageUrl", _ => null };
    if (field is null) return Results.NotFound();
    await using var cmd = db.CreateCommand("SELECT data_json->>@field FROM submission WHERE submission_id=@id");
    cmd.Parameters.AddWithValue("field", field);
    cmd.Parameters.AddWithValue("id", id);
    var value = await cmd.ExecuteScalarAsync(ct) as string;
    if (value is null || !SubmissionImages.TryDecode(value, out var bytes, out var contentType)) return Results.NotFound();
    context.Response.Headers.CacheControl = "private, no-store";
    context.Response.Headers.XContentTypeOptions = "nosniff";
    return Results.File(bytes, contentType);
});
app.MapMethods("/images/{name}", new[] { "GET", "HEAD" }, async (string name, ImageFileStore images, HttpContext context, CancellationToken ct) => {
    var image = await images.ReadAsync(name, ct);
    if (image is null) return Results.NotFound();
    context.Response.Headers.XContentTypeOptions = "nosniff";
    context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
    return Results.File(image.Value.Bytes, image.Value.Mime, entityTag: new Microsoft.Net.Http.Headers.EntityTagHeaderValue($"\"{name[..64]}\""));
});
app.MapPost("/", async (SuggestionInput input, NpgsqlDataSource db, ImageFileStore images, CancellationToken ct) =>
{
    var name = input.Name?.Trim();
    var phone = input.Phone?.Trim();
    var brandName = input.BrandName?.Trim();
    var address = input.Address?.Trim();
    var note = input.Note?.Trim();
    var errors = SuggestionValidation.Validate(input, false);
    if (errors.Count > 0) return Results.BadRequest(new { error = "incomplete_submission", errors });
    var isNewBrand = await IsNewBrand(brandName!, db, ct);
    errors = SuggestionValidation.Validate(input, isNewBrand);
    if (errors.Count > 0) return Results.BadRequest(new { error = "incomplete_submission", errors });

    try
    {
        input = input with {
            LogoUrl = await images.StoreAsync(input.LogoUrl, brandName!, "logo", ct),
            CoverUrl = await images.StoreAsync(input.CoverUrl, brandName!, "cover", ct),
            MenuImageUrl = await images.StoreAsync(input.MenuImageUrl, brandName!, "menu", ct)
        };
    }
    catch (ArgumentException) { return Results.BadRequest(new { error = "Ảnh không hợp lệ hoặc không còn tồn tại. Vui lòng chọn lại ảnh." }); }
    catch (Exception error) when (error is IOException or UnauthorizedAccessException)
    { return Results.Json(new { error = "Chưa lưu được ảnh. Vui lòng thử lại." }, statusCode: 503); }

    var targetType = isNewBrand ? "BRAND" : "BRANCH";
    var details = JsonSerializer.Serialize(new {
        name, contactName = name, phone, brandName, address, note,
        type = input.Type?.Trim(), description = input.Description?.Trim(),
        websiteUrl = input.WebsiteUrl?.Trim(), logoUrl = input.LogoUrl?.Trim(),
        coverUrl = input.CoverUrl?.Trim(), menuImageUrl = input.MenuImageUrl?.Trim(),
        branchName = input.BranchName?.Trim(), branchPhone = input.BranchPhone?.Trim(),
        latitude = input.Latitude, longitude = input.Longitude, openingHours = input.OpeningHours?.Trim()
    });
    await using var cmd = db.CreateCommand("""
        INSERT INTO submission(target_type, data_json, suggested_name, suggested_address)
        VALUES (@type, @data::jsonb, @name, @address)
        RETURNING submission_id
        """);
    cmd.Parameters.AddWithValue("type", targetType);
    cmd.Parameters.AddWithValue("data", details);
    cmd.Parameters.AddWithValue("name", brandName!);
    cmd.Parameters.AddWithValue("address", (object?)address ?? DBNull.Value);
    var id = (long)(await cmd.ExecuteScalarAsync(ct))!;
    return Results.Accepted("/", new { id, status = "PENDING" });
});
app.MapPost("/admin/submissions/{id:long}/decision",async(long id,DecisionInput input,NpgsqlDataSource db,CancellationToken ct)=>{
    if(input.Status is not ("APPROVED" or "REJECTED"))return Results.BadRequest("Invalid decision");
    if (input.Status == "APPROVED")
    {
        await using var read = db.CreateCommand("SELECT data_json::text, suggested_name, suggested_address FROM submission WHERE submission_id=@id AND status='PENDING'");
        read.Parameters.AddWithValue("id", id);
        SuggestionInput suggestion;
        await using (var reader = await read.ExecuteReaderAsync(ct))
        {
            if (!await reader.ReadAsync(ct)) return Results.Conflict("Not found or already processed");
            try
            {
                suggestion = JsonSerializer.Deserialize<SuggestionInput>(reader.GetString(0), new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? new();
            }
            catch (JsonException) { return Results.BadRequest(new { error = "Thông tin đề xuất chưa đầy đủ. Cần bổ sung trước khi duyệt." }); }
            suggestion = suggestion with {
                BrandName = reader.IsDBNull(1) ? null : reader.GetString(1),
                Address = reader.IsDBNull(2) ? null : reader.GetString(2)
            };
        }
        var isNewBrand = await IsNewBrand(suggestion.BrandName ?? "", db, ct);
        var errors = SuggestionValidation.Validate(suggestion, isNewBrand);
        if (errors.Count > 0) return Results.BadRequest(new { error = "Thông tin đề xuất chưa đầy đủ. Cần bổ sung trước khi duyệt.", errors });
    }
    await using var cmd=db.CreateCommand("UPDATE submission SET status=@status,processed_at=now() WHERE submission_id=@id AND status='PENDING'");
    cmd.Parameters.AddWithValue("status",input.Status);cmd.Parameters.AddWithValue("id",id);
    return await cmd.ExecuteNonQueryAsync(ct)==0?Results.Conflict("Not found or already processed"):Results.NoContent();
});
app.Run();
static async Task<bool> IsNewBrand(string brandName, NpgsqlDataSource db, CancellationToken ct)
{
    await using var cmd = db.CreateCommand("SELECT EXISTS (SELECT 1 FROM brand WHERE lower(btrim(brand_name))=lower(btrim(@name)))");
    cmd.Parameters.AddWithValue("name", brandName);
    return !(bool)(await cmd.ExecuteScalarAsync(ct))!;
}
record DecisionInput(string Status);
