using Npgsql;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5104"}");
var cs = builder.Configuration.GetConnectionString("Supabase") ?? throw new InvalidOperationException("ConnectionStrings:Supabase missing");
builder.Services.AddSingleton(NpgsqlDataSource.Create(cs));
var app = builder.Build();
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
    await using var cmd=db.CreateCommand("SELECT submission_id,target_type,COALESCE(suggested_name,''),COALESCE(suggested_address,''),status,created_at,COALESCE(created_by::text,''),data_json::text FROM submission ORDER BY created_at DESC LIMIT 500");
    await using var r=await cmd.ExecuteReaderAsync();var list=new List<object>();while(await r.ReadAsync())list.Add(new{id=r.GetInt64(0),targetType=r.GetString(1),name=r.GetString(2),address=r.GetString(3),status=r.GetString(4),createdAt=r.GetDateTime(5),author=r.GetString(6),dataJson=r.GetString(7)});return Results.Ok(list);
});
app.MapPost("/", async (SuggestionInput input, NpgsqlDataSource db, CancellationToken ct) =>
{
    var name = input.Name?.Trim();
    var phone = input.Phone?.Trim();
    var brandName = input.BrandName?.Trim();
    var address = input.Address?.Trim();
    var note = input.Note?.Trim();
    if (string.IsNullOrWhiteSpace(name) || name.Length > 160 ||
        string.IsNullOrWhiteSpace(phone) || phone.Length > 30 ||
        string.IsNullOrWhiteSpace(brandName) || brandName.Length > 180 ||
        address?.Length > 2000 || note?.Length > 2000)
        return Results.BadRequest(new { error = "Please provide a name, phone number, and brand name within the allowed lengths." });

    var targetType = string.IsNullOrWhiteSpace(address) ? "BRAND" : "BRANCH";
    var details = System.Text.Json.JsonSerializer.Serialize(new { contactName = name, phone, note });
    await using var cmd = db.CreateCommand("""
        INSERT INTO submission(target_type, data_json, suggested_name, suggested_address)
        VALUES (@type, @data::jsonb, @name, @address)
        RETURNING submission_id
        """);
    cmd.Parameters.AddWithValue("type", targetType);
    cmd.Parameters.AddWithValue("data", details);
    cmd.Parameters.AddWithValue("name", brandName);
    cmd.Parameters.AddWithValue("address", (object?)address ?? DBNull.Value);
    var id = (long)(await cmd.ExecuteScalarAsync(ct))!;
    return Results.Accepted("/", new { id, status = "PENDING" });
});
app.MapPost("/admin/submissions/{id:long}/decision",async(long id,DecisionInput input,NpgsqlDataSource db)=>{
    if(input.Status is not ("APPROVED" or "REJECTED"))return Results.BadRequest("Invalid decision");
    await using var cmd=db.CreateCommand("UPDATE submission SET status=@status,processed_at=now() WHERE submission_id=@id AND status='PENDING'");
    cmd.Parameters.AddWithValue("status",input.Status);cmd.Parameters.AddWithValue("id",id);
    return await cmd.ExecuteNonQueryAsync()==0?Results.Conflict("Not found or already processed"):Results.NoContent();
});
app.Run();
record DecisionInput(string Status);
record SuggestionInput(string? Name, string? Phone, string? BrandName, string? Address, string? Note);
