using SmartShop.DTO;

namespace SmartShop.BUS;

public interface ISupplierService
{
    IReadOnlyList<Supplier> Search(string query = "");
    Supplier Get(int id);
    string SuggestCode();
    Supplier Create(SupplierDraft draft);
    Supplier Update(int id, SupplierDraft draft);
    void Delete(int id);
}
