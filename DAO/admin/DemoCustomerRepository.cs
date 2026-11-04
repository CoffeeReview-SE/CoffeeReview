using SmartShop.DTO;
using SmartShop.DTO.Contracts;

namespace SmartShop.DAO;

/// <summary>Demo records scoped to one session. No SQL or production account is changed.</summary>
public sealed class DemoCustomerRepository : ICustomerRepository
{
    private readonly object gate = new();
    private readonly List<Customer> customers =
    [
        new(1, "KH001", "Nguyễn An", "0900000001", "an@example.com", "123 Đường Demo, TP. Hồ Chí Minh", true, new DateTime(2026, 10, 21)),
        new(2, "KH002", "Trần Bình", "0900000002", "binh@example.com", "45 Đường Mẫu, TP. Hồ Chí Minh", true, new DateTime(2026, 10, 22)),
        new(3, "KH003", "Lê Chi", "0900000003", "", "78 Đường Demo, TP. Hồ Chí Minh", false, new DateTime(2026, 10, 23))
    ];
    private int nextId = 4;

    public IReadOnlyList<Customer> GetAll()
    {
        lock (gate) return customers.ToArray();
    }

    public Customer Insert(Customer customer)
    {
        lock (gate)
        {
            EnsureUnique(customer.Code);
            var saved = customer with { Id = nextId++ };
            customers.Add(saved);
            return saved;
        }
    }

    public Customer Update(Customer customer)
    {
        lock (gate)
        {
            var index = IndexOf(customer.Id);
            if (customers[index].Code != customer.Code || customers[index].CreatedAt != customer.CreatedAt)
                throw new InvalidOperationException("Không được thay đổi mã hoặc ngày tạo khách hàng.");
            EnsureUnique(customer.Code, customer.Id);
            customers[index] = customer;
            return customer;
        }
    }

    public void Delete(int id)
    {
        lock (gate) customers.RemoveAt(IndexOf(id));
    }

    private int IndexOf(int id)
    {
        var index = customers.FindIndex(c => c.Id == id);
        return index >= 0 ? index : throw new InvalidOperationException("Không tìm thấy khách hàng.");
    }

    private void EnsureUnique(string code, int exceptId = 0)
    {
        if (customers.Any(c => c.Id != exceptId && string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Mã khách hàng đã tồn tại.");
    }
}
