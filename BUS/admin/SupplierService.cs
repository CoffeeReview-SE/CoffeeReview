using System.Collections;
using System.ComponentModel.DataAnnotations;
using SmartShop.DTO;
using SmartShop.DTO.Contracts;

namespace SmartShop.BUS;

/// <summary>Supplier BUS: owns the ArrayList, validation and CRUD operations.</summary>
public sealed class SupplierService : ISupplierService
{
    private readonly ISupplierRepository repository;
    private readonly ArrayList suppliers;

    public SupplierService(ISupplierRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);
        this.repository = repository;
        suppliers = new ArrayList(repository.GetAll().ToArray());
    }

    public IReadOnlyList<Supplier> Search(string query = "")
    {
        var term = SearchText.Normalize((query ?? "").Trim());
        // Search the BUS cache, never re-query storage while typing.
        return suppliers.Cast<Supplier>()
            .Where(c => term.Length == 0 || new[] { c.Code, c.Name, c.Phone, c.Email, c.Address }
                    .Any(value => SearchText.Normalize(value).Contains(term, StringComparison.OrdinalIgnoreCase)))
            .OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).ToArray();
    }

    public Supplier Get(int id) => suppliers.Cast<Supplier>().SingleOrDefault(c => c.Id == id)
        ?? throw new InvalidOperationException("Không tìm thấy nhà cung cấp.");

    public string SuggestCode()
    {
        var number = 1;
        while (suppliers.Cast<Supplier>().Any(c => c.Code.Equals($"NCC{number:000}", StringComparison.OrdinalIgnoreCase))) number++;
        return $"NCC{number:000}";
    }

    public Supplier Create(SupplierDraft draft)
    {
        var value = Validate(draft);
        EnsureUnique(value.Code);
        var saved = repository.Insert(new Supplier(0, value.Code, value.Name, value.Phone, value.Email,
            value.Address, DateTime.Now));
        suppliers.Add(saved);
        return saved;
    }

    public Supplier Update(int id, SupplierDraft draft)
    {
        var existing = Get(id);
        var value = Validate(draft);
        if (value.Code != existing.Code) throw new InvalidOperationException("Mã nhà cung cấp không được sửa.");
        var saved = repository.Update(existing with
        {
            Name = value.Name, Phone = value.Phone, Email = value.Email,
            Address = value.Address
        });
        suppliers[suppliers.IndexOf(existing)] = saved;
        return saved;
    }

    public void Delete(int id)
    {
        var existing = Get(id);
        repository.Delete(id);
        suppliers.Remove(existing);
    }

    private void EnsureUnique(string code)
    {
        if (suppliers.Cast<Supplier>().Any(c => c.Code.Equals(code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Mã nhà cung cấp đã tồn tại.");
    }

    private static SupplierDraft Validate(SupplierDraft draft)
    {
        ArgumentNullException.ThrowIfNull(draft);
        var value = new SupplierDraft
        {
            Code = (draft.Code ?? "").Trim().ToUpperInvariant(), Name = (draft.Name ?? "").Trim(),
            Phone = (draft.Phone ?? "").Trim(), Email = (draft.Email ?? "").Trim(),
            Address = (draft.Address ?? "").Trim()
        };
        var errors = new List<ValidationResult>();
        if (!Validator.TryValidateObject(value, new ValidationContext(value), errors, validateAllProperties: true))
            throw new InvalidOperationException(string.Join(" ", errors.Select(e => e.ErrorMessage)));
        return value;
    }

}
