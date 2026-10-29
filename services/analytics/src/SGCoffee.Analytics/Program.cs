using Npgsql;
using System.Security.Cryptography;
using System.Text;
using System.Data;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5105"}");
var cs = builder.Configuration.GetConnectionString("Supabase")
    ?? throw new InvalidOperationException("Missing ConnectionStrings:Supabase");
builder.Services.AddSingleton(NpgsqlDataSource.Create(cs));
var app = builder.Build();
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path != "/health" && !ValidKey(ctx, app.Configuration))
    {
        ctx.Response.StatusCode = 401;
        return;
    }
    try { await next(); }
    catch (NpgsqlException)
    {
        ctx.Response.StatusCode = 503;
        await ctx.Response.WriteAsJsonAsync(new { error = "Analytics database unavailable" });
    }
});
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/track", async (TrackRequest req, NpgsqlDataSource db) =>
{
    if (req.VisitorId == Guid.Empty || req.SessionId == Guid.Empty || req.EventId == Guid.Empty ||
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
          AND visit_session.ended_at IS NULL AND NOT visit_session.is_admin_session
        """, conn, tx))
    {
        cmd.Parameters.AddWithValue("session", req.SessionId);
        cmd.Parameters.AddWithValue("visitor", req.VisitorId);
        if (await cmd.ExecuteNonQueryAsync() == 0)
            return Results.Conflict(new { error = "Session ID conflict" });
    }
    await using (var cmd = new NpgsqlCommand(
        "INSERT INTO page_view (session_id, page_path, event_id) VALUES (@session, @path, @event) ON CONFLICT (event_id) DO NOTHING", conn, tx))
    {
        cmd.Parameters.AddWithValue("session", req.SessionId);
        cmd.Parameters.AddWithValue("path", req.PagePath);
        cmd.Parameters.AddWithValue("event", req.EventId);
        await cmd.ExecuteNonQueryAsync();
    }
    await tx.CommitAsync();
    return Results.Ok(new { tracked = true });
});

app.MapPost("/heartbeat", async (SessionRequest req, NpgsqlDataSource db) =>
{
    if (!ValidSession(req)) return Results.BadRequest();
    await using var cmd = db.CreateCommand("""
        UPDATE public.visit_session SET last_activity_at = NOW()
        WHERE session_id = @session AND visitor_id = @visitor
          AND ended_at IS NULL AND NOT is_admin_session
        """);
    cmd.Parameters.AddWithValue("session", req.SessionId);
    cmd.Parameters.AddWithValue("visitor", req.VisitorId);
    return await cmd.ExecuteNonQueryAsync() == 1 ? Results.NoContent() : Results.NotFound();
});
app.MapPost("/end-session", async (SessionRequest req, NpgsqlDataSource db) =>
{
    if (!ValidSession(req)) return Results.BadRequest();
    await using var cmd = db.CreateCommand("""
        INSERT INTO public.visit_session(session_id, visitor_id, ended_at)
        VALUES (@session, @visitor, NOW())
        ON CONFLICT (session_id) DO UPDATE SET ended_at = COALESCE(visit_session.ended_at, NOW())
        WHERE visit_session.visitor_id = EXCLUDED.visitor_id AND NOT visit_session.is_admin_session
        """);
    cmd.Parameters.AddWithValue("session", req.SessionId);
    cmd.Parameters.AddWithValue("visitor", req.VisitorId);
    await cmd.ExecuteNonQueryAsync();
    return Results.NoContent();
});
app.MapPost("/audio-play", async (AudioRequest req, NpgsqlDataSource db) =>
{
    if (req.VisitorId == Guid.Empty || req.SessionId == Guid.Empty || req.EventId == Guid.Empty ||
        req.BrandId <= 0 || req.BranchId is <= 0 || string.IsNullOrWhiteSpace(req.LanguageCode) || req.LanguageCode.Length > 10)
        return Results.BadRequest(new { error = "Invalid audio data" });
    await using var cmd = db.CreateCommand("""
        INSERT INTO public.audio_play(session_id, brand_id, branch_id, language_code, event_id)
        SELECT vs.session_id, b.brand_id, @branch, l.language_code, @event
        FROM public.visit_session vs
        JOIN public.brand b ON b.brand_id = @brand AND b.is_active
        JOIN public.language l ON l.language_code = @language AND l.is_enabled
        WHERE vs.session_id = @session AND vs.visitor_id = @visitor
          AND vs.ended_at IS NULL AND NOT vs.is_admin_session
          AND (@branch IS NULL OR EXISTS (
              SELECT 1 FROM public.branch br WHERE br.branch_id = @branch
                AND br.brand_id = b.brand_id AND br.is_active))
        ON CONFLICT (event_id) DO NOTHING
        """);
    cmd.Parameters.AddWithValue("session", req.SessionId);
    cmd.Parameters.AddWithValue("visitor", req.VisitorId);
    cmd.Parameters.AddWithValue("brand", req.BrandId);
    cmd.Parameters.AddWithValue("branch", NpgsqlTypes.NpgsqlDbType.Bigint, (object?)req.BranchId ?? DBNull.Value);
    cmd.Parameters.AddWithValue("language", req.LanguageCode);
    cmd.Parameters.AddWithValue("event", req.EventId);
    if (await cmd.ExecuteNonQueryAsync() == 1) return Results.Ok(new { tracked = true });
    await using var duplicate = db.CreateCommand("""
        SELECT EXISTS(SELECT 1 FROM public.audio_play a JOIN public.visit_session vs USING(session_id)
          WHERE a.event_id = @event AND a.session_id = @session AND vs.visitor_id = @visitor
            AND a.brand_id = @brand AND a.language_code = @language AND a.branch_id IS NOT DISTINCT FROM @branch)
        """);
    duplicate.Parameters.AddWithValue("event", req.EventId);
    duplicate.Parameters.AddWithValue("session", req.SessionId);
    duplicate.Parameters.AddWithValue("visitor", req.VisitorId);
    duplicate.Parameters.AddWithValue("brand", req.BrandId);
    duplicate.Parameters.AddWithValue("language", req.LanguageCode);
    duplicate.Parameters.AddWithValue("branch", NpgsqlTypes.NpgsqlDbType.Bigint, (object?)req.BranchId ?? DBNull.Value);
    return (bool)(await duplicate.ExecuteScalarAsync())! ? Results.Ok(new { tracked = true })
        : Results.BadRequest(new { error = "Session, brand, language or branch unavailable" });
});
app.MapGet("/admin/summary", async (NpgsqlDataSource db) => Results.Ok(await ReadDashboard(db)));
app.MapGet("/admin/active-sessions", async (NpgsqlDataSource db) => Results.Ok((await ReadDashboard(db)).RecentSessions));
app.MapGet("/admin/audio-by-brand", async (NpgsqlDataSource db) => Results.Ok((await ReadDashboard(db)).AudioByBrand));
app.MapGet("/admin/audio-by-language", async (NpgsqlDataSource db) => Results.Ok((await ReadDashboard(db)).AudioByLanguage));
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

// Read dashboard figures from one consistent database snapshot.
static async Task<Dashboard> ReadDashboard(NpgsqlDataSource db)
{
    await using var conn = await db.OpenConnectionAsync();
    await using var tx = await conn.BeginTransactionAsync(IsolationLevel.RepeatableRead);
    await using var cmd = new NpgsqlCommand("""
        SELECT COUNT(DISTINCT visitor_id), COUNT(*),
          COUNT(*) FILTER (WHERE ended_at IS NULL AND last_activity_at >= NOW() - INTERVAL '30 seconds'),
          (SELECT COUNT(*) FROM public.page_view pv JOIN public.visit_session vs USING(session_id) WHERE NOT vs.is_admin_session),
          (SELECT COUNT(*) FROM public.audio_play a LEFT JOIN public.visit_session vs USING(session_id)
             WHERE COALESCE(vs.is_admin_session, false) = false), NOW()
        FROM public.visit_session WHERE NOT is_admin_session;
        SELECT COALESCE(b.brand_name, 'Không xác định'), COUNT(*)
        FROM public.audio_play a LEFT JOIN public.brand b USING(brand_id)
        LEFT JOIN public.visit_session vs USING(session_id)
        WHERE COALESCE(vs.is_admin_session, false) = false
        GROUP BY a.brand_id, b.brand_name ORDER BY COUNT(*) DESC, b.brand_name;
        SELECT a.language_code, l.language_name_vi, COUNT(*)
        FROM public.audio_play a JOIN public.language l USING(language_code)
        LEFT JOIN public.visit_session vs USING(session_id)
        WHERE COALESCE(vs.is_admin_session, false) = false
        GROUP BY a.language_code, l.language_name_vi ORDER BY COUNT(*) DESC, a.language_code;
        SELECT ended_at IS NULL AND last_activity_at >= NOW() - INTERVAL '45 seconds',
          started_at, last_activity_at
        FROM public.visit_session WHERE NOT is_admin_session ORDER BY last_activity_at DESC LIMIT 50;
        """, conn, tx);
    await using var r = await cmd.ExecuteReaderAsync();
    await r.ReadAsync();
    var visitors = r.GetInt64(0); var sessions = r.GetInt64(1); var active = r.GetInt64(2);
    var views = r.GetInt64(3); var plays = r.GetInt64(4); var updated = r.GetDateTime(5);
    var brands = new List<BrandCount>(); var languages = new List<LanguageCount>(); var recent = new List<SessionStatus>();
    await r.NextResultAsync();
    while (await r.ReadAsync()) brands.Add(new(r.GetString(0), r.GetInt64(1)));
    await r.NextResultAsync();
    while (await r.ReadAsync()) languages.Add(new(r.GetString(0), r.GetString(1), r.GetInt64(2)));
    await r.NextResultAsync();
    while (await r.ReadAsync()) recent.Add(new(r.GetBoolean(0), r.GetDateTime(1), r.GetDateTime(2)));
    await r.CloseAsync();
    await tx.CommitAsync();
    return new(visitors, sessions, active, sessions - active, views, plays, updated, brands, languages, recent);
}
static bool ValidSession(SessionRequest req) => req.VisitorId != Guid.Empty && req.SessionId != Guid.Empty;
record SessionRequest(Guid VisitorId, Guid SessionId);
record TrackRequest(Guid VisitorId, Guid SessionId, string PagePath, Guid EventId);
record AudioRequest(Guid VisitorId, Guid SessionId, long BrandId, string LanguageCode, Guid EventId, long? BranchId);
record BrandCount(string Name, long Plays);
record LanguageCount(string Code, string Name, long Plays);
record SessionStatus(bool IsActive, DateTime StartedAt, DateTime LastActivityAt);
record Dashboard(long Visitors, long Sessions, long Active, long Inactive, long PageViews, long AudioPlays,
    DateTime UpdatedAt, List<BrandCount> AudioByBrand, List<LanguageCount> AudioByLanguage, List<SessionStatus> RecentSessions);
