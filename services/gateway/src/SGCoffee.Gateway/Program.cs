using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// Railway sets PORT. Locally the default is 5100 because the Vite dev server already uses 8080
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5100"}");

// Behind Railway's proxy: read the real client IP from X-Forwarded-For (used by the rate limiter)
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

var adminEnabled = cfg.GetValue<bool>("Admin:Enabled");      // false = /api/admin/* returns 404
var gatewayKey = cfg["Gateway:SharedKey"] ?? "";
var edgeSecret = cfg["Gateway:EdgeSecret"] ?? "";
var corsOrigins = cfg.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();

// ---- Rate limiting for public write endpoints ----
static string ClientKey(HttpContext c) =>
    c.Request.Headers["X-Client-Ip"].FirstOrDefault()
    ?? c.Connection.RemoteIpAddress?.ToString()
    ?? "unknown";

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("public-write", c => RateLimitPartition.GetFixedWindowLimiter(
        "w:" + ClientKey(c),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
    o.AddPolicy("tracking", c => RateLimitPartition.GetFixedWindowLimiter(
        "t:" + ClientKey(c),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1) }));
});

// ---- CORS (needed for local dev; in production the web app calls /api on its own origin) ----
builder.Services.AddCors(o => o.AddPolicy("web", p =>
    p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod()));

// ---- YARP reverse proxy ----
builder.Services
    .AddReverseProxy()
    .LoadFromConfig(cfg.GetSection("ReverseProxy"))
    .AddTransforms(ctx => ctx.AddRequestTransform(t =>
    {
        var h = t.ProxyRequest.Headers;
        h.Remove("X-Gateway-Key"); // never trust a value sent by the client
        if (!string.IsNullOrEmpty(gatewayKey)) h.TryAddWithoutValidation("X-Gateway-Key", gatewayKey);
        return ValueTask.CompletedTask;
    }));

var app = builder.Build();

app.UseForwardedHeaders();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Only accept traffic that came through the Cloudflare Pages proxy (skipped when no secret is set, e.g. local dev)
app.Use(async (ctx, next) =>
{
    if (edgeSecret != "" && ctx.Request.Path != "/health" &&
        ctx.Request.Headers["X-Edge-Secret"] != edgeSecret)
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return;
    }
    await next();
});

// Admin switch: no login, so admin routes only exist while Admin:Enabled=true
app.Use(async (ctx, next) =>
{
    var isSummaryEndpoint =
        HttpMethods.IsGet(ctx.Request.Method) &&
        ctx.Request.Path.Equals(
            "/api/admin/analytics/summary",
            StringComparison.OrdinalIgnoreCase);

    if (!isSummaryEndpoint &&
        !adminEnabled &&
        ctx.Request.Path.StartsWithSegments("/api/admin"))
    {
        ctx.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    await next();
});

app.UseCors();
app.UseRateLimiter();
app.MapReverseProxy();

app.Run();