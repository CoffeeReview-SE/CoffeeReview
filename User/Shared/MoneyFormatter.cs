using System.Globalization;

namespace SmartShop.UI.Shared;

public static class MoneyFormatter
{
    private static readonly CultureInfo Vietnamese = CultureInfo.GetCultureInfo("vi-VN");
    public static string Format(decimal value) => value.ToString("N0", Vietnamese) + " ₫";
}
