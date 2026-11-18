using Npgsql;
using NpgsqlTypes;
using System.Text.RegularExpressions;

static class BranchValidation
{
    public static bool Valid(BranchInput input)
    {
        if (input.BrandId <= 0 || string.IsNullOrWhiteSpace(input.Address) || input.Address.Length > 2000 || input.Name?.Length > 180 || input.Phone?.Length > 30) return false;
        if (!string.IsNullOrWhiteSpace(input.Phone) && (!Regex.IsMatch(input.Phone.Trim(), @"^\+?[0-9 ()\-.]+$") || !Regex.IsMatch(Regex.Replace(input.Phone, @"\D", ""), @"^[0-9]{8,15}$"))) return false;
        if (input.Latitude.HasValue && (!double.IsFinite(input.Latitude.Value) || Math.Abs(input.Latitude.Value) > 90)) return false;
        if (input.Longitude.HasValue && (!double.IsFinite(input.Longitude.Value) || Math.Abs(input.Longitude.Value) > 180)) return false;
        return !input.OpeningHours.HasValue || input.OpeningHours.Value.GetRawText().Length <= 4000;
    }

    public static void AddLocationParameters(NpgsqlCommand command, BranchInput input)
    {
        command.Parameters.AddWithValue("lat", NpgsqlDbType.Double, (object?)input.Latitude ?? DBNull.Value);
        command.Parameters.AddWithValue("lng", NpgsqlDbType.Double, (object?)input.Longitude ?? DBNull.Value);
        command.Parameters.AddWithValue("hours", NpgsqlDbType.Text, input.OpeningHours is { ValueKind: not System.Text.Json.JsonValueKind.Null } hours ? hours.GetRawText() : DBNull.Value);
    }
}
