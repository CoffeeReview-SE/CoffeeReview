static class SubmissionImages
{
    public const int MaxBytes = 2 * 1024 * 1024;

    public static bool TryDecode(string value, out byte[] bytes, out string contentType)
    {
        bytes = Array.Empty<byte>();
        contentType = "";
        var comma = value.IndexOf(',');
        if (comma < 0 || value.Length - comma - 1 > ((MaxBytes + 2) / 3) * 4) return false;
        contentType = value[..comma] switch {
            "data:image/png;base64" => "image/png",
            "data:image/jpeg;base64" => "image/jpeg",
            "data:image/webp;base64" => "image/webp",
            _ => ""
        };
        if (contentType.Length == 0) return false;
        try { bytes = Convert.FromBase64String(value[(comma + 1)..]); }
        catch (FormatException) { return false; }
        if (bytes.Length == 0 || bytes.Length > MaxBytes) return false;
        return ContentType(bytes) == contentType;
    }

    public static string? ContentType(ReadOnlySpan<byte> bytes)
    {
        if (bytes.StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return "image/png";
        if (bytes.StartsWith(new byte[] { 255, 216, 255 })) return "image/jpeg";
        if (bytes.Length >= 12 && bytes[..4].SequenceEqual("RIFF"u8) && bytes.Slice(8, 4).SequenceEqual("WEBP"u8)) return "image/webp";
        return null;
    }
}
