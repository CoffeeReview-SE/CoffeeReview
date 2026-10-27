using Npgsql;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5105"}");
var cs = builder.Configuration.GetConnectionString("Supabase")
    ?? throw new InvalidOperationException("Missing ConnectionStrings:Supabase");
builder.Services.AddSingleton(NpgsqlDataSource.Create(cs));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("track", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromMinutes(1) }));
});
var app = builder.Build();
app.UseRateLimiter();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/track", async (TrackRequest req, HttpContext context, NpgsqlDataSource db, IConfiguration cfg) =>
{
    // Only Gateway is allowed to call this service. Keep service private in production.
    if (!ValidKey(context, cfg)) return Results.Unauthorized();
    if (req.VisitorId == Guid.Empty || req.SessionId == Guid.Empty ||
        string.IsNullOrWhiteSpace(req.PagePath) || req.PagePath.Length > 2048 ||
        !req.PagePath.StartsWith('/') || req.PagePath.StartsWith("//") ||
        req.PagePath.StartsWith("/admin", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest(new { error = "Invalid tracking data" });

    await using var conn = await db.OpenConnectionAsync();
    await using var tx = await conn.BeginTransactionAsync();
    await using (var cmd = new NpgsqlCommand("""
        INSERT INTO visit_session (session_id, visitor_id, last_activity_at)
        VALUES (@session, @visitor, NOW())
        ON CONFLICT (session_id) DO UPDATE
        SET last_activity_at = NOW()
        WHERE visit_session.visitor_id = EXCLUDED.visitor_id
        """, conn, tx))
    {
        cmd.Parameters.AddWithValue("session", req.SessionId);
        cmd.Parameters.AddWithValue("visitor", req.VisitorId);
        if (await cmd.ExecuteNonQueryAsync() == 0)
            return Results.Conflict(new { error = "Session ID conflict" });
    }
    await using (var cmd = new NpgsqlCommand(
        "INSERT INTO page_view (session_id, page_path) VALUES (@session, @path)", conn, tx))
    {
        cmd.Parameters.AddWithValue("session", req.SessionId);
        cmd.Parameters.AddWithValue("path", req.PagePath);
        await cmd.ExecuteNonQueryAsync();
    }
    await tx.CommitAsync();
    return Results.Ok(new { tracked = true });
}).RequireRateLimiting("track");

app.MapGet("/admin/summary", async (HttpContext context, NpgsqlDataSource db, IConfiguration cfg) =>
{
    // Development scaffold only: Gateway admin authentication/authorization is required before production.
    if (!ValidKey(context, cfg)) return Results.Unauthorized();
    await using var cmd = db.CreateCommand("""
        SELECT
          (SELECT COUNT(DISTINCT visitor_id) FROM visit_session WHERE NOT is_admin_session),
          (SELECT COUNT(*) FROM visit_session WHERE NOT is_admin_session),
          (SELECT COUNT(*) FROM page_view pv JOIN visit_session vs USING(session_id)
           WHERE NOT vs.is_admin_session)
        """);
    await using var reader = await cmd.ExecuteReaderAsync();
    await reader.ReadAsync();
    return Results.Ok(new { visitors = reader.GetInt64(0), sessions = reader.GetInt64(1), pageViews = reader.GetInt64(2) });
});
app.Run();

static bool ValidKey(HttpContext ctx, IConfiguration cfg)
{
    var expected = cfg["Gateway:SharedKey"];
    if (string.IsNullOrWhiteSpace(expected)) return false;
    var supplied = ctx.Request.Headers["X-Gateway-Key"].ToString();
    var a = Encoding.UTF8.GetBytes(expected);
    var b = Encoding.UTF8.GetBytes(supplied);
    return CryptographicOperations.FixedTimeEquals(a, b);
}

record TrackRequest(Guid VisitorId, Guid SessionId, string PagePath);
