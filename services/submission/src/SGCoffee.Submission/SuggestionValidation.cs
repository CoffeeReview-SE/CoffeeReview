using System.Text.RegularExpressions;

static class SuggestionValidation
{
    public static Dictionary<string, string> Validate(SuggestionInput input, bool isNewBrand)
    {
        var errors = new Dictionary<string, string>();
        void Required(string field, string? value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value)) errors[field] = "required";
            else if (value.Trim().Length > maxLength) errors[field] = "tooLong";
        }
        void Phone(string field, string? value)
        {
            Required(field, value, 30);
            if (errors.ContainsKey(field)) return;
            var number = value!.Trim();
            if (!Regex.IsMatch(number, @"^\+?[0-9 ()\-.]+$") ||
                !Regex.IsMatch(Regex.Replace(number, @"\D", ""), @"^[0-9]{8,15}$")) errors[field] = "phone";
        }
        void Url(string field, string? value)
        {
            Required(field, value, 2000);
            if (errors.ContainsKey(field)) return;
            var text = value!.Trim();
            if (!Regex.IsMatch(text, @"^https?://", RegexOptions.IgnoreCase) || text.Any(char.IsWhiteSpace) || !Uri.TryCreate(text, UriKind.Absolute, out var uri) ||
                uri.Scheme is not ("http" or "https") || string.IsNullOrEmpty(uri.Host)) errors[field] = "url";
        }
        Required("name", input.Name, 160);
        Phone("phone", input.Phone);
        Required("brandName", input.BrandName, 160);
        Required("branchName", input.BranchName, 180);
        Required("address", input.Address, 2000);
        Phone("branchPhone", input.BranchPhone);
        Required("openingHours", input.OpeningHours, 1000);
        if (input.Latitude is null) errors["latitude"] = "required";
        else if (!double.IsFinite(input.Latitude.Value) || input.Latitude < -90 || input.Latitude > 90) errors["latitude"] = "coordinates";
        if (input.Longitude is null) errors["longitude"] = "required";
        else if (!double.IsFinite(input.Longitude.Value) || input.Longitude < -180 || input.Longitude > 180) errors["longitude"] = "coordinates";
        if (input.Note?.Trim().Length > 2000) errors["note"] = "tooLong";
        if (isNewBrand)
        {
            Required("type", input.Type, 160);
            Required("description", input.Description, 10000);
            Url("websiteUrl", input.WebsiteUrl);
            Url("logoUrl", input.LogoUrl);
            Url("coverUrl", input.CoverUrl);
            Url("menuImageUrl", input.MenuImageUrl);
        }
        return errors;
    }
}

record SuggestionInput(string? Name = null, string? Phone = null, string? BrandName = null,
    string? Address = null, string? Note = null, string? Type = null, string? Description = null,
    string? WebsiteUrl = null, string? LogoUrl = null, string? CoverUrl = null, string? MenuImageUrl = null,
    string? BranchName = null, string? BranchPhone = null, double? Latitude = null,
    double? Longitude = null, string? OpeningHours = null);
