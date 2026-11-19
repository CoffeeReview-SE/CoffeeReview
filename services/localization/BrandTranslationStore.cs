using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

sealed record SavedBrandTranslation(string Description, string SourceHash, string Revision, DateTimeOffset SavedAt);
sealed record SaveBrandTranslation(string Description, string SourceDescription, string? ExpectedRevision);

sealed class BrandTranslationStore
{
    readonly string root;
    readonly ConcurrentDictionary<string, SemaphoreSlim> gates = new();
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    public BrandTranslationStore(IConfiguration config, IHostEnvironment environment)
    {
        var imageRoot = config["Images:UploadDirectory"];
        root = Path.GetFullPath(config["Translations:Directory"] ??
            (string.IsNullOrWhiteSpace(imageRoot) ? Path.Combine(environment.ContentRootPath, "translations", "brands")
                : Path.Combine(imageRoot, ".metadata", "translations", "brands")));
    }
    public static string Hash(string source) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(source)));
    public static bool Supported(string language) => language is "en" or "ja" or "zh";
    string FilePath(long id, string language)
    {
        if (id <= 0 || !Supported(language)) throw new ArgumentException("Invalid translation key.");
        return Path.Combine(root, id.ToString(System.Globalization.CultureInfo.InvariantCulture), language + ".json");
    }
    public async Task<SavedBrandTranslation?> Read(long id, string language, CancellationToken ct)
    {
        var path = FilePath(id, language);
        try { return JsonSerializer.Deserialize<SavedBrandTranslation>(await File.ReadAllTextAsync(path, ct), Json); }
        catch (FileNotFoundException) { return null; }
        catch (DirectoryNotFoundException) { return null; }
    }
    public async Task<SavedBrandTranslation?> Save(long id, string language, SaveBrandTranslation input, CancellationToken ct)
    {
        var path = FilePath(id, language);
        var gate = gates.GetOrAdd(path, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(ct);
        try
        {
            var previous = await Read(id, language, ct);
            if (previous?.Revision != input.ExpectedRevision) return null;
            var saved = new SavedBrandTranslation(input.Description.Trim(), Hash(input.SourceDescription), Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            var temporary = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(saved, Json), ct);
                File.Move(temporary, path, true);
            }
            finally { if (File.Exists(temporary)) File.Delete(temporary); }
            return saved;
        }
        finally { gate.Release(); }
    }
}
