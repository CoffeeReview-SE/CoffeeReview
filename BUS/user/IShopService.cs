using SmartShop.DTO;

namespace SmartShop.BUS;

/// <summary>Application operations exposed to User and Admin interfaces.</summary>
public interface IShopService
{
    IReadOnlyList<Product> Products { get; }
    IReadOnlyList<Order> Orders { get; }
    IReadOnlyDictionary<int, int> Cart { get; }
    int Count { get; }
    decimal Total { get; }
    IEnumerable<Product> Search(string query, string category, HashSet<int>? favorites, string sort);
    bool Add(Product product);
    void Change(int id, int delta);
    void Remove(int id);
    void UpdateProduct(int id, decimal price, int stock);
    void UpdateOrderStatus(string code, string status);
    Order Checkout(string name, string phone, string address);
}
