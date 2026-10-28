using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;

// Run isolated local services with temporary credentials and only read production data.
var root = Directory.GetCurrentDirectory();
var processes = new List<Process>();
var key = Guid.NewGuid().ToString("N");
var password = Guid.NewGuid().ToString("N");
var hash = new PasswordHasher<string>().HashPassword("smoke-admin", password);
var ports = Enumerable.Range(0, 4).Select(_ => FreePort()).ToArray();
try
{
    Start("services/analytics/src/SGCoffee.Analytics/bin/Debug/net10.0/SGCoffee.Analytics.dll", "services/analytics/src/SGCoffee.Analytics", ports[0]);
    Start(".tmp/catalog-check/SGCoffee.Catalog.dll", "services/catalog/src/SGCoffee.Catalog", ports[1]);
    Start("services/gateway/src/SGCoffee.Gateway/bin/Debug/net10.0/SGCoffee.Gateway.dll", "services/gateway/src/SGCoffee.Gateway", ports[2], true);
    Start("services/gateway/src/SGCoffee.Gateway/bin/Debug/net10.0/SGCoffee.Gateway.dll", "services/gateway/src/SGCoffee.Gateway", ports[3], false);
    using var client = new HttpClient(new HttpClientHandler { CookieContainer = new CookieContainer() }) { BaseAddress = new Uri($"http://localhost:{ports[2]}"), Timeout = TimeSpan.FromSeconds(20) };
    foreach (var port in ports)
    {
        var healthy = false;
        for (var attempt = 0; attempt < 50; attempt++)
        {
            try { healthy = (await client.GetAsync($"http://localhost:{port}/health")).IsSuccessStatusCode; } catch (HttpRequestException) { }
            if (healthy) break;
            await Task.Delay(200);
        }
        Check(healthy, "service health");
    }
    Check((await client.GetAsync("/api/admin/analytics/summary")).StatusCode == HttpStatusCode.Unauthorized, "anonymous admin blocked");
    Check((await client.GetAsync($"http://localhost:{ports[3]}/api/admin/analytics/summary")).StatusCode == HttpStatusCode.NotFound, "disabled admin summary blocked");
    Check((await client.GetAsync($"http://localhost:{ports[0]}/admin/summary")).StatusCode == HttpStatusCode.Unauthorized, "direct service blocked");
    Check((await client.PostAsJsonAsync("/api/admin/auth/login", new { username = "smoke-admin", password })).StatusCode == HttpStatusCode.Forbidden, "login CSRF header required");
    client.DefaultRequestHeaders.Add("X-Admin-Request", "1");
    Check((await client.PostAsJsonAsync("/api/admin/auth/login", new { username = "smoke-admin", password = "incorrect" })).StatusCode == HttpStatusCode.Unauthorized, "incorrect password rejected");
    var login = await client.PostAsJsonAsync("/api/admin/auth/login", new { username = "smoke-admin", password });
    Check(login.IsSuccessStatusCode, "cookie login succeeds");
    var cookie = string.Join(";", login.Headers.GetValues("Set-Cookie"));
    Check(cookie.Contains("httponly", StringComparison.OrdinalIgnoreCase) && cookie.Contains("samesite=strict", StringComparison.OrdinalIgnoreCase)
        && cookie.Contains("path=/api/admin", StringComparison.OrdinalIgnoreCase), "cookie security flags");
    var response = await client.GetAsync("/api/admin/analytics/summary");
    Check(response.IsSuccessStatusCode, "Supabase dashboard summary succeeds");
    var summary = await response.Content.ReadFromJsonAsync<JsonElement>();
    Check(summary.GetProperty("sessions").GetInt64() == summary.GetProperty("active").GetInt64() + summary.GetProperty("inactive").GetInt64(), "session counts reconcile");
    Check(summary.GetProperty("audioByBrand").EnumerateArray().Sum(x => x.GetProperty("plays").GetInt64()) == summary.GetProperty("audioPlays").GetInt64(), "brand totals reconcile");
    Check(summary.GetProperty("audioByLanguage").EnumerateArray().Sum(x => x.GetProperty("plays").GetInt64()) == summary.GetProperty("audioPlays").GetInt64(), "language totals reconcile");
    foreach (var route in new[] { "active-sessions", "audio-by-brand", "audio-by-language" })
        Check((await client.GetAsync("/api/admin/analytics/" + route)).IsSuccessStatusCode, route);
    Check((await client.PostAsJsonAsync("/api/analytics/track", new { visitorId = Guid.Empty, sessionId = Guid.Empty, pagePath = "/" })).StatusCode == HttpStatusCode.BadRequest, "invalid tracking rejected");
    Check((await client.PostAsJsonAsync("/api/analytics/heartbeat", new { visitorId = Guid.NewGuid(), sessionId = Guid.NewGuid() })).StatusCode == HttpStatusCode.NotFound, "unknown heartbeat rejected");
    Check((await client.GetAsync("/api/catalog/brands/2")).IsSuccessStatusCode, "real brand description endpoint");
    client.DefaultRequestHeaders.Remove("X-Admin-Request");
    Check((await client.PostAsJsonAsync("/api/admin/auth/logout", new { })).StatusCode == HttpStatusCode.Forbidden, "authenticated writes require CSRF header");
    client.DefaultRequestHeaders.Add("X-Admin-Request", "1");
    Check((await client.PostAsJsonAsync("/api/admin/auth/logout", new { })).IsSuccessStatusCode, "logout succeeds");
    Check((await client.GetAsync("/api/admin/analytics/summary")).StatusCode == HttpStatusCode.Unauthorized, "logout revokes browser cookie");
    for (var i = 0; i < 3; i++) await client.PostAsJsonAsync("/api/admin/auth/login", new { username = "smoke-admin", password = "incorrect" });
    Check((await client.PostAsJsonAsync("/api/admin/auth/login", new { username = "smoke-admin", password = "incorrect" })).StatusCode == HttpStatusCode.TooManyRequests, "login rate limit");
    Console.WriteLine("API smoke checks passed; no tracking or audio test records created.");
    return 0;
}
catch (Exception error)
{
    Console.Error.WriteLine($"API smoke failed: {error.GetType().Name}: {error.Message}");
    return 1;
}
finally { foreach (var process in processes) { if (!process.HasExited) process.Kill(true); process.Dispose(); } }

void Start(string dll, string directory, int port, bool? enabled = null)
{
    var info = new ProcessStartInfo("dotnet") { WorkingDirectory = Path.Combine(root, directory), UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
    info.ArgumentList.Add(Path.Combine(root, dll));
    info.Environment["PORT"] = port.ToString();
    info.Environment["ASPNETCORE_ENVIRONMENT"] = "Development";
    info.Environment["Gateway__SharedKey"] = key;
    info.Environment["Gateway__EdgeSecret"] = "";
    if (enabled.HasValue)
    {
        info.Environment["Admin__Enabled"] = enabled.Value.ToString();
        info.Environment["Admin__Username"] = "smoke-admin";
        info.Environment["Admin__PasswordHash"] = hash;
        info.Environment["ReverseProxy__Clusters__analytics__Destinations__d1__Address"] = $"http://localhost:{ports[0]}";
        info.Environment["ReverseProxy__Clusters__catalog__Destinations__d1__Address"] = $"http://localhost:{ports[1]}";
    }
    var process = Process.Start(info)!;
    process.OutputDataReceived += (_, _) => { }; process.ErrorDataReceived += (_, _) => { };
    process.BeginOutputReadLine(); process.BeginErrorReadLine(); processes.Add(process);
}
static void Check(bool condition, string label) { if (!condition) throw new InvalidOperationException(label); Console.WriteLine("PASS " + label); }
static int FreePort()
{
    var listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
    listener.Start(); var port = ((IPEndPoint)listener.LocalEndpoint).Port; listener.Stop(); return port;
}
