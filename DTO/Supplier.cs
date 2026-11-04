using System.ComponentModel.DataAnnotations;

namespace SmartShop.DTO;

public sealed record Supplier(int Id, string Code, string Name, string Phone, string Email,
    string Address, DateTime CreatedAt);

/// <summary>An editable copy; cancelling a form never mutates the stored supplier.</summary>
public sealed class SupplierDraft
{
    [Required(ErrorMessage = "Vui lòng nhập mã nhà cung cấp.")]
    [RegularExpression(@"[A-Za-z][A-Za-z0-9_-]{1,19}", ErrorMessage = "Mã gồm 2–20 ký tự, bắt đầu bằng chữ; chỉ dùng chữ, số, _ hoặc -.")]
    public string Code { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng nhập tên nhà cung cấp.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "Tên nhà cung cấp cần từ 2 đến 120 ký tự.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại.")]
    [RegularExpression(@"0[0-9]{9,10}", ErrorMessage = "Số điện thoại gồm 10–11 chữ số, bắt đầu bằng 0.")]
    public string Phone { get; set; } = "";

    [StringLength(150, ErrorMessage = "Email tối đa 150 ký tự.")]
    [RegularExpression(@"[^@\s]+@[^@\s]+\.[^@\s]+", ErrorMessage = "Email không đúng định dạng.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ.")]
    [StringLength(250, MinimumLength = 10, ErrorMessage = "Địa chỉ cần từ 10 đến 250 ký tự.")]
    public string Address { get; set; } = "";

    public static SupplierDraft From(Supplier value) => new()
    {
        Code = value.Code, Name = value.Name, Phone = value.Phone,
        Email = value.Email, Address = value.Address
    };
}
