using System.Collections;
using System.ComponentModel.DataAnnotations;
using SmartShop.DTO;
using SmartShop.DTO.Contracts;

namespace SmartShop.BUS;

/// <summary>Employee BUS: owns the ArrayList, validation and CRUD operations.</summary>
public sealed class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository repository;
    private readonly ArrayList employees;

    public EmployeeService(IEmployeeRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);
        this.repository = repository;
        employees = new ArrayList(repository.GetAll().ToArray());
    }

    public IReadOnlyList<Employee> Search(string query = "", bool? isActive = null)
    {
        var term = SearchText.Normalize((query ?? "").Trim());
        // Search the BUS cache, never re-query storage while typing.
        return employees.Cast<Employee>()
            .Where(c => (isActive is null || c.IsActive == isActive)
                && (term.Length == 0 || new[] { c.Code, c.Name, c.Phone, c.Email, c.Address }
                    .Any(value => SearchText.Normalize(value).Contains(term, StringComparison.OrdinalIgnoreCase))))
            .OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).ToArray();
    }

    public Employee Get(int id) => employees.Cast<Employee>().SingleOrDefault(c => c.Id == id)
        ?? throw new InvalidOperationException("Không tìm thấy nhân viên.");

    public string SuggestCode()
    {
        var number = 1;
        while (employees.Cast<Employee>().Any(c => c.Code.Equals($"NV{number:000}", StringComparison.OrdinalIgnoreCase))) number++;
        return $"NV{number:000}";
    }

    public Employee Create(EmployeeDraft draft)
    {
        var value = Validate(draft);
        EnsureUnique(value.Code);
        var saved = repository.Insert(new Employee(0, value.Code, value.Name, value.Phone, value.Email,
            value.Address, value.IsActive, DateTime.Now));
        employees.Add(saved);
        return saved;
    }

    public Employee Update(int id, EmployeeDraft draft)
    {
        var existing = Get(id);
        var value = Validate(draft);
        if (value.Code != existing.Code) throw new InvalidOperationException("Mã nhân viên không được sửa.");
        EnsureUnique(value.Code, id);
        return Save(existing with
        {
            Name = value.Name, Phone = value.Phone, Email = value.Email,
            Address = value.Address, IsActive = value.IsActive
        });
    }

    public Employee SetActive(int id, bool active) => Save(Get(id) with { IsActive = active });

    public void Delete(int id)
    {
        var existing = Get(id);
        repository.Delete(id);
        employees.Remove(existing);
    }

    private Employee Save(Employee employee)
    {
        var previous = Get(employee.Id);
        var saved = repository.Update(employee);
        employees[employees.IndexOf(previous)] = saved;
        return saved;
    }

    private void EnsureUnique(string code, int exceptId = 0)
    {
        if (employees.Cast<Employee>().Any(c => c.Id != exceptId && c.Code.Equals(code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Mã nhân viên đã tồn tại.");
    }

    private static EmployeeDraft Validate(EmployeeDraft draft)
    {
        ArgumentNullException.ThrowIfNull(draft);
        var value = new EmployeeDraft
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
