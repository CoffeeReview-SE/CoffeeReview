using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

static class RoutingEndpoints
{
    public static void MapCoffeeRoutes(this WebApplication app)
    {
        // Bounded cache; coordinates are never logged or persisted.
        var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 500 });
        app.Lifetime.ApplicationStopped.Register(cache.Dispose);
        app.MapGet("/api/routes", async (double startLat, double startLng, double endLat, double endLng,
            string mode, IConfiguration config, IHttpClientFactory clients, CancellationToken ct) =>
        {
            if (mode is not ("motorcycle" or "walk") || !Valid(startLat, startLng) || !Valid(endLat, endLng))
                return Results.BadRequest(new { error = "invalid_route" });
            var key = config["Routing:GeoapifyApiKey"]?.Trim();
            if (string.IsNullOrEmpty(key))
                return Results.Json(new { error = "routing_not_configured" }, statusCode: 503);
            var points = FormattableString.Invariant($"{startLat:F5},{startLng:F5}|{endLat:F5},{endLng:F5}");
            var cacheKey = mode + ":" + points;
            if (cache.TryGetValue<RouteOptions>(cacheKey, out var saved)) return Results.Ok(saved);
            try
            {
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
                timeout.CancelAfter(TimeSpan.FromSeconds(20));
                async Task<RouteResult[]> FetchRoutes(string options)
                {
                    using var response = await clients.CreateClient("routing").GetAsync(
                        "https://api.geoapify.com/v1/routing?waypoints=" + Uri.EscapeDataString(points)
                        + "&mode=" + mode + "&units=metric&" + options + "&apiKey=" + Uri.EscapeDataString(key), timeout.Token);
                    if (!response.IsSuccessStatusCode)
                        throw new HttpRequestException("Routing provider unavailable", null, response.StatusCode);
                    using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(timeout.Token), cancellationToken: timeout.Token);
                    var features = json.RootElement.GetProperty("features");
                    var routes = new List<RouteResult>();
                    foreach (var feature in features.EnumerateArray())
                    {
                        var properties = feature.GetProperty("properties");
                        var geometry = feature.GetProperty("geometry");
                        var coordinates = geometry.GetProperty("coordinates");
                        double[][] ConvertLine(JsonElement line) => line.EnumerateArray()
                            .Select(p => new[] { p[1].GetDouble(), p[0].GetDouble() }).ToArray();
                        var paths = geometry.GetProperty("type").GetString() switch
                        {
                            "MultiLineString" => coordinates.EnumerateArray().Select(ConvertLine).ToArray(),
                            "LineString" => new[] { ConvertLine(coordinates) },
                            _ => throw new JsonException()
                        };
                        if (paths.Length == 0 || paths.Any(p => p.Length < 2)) continue;
                        var distance = properties.GetProperty("distance").GetDouble();
                        var duration = properties.GetProperty("time").GetDouble();
                        if (double.IsFinite(distance) && distance >= 0 && double.IsFinite(duration) && duration >= 0)
                            routes.Add(new RouteResult(paths, distance, duration));
                    }
                    return routes.ToArray();
                }
                // Keep successful suggestions when an optional provider request fails.
                async Task<RouteResult[]> TryFetchRoutes(string options)
                {
                    try { return await FetchRoutes(options); }
                    catch (Exception ex) when (!ct.IsCancellationRequested &&
                        ex is HttpRequestException or JsonException or InvalidOperationException or KeyNotFoundException or OperationCanceledException)
                    { return Array.Empty<RouteResult>(); }
                }
                var shortest = await FetchRoutes("type=short");
                if (shortest.Length == 0) return Results.NotFound(new { error = "route_not_found" });
                // Ask for another road corridor by avoiding an interior point of the shortest route.
                var line = shortest[0].Paths.OrderByDescending(path => path.Length).First();
                var middle = line[line.Length / 2];
                var avoid = Uri.EscapeDataString(FormattableString.Invariant($"location:{middle[0]:F6},{middle[1]:F6}"));
                var suggestions = await Task.WhenAll(
                    TryFetchRoutes("type=balanced"),
                    line.Length > 2 ? TryFetchRoutes("type=short&avoid=" + avoid) : Task.FromResult(Array.Empty<RouteResult>()));
                var routes = shortest.Concat(suggestions.SelectMany(items => items))
                    .DistinctBy(route => JsonSerializer.Serialize(route.Paths))
                    .OrderBy(route => route.DistanceMeters).ThenBy(route => route.DurationSeconds).Take(3).ToArray();
                var best = routes[0];
                var result = new RouteOptions(best.Paths, best.DistanceMeters, best.DurationSeconds, routes);
                cache.Set(cacheKey, result, new MemoryCacheEntryOptions { Size = 1, AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) });
                return Results.Ok(result);
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            { return Results.Json(new { error = "routing_timeout" }, statusCode: 504); }
            catch (HttpRequestException ex)
            { return Results.Json(new { error = ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests
                ? "routing_quota" : "routing_unavailable" }, statusCode: 503); }
            catch (Exception ex) when (ex is JsonException or InvalidOperationException or KeyNotFoundException)
            { return Results.Json(new { error = "routing_unavailable" }, statusCode: 502); }
        }).RequireRateLimiting("routing");
    }

    static bool Valid(double lat, double lng) => double.IsFinite(lat) && double.IsFinite(lng)
        && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    record RouteResult(double[][][] Paths, double DistanceMeters, double DurationSeconds);
    record RouteOptions(double[][][] Paths, double DistanceMeters, double DurationSeconds, RouteResult[] Routes);
}
