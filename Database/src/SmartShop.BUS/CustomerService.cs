using System.Collections;
using System.ComponentModel.DataAnnotations;
using SmartShop.DTO;
using SmartShop.DTO.Contracts;

namespace SmartShop.BUS;

/// <summary>Customer BUS: owns the ArrayList, validation and CRUD operations.</summary>
public sealed class CustomerService : ICustomerService
{
    private readonly ICustomerRepository repository;
    private readonly ArrayList customers;

    public CustomerService(ICustomerRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);
        this.repository = repository;
        customers = new ArrayList(repository.GetAll().ToArray());
    }

    public IReadOnlyList<Customer> Search(string query = "", bool? isActive = null)
    {
        var term = SearchText.Normalize((query ?? "").Trim());
        // Search the BUS cache, never re-query storage while typing.
        return customers.Cast<Customer>()
            .Where(c => (isActive is null || c.IsActive == isActive)
                && (term.Length == 0 || new[] { c.Code, c.Name, c.Phone, c.Email, c.Address }
                    .Any(value => SearchText.Normalize(value).Contains(term, StringComparison.OrdinalIgnoreCase))))
            .OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).ToArray();
    }

    public Customer Get(int id) => customers.Cast<Customer>().SingleOrDefault(c => c.Id == id)
        ?? throw new InvalidOperationException("Không tìm thấy khách hàng.");

    public string SuggestCode()
    {
        var number = 1;
        while (customers.Cast<Customer>().Any(c => c.Code.Equals($"KH{number:000}", StringComparison.OrdinalIgnoreCase))) number++;
        return $"KH{number:000}";
    }

    public Customer Create(CustomerDraft draft)
    {
        var value = Validate(draft);
        EnsureUnique(value.Code);
        var saved = repository.Insert(new Customer(0, value.Code, value.Name, value.Phone, value.Email,
            value.Address, value.IsActive, DateTime.Now));
        customers.Add(saved);
        return saved;
    }

    public Customer Update(int id, CustomerDraft draft)
    {
        var existing = Get(id);
        var value = Validate(draft);
        if (value.Code != existing.Code) throw new InvalidOperationException("Mã khách hàng không được sửa.");
        EnsureUnique(value.Code, id);
        return Save(existing with
        {
            Name = value.Name, Phone = value.Phone, Email = value.Email,
            Address = value.Address, IsActive = value.IsActive
        });
    }

    public Customer SetActive(int id, bool active) => Save(Get(id) with { IsActive = active });

    public void Delete(int id)
    {
        var existing = Get(id);
        repository.Delete(id);
        customers.Remove(existing);
    }

    private Customer Save(Customer customer)
    {
        var previous = Get(customer.Id);
        var saved = repository.Update(customer);
        customers[customers.IndexOf(previous)] = saved;
        return saved;
    }

    private void EnsureUnique(string code, int exceptId = 0)
    {
        if (customers.Cast<Customer>().Any(c => c.Id != exceptId && c.Code.Equals(code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Mã khách hàng đã tồn tại.");
    }

    private static CustomerDraft Validate(CustomerDraft draft)
    {
        ArgumentNullException.ThrowIfNull(draft);
        var value = new CustomerDraft
        {
            Code = (draft.Code ?? "").Trim().ToUpperInvariant(), Name = (draft.Name ?? "").Trim(),
            Phone = (draft.Phone ?? "").Trim(), Email = (draft.Email ?? "").Trim(),
            Address = (draft.Address ?? "").Trim(), IsActive = draft.IsActive
        };
        var errors = new List<ValidationResult>();
        if (!Validator.TryValidateObject(value, new ValidationContext(value), errors, validateAllProperties: true))
            throw new InvalidOperationException(string.Join(" ", errors.Select(e => e.ErrorMessage)));
        return value;
    }

}
