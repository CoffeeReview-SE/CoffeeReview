using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Text.Json;
using System.Text;
using System.Globalization;

sealed class ImageFileStore
{
    public const string UrlPrefix = "/api/submission-images/";
    readonly string uploadDirectory;
    readonly string[] sourceDirectories;
    readonly string[] legacyMediaDirectories;
    readonly SemaphoreSlim gate = new(1, 1);
    readonly Dictionary<string, string> files = new(StringComparer.Ordinal);

    public ImageFileStore(IConfiguration configuration, IHostEnvironment environment)
    {
        var root = FindRoot(environment.ContentRootPath);
        var configuredDirectory = configuration["Images:UploadDirectory"]?.Trim();
        uploadDirectory = string.IsNullOrEmpty(configuredDirectory)
            ? Path.Combine(root, "public", "image")
            : Path.GetFullPath(configuredDirectory, root);
        sourceDirectories = new[] { Path.Combine(root, "public", "image"), Path.Combine(root, "dist", "image"), uploadDirectory }
            .Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        legacyMediaDirectories = new[] { Path.Combine(uploadDirectory, "branch-media"), Path.Combine(root, "public", "image", "uploads", "branch-media") };
    }

    static string FindRoot(string path)
    {
        for (var directory = new DirectoryInfo(path); directory != null; directory = directory.Parent)
            if (Directory.Exists(Path.Combine(directory.FullName, "public", "image")) || Directory.Exists(Path.Combine(directory.FullName, "dist", "image"))) return directory.FullName;
        return path;
    }

    public static bool IsImageUrl(string value) => Regex.IsMatch(value, @"^/api/submission-images/[a-f0-9]{64}\.(png|jpg|webp)$");

    public async Task<string?> StoreAsync(string? value, string brandName, string kind, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(value)) return value;
        value = value.Trim();
        if (IsImageUrl(value))
        {
            if (await ReadAsync(value[UrlPrefix.Length..], ct) is null) throw new ArgumentException("Image no longer exists");
            return value;
        }
        if (!value.StartsWith("data:")) return value;
        if (kind is not ("logo" or "cover" or "menu")) throw new ArgumentException("Invalid image kind");
        if (!SubmissionImages.TryDecode(value, out var bytes, out var mime)) throw new ArgumentException("Invalid image");
        var hash = Convert.ToHexStringLower(SHA256.HashData(bytes));
        var extension = mime switch { "image/png" => ".png", "image/jpeg" => ".jpg", _ => ".webp" };
        var name = hash + extension;
        await gate.WaitAsync(ct);
        try
        {
            // Check existing public images as well as previous uploads, irrespective of their names.
            if (await FindAsync(name, ct) is not null) return UrlPrefix + name;
            var directory = Path.Combine(uploadDirectory, BrandFolder(brandName));
            Directory.CreateDirectory(directory);
            var destination = Path.Combine(directory, kind + extension);
            if (File.Exists(destination) && !await MatchesAsync(destination, hash, ct)) destination = Path.Combine(directory, kind + "-" + hash + extension);
            if (!await MatchesAsync(destination, hash, ct))
            {
                var temporary = Path.Combine(directory, Guid.NewGuid().ToString("N") + ".tmp");
                try
                {
                    await File.WriteAllBytesAsync(temporary, bytes, ct);
                    try { File.Move(temporary, destination); }
                    catch (IOException) when (File.Exists(destination))
                    {
                        if (!await MatchesAsync(destination, hash, ct))
                        {
                            destination = Path.Combine(directory, kind + "-" + hash + extension);
                            try { File.Move(temporary, destination); }
                            catch (IOException) when (File.Exists(destination))
                            { if (!await MatchesAsync(destination, hash, ct)) throw; }
                        }
                    }
                }
                finally { if (File.Exists(temporary)) File.Delete(temporary); }
            }
            files[name] = destination;
            return UrlPrefix + name;
        }
        finally { gate.Release(); }
    }

    public static string BrandFolder(string brandName)
    {
        if (string.IsNullOrWhiteSpace(brandName)) throw new ArgumentException("Missing brand name");
        var normalized = brandName.Trim().ToLowerInvariant().Replace('đ', 'd').Normalize(NormalizationForm.FormD);
        var plain = new string(normalized.Where(character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark).ToArray());
        var slug = Regex.Replace(plain, "[^a-z0-9]+", "-").Trim('-');
        if (slug.Length == 0) slug = "brand-" + Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(brandName.Trim())))[..16];
        if (slug.Length > 100) slug = slug[..80].TrimEnd('-') + "-" + Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(brandName.Trim())))[..16];
        if (Regex.IsMatch(slug, @"^(con|prn|aux|nul|com[1-9]|lpt[1-9])$")) slug = "brand-" + slug;
        return slug;
    }

    public async Task<(byte[] Bytes, string Mime)?> ReadAsync(string name, CancellationToken ct)
    {
        if (!IsImageUrl(UrlPrefix + name)) return null;
        await gate.WaitAsync(ct);
        try
        {
            var path = await FindAsync(name, ct);
            if (path is null) return null;
            var bytes = await File.ReadAllBytesAsync(path, ct);
            if (Convert.ToHexStringLower(SHA256.HashData(bytes)) != name[..64]) return null;
            var mime = Path.GetExtension(name) switch { ".png" => "image/png", ".jpg" => "image/jpeg", _ => "image/webp" };
            if (SubmissionImages.ContentType(bytes) != mime) return null;
            return (bytes, mime);
        }
        finally { gate.Release(); }
    }

    async Task<string?> FindAsync(string name, CancellationToken ct)
    {
        var hash = name[..64];
        if (files.TryGetValue(name, out var cached) && await MatchesAsync(cached, hash, ct)) return cached;
        files.Remove(name);
        var uploaded = Path.Combine(uploadDirectory, name);
        if (await MatchesAsync(uploaded, hash, ct))
        {
            files[name] = uploaded;
            return uploaded;
        }
        await IndexAsync(ct);
        return files.TryGetValue(name, out var indexed) && await MatchesAsync(indexed, hash, ct) ? indexed : null;
    }

    async Task IndexAsync(CancellationToken ct)
    {
        foreach (var directory in sourceDirectories.Where(Directory.Exists))
            foreach (var path in Directory.EnumerateFiles(directory, "*", SearchOption.AllDirectories))
            {
                if (!new[] { ".png", ".jpg", ".jpeg", ".webp" }.Contains(Path.GetExtension(path).ToLowerInvariant())) continue;
                var info = new FileInfo(path);
                if (info.Length == 0 || info.Length > SubmissionImages.MaxBytes) continue;
                var bytes = await File.ReadAllBytesAsync(path, ct);
                var type = SubmissionImages.ContentType(bytes);
                if (type is null) continue;
                var extension = type switch { "image/png" => ".png", "image/jpeg" => ".jpg", _ => ".webp" };
                files.TryAdd(Convert.ToHexStringLower(SHA256.HashData(bytes)) + extension, path);
            }
    }

    static async Task<bool> MatchesAsync(string path, string hash, CancellationToken ct)
    {
        if (!File.Exists(path)) return false;
        await using var stream = File.OpenRead(path);
        return Convert.ToHexStringLower(await SHA256.HashDataAsync(stream, ct)) == hash;
    }

    public async Task<BranchMedia> ReadBranchMediaAsync(long id, CancellationToken ct)
    {
        if (id <= 0) throw new ArgumentException("Invalid branch");
        await gate.WaitAsync(ct);
        try
        {
            var path = BranchMediaPath(id);
            if (!File.Exists(path)) return new(null, new());
            return JsonSerializer.Deserialize<BranchMedia>(await File.ReadAllTextAsync(path, ct), new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? new(null, new());
        }
        finally { gate.Release(); }
    }

    public async Task<BranchMedia> SaveBranchMediaAsync(long id, BranchMedia media, string brandName, CancellationToken ct)
    {
        if (id <= 0 || media.Status is not ("ACTIVE" or "TEMPORARILY_CLOSED" or "CLOSED")) throw new ArgumentException("Invalid branch status");
        var images = new Dictionary<string, string>();
        foreach (var pair in media.Images ?? new())
        {
            if (pair.Key is not ("logoUrl" or "coverUrl" or "menuImageUrl")) throw new ArgumentException("Invalid image field");
            var value = pair.Value?.Trim() ?? "";
            if (value.Length > 0 && !value.StartsWith("data:") && !IsImageUrl(value) &&
                (value.Length > 2000 || value.Any(char.IsWhiteSpace) || !Uri.TryCreate(value, UriKind.Absolute, out var url) || url.Scheme is not ("http" or "https"))) throw new ArgumentException("Invalid image URL");
            var kind = pair.Key switch { "logoUrl" => "logo", "coverUrl" => "cover", _ => "menu" };
            images[pair.Key] = await StoreAsync(value, brandName, kind, ct) ?? "";
        }
        var result = new BranchMedia(media.Status, images, Guid.NewGuid().ToString("N"));
        var directory = Path.Combine(uploadDirectory, ".metadata", "branches");
        var path = Path.Combine(directory, id + ".json");
        await gate.WaitAsync(ct);
        try
        {
            Directory.CreateDirectory(directory);
            var currentPath = BranchMediaPath(id);
            var current = File.Exists(currentPath) ? JsonSerializer.Deserialize<BranchMedia>(await File.ReadAllTextAsync(currentPath, ct), new JsonSerializerOptions(JsonSerializerDefaults.Web)) : null;
            if (current?.Version != media.Version) throw new BranchMediaConflictException();
            var temporary = Path.Combine(directory, Guid.NewGuid().ToString("N") + ".tmp");
            try
            {
                await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(result, new JsonSerializerOptions(JsonSerializerDefaults.Web)), ct);
                File.Move(temporary, path, true);
            }
            finally { if (File.Exists(temporary)) File.Delete(temporary); }
        }
        finally { gate.Release(); }
        return result;
    }

    string BranchMediaPath(long id)
    {
        var current = Path.Combine(uploadDirectory, ".metadata", "branches", id + ".json");
        if (File.Exists(current)) return current;
        return legacyMediaDirectories.Select(directory => Path.Combine(directory, id + ".json")).FirstOrDefault(File.Exists) ?? current;
    }
}

record BranchMedia(string? Status, Dictionary<string, string> Images, string? Version = null);
sealed class BranchMediaConflictException : Exception;
