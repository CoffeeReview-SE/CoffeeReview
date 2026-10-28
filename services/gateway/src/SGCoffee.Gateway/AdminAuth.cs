using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;

static class AdminAuth
{
    public const string Scheme = "AdminCookie";

    // Configure an HttpOnly admin cookie and return API status codes instead of redirects.
    public static void AddAdminAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.AddAuthentication(Scheme).AddCookie(Scheme, options =>
        {
            options.Cookie.Name = "SGCoffee.Admin";
            options.Cookie.Path = "/api/admin";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
            options.ExpireTimeSpan = TimeSpan.FromHours(8);
            options.SlidingExpiration = false;
            options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
            options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
        });
    }

    // Authenticate the configured administrator without exposing credentials to frontend code.
    public static void MapAdminAuthentication(this WebApplication app)
    {
        app.MapPost("/api/admin/auth/login", async (AdminLogin input, HttpContext ctx, IConfiguration cfg) =>
        {
            var username = cfg["Admin:Username"];
            var hash = cfg["Admin:PasswordHash"];
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(hash))
                return Results.Problem("Admin credentials are not configured", statusCode: 503);
            if (string.IsNullOrEmpty(input.Password) || input.Password.Length > 1024 || input.Username != username)
                return Results.Unauthorized();
            PasswordVerificationResult verified;
            try { verified = new PasswordHasher<string>().VerifyHashedPassword(username, hash, input.Password); }
            catch (FormatException) { return Results.Problem("Invalid admin configuration", statusCode: 503); }
            if (verified == PasswordVerificationResult.Failed) return Results.Unauthorized();
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, username), new Claim(ClaimTypes.Role, "Admin")
            }, Scheme));
            await ctx.SignInAsync(Scheme, principal);
            return Results.Ok(new { authenticated = true });
        }).RequireRateLimiting("admin-login");
        app.MapGet("/api/admin/auth/session", (HttpContext ctx) =>
            Results.Ok(new { authenticated = true, username = ctx.User.Identity?.Name }));
        app.MapPost("/api/admin/auth/logout", async (HttpContext ctx) =>
        {
            await ctx.SignOutAsync(Scheme);
            return Results.NoContent();
        });
    }
}
record AdminLogin(string Username, string Password);
