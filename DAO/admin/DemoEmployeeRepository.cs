using SmartShop.DTO;
using SmartShop.DTO.Contracts;

namespace SmartShop.DAO;

/// <summary>Demo records scoped to one session. No SQL or production account is changed.</summary>
public sealed class DemoEmployeeRepository : IEmployeeRepository
{
    private readonly object gate = new();
    private readonly List<Employee> employees =
    [
        new(1, "NV001", "Nguyễn Minh", "0910000001", "minh@example.com", "123 Đường Demo, TP. Hồ Chí Minh", true, new DateTime(2026, 10, 21)),
        new(2, "NV002", "Trần Hà", "0910000002", "ha@example.com", "45 Đường Mẫu, TP. Hồ Chí Minh", true, new DateTime(2026, 10, 22)),
        new(3, "NV003", "Lê Dũng", "0910000003", "", "78 Đường Demo, TP. Hồ Chí Minh", false, new DateTime(2026, 10, 23))
    ];
    private int nextId = 4;

    public IReadOnlyList<Employee> GetAll()
    {
        lock (gate) return employees.ToArray();
    }

    public Employee Insert(Employee employee)
    {
        lock (gate)
        {
            EnsureUnique(employee.Code);
            var saved = employee with { Id = nextId++ };
            employees.Add(saved);
            return saved;
        }
    }

    public Employee Update(Employee employee)
    {
        lock (gate)
        {
            var index = IndexOf(employee.Id);
            if (employees[index].Code != employee.Code || employees[index].CreatedAt != employee.CreatedAt)
                throw new InvalidOperationException("Không được thay đổi mã hoặc ngày tạo nhân viên.");
            EnsureUnique(employee.Code, employee.Id);
            employees[index] = employee;
            return employee;
        }
    }

    public void Delete(int id)
    {
        lock (gate) employees.RemoveAt(IndexOf(id));
    }

    private int IndexOf(int id)
    {
        var index = employees.FindIndex(c => c.Id == id);
        return index >= 0 ? index : throw new InvalidOperationException("Không tìm thấy nhân viên.");
    }

    private void EnsureUnique(string code, int exceptId = 0)
    {
        if (employees.Any(c => c.Id != exceptId && string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Mã nhân viên đã tồn tại.");
    }
}
