using SmartShop.DTO;
using SmartShop.DTO.Contracts;

namespace SmartShop.DAO;

/// <summary>Demo records scoped to one session. Uses in-memory storage.</summary>
public sealed class DemoSupplierRepository : ISupplierRepository
{
    private readonly object gate = new();
    private readonly List<Supplier> suppliers =
    [
        new(1, "NCC001", "Thiết Bị Ánh Dương", "02800000001", "anhduong@example.com", "123 Đường Demo, TP. Hồ Chí Minh", new DateTime(2026, 10, 21)),
        new(2, "NCC002", "Linh Kiện Sao Việt", "02800000002", "saoviet@example.com", "45 Đường Mẫu, TP. Hồ Chí Minh", new DateTime(2026, 10, 22)),
        new(3, "NCC003", "Công Nghệ Đông Nam", "02800000003", "", "78 Đường Demo, TP. Hồ Chí Minh", new DateTime(2026, 10, 23))
    ];
    private int nextId = 4;

    public IReadOnlyList<Supplier> GetAll()
    {
        lock (gate) return suppliers.ToArray();
    }

    public Supplier Insert(Supplier supplier)
    {
        lock (gate)
        {
            EnsureUnique(supplier.Code);
            var saved = supplier with { Id = nextId++ };
            suppliers.Add(saved);
            return saved;
        }
    }

    public Supplier Update(Supplier supplier)
    {
        lock (gate)
        {
            var index = IndexOf(supplier.Id);
            if (suppliers[index].Code != supplier.Code || suppliers[index].CreatedAt != supplier.CreatedAt)
                throw new InvalidOperationException("Không được thay đổi mã hoặc ngày tạo nhà cung cấp.");
            EnsureUnique(supplier.Code, supplier.Id);
            suppliers[index] = supplier;
            return supplier;
        }
    }

    public void Delete(int id)
    {
        lock (gate) suppliers.RemoveAt(IndexOf(id));
    }

    private int IndexOf(int id)
    {
        var index = suppliers.FindIndex(c => c.Id == id);
        return index >= 0 ? index : throw new InvalidOperationException("Không tìm thấy nhà cung cấp.");
    }

    private void EnsureUnique(string code, int exceptId = 0)
    {
        if (suppliers.Any(c => c.Id != exceptId && string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Mã nhà cung cấp đã tồn tại.");
    }
}
