using SmartShop.DTO;

namespace SmartShop.BUS;

public interface ICustomerService
{
    IReadOnlyList<Customer> Search(string query = "", bool? isActive = null);
    Customer Get(int id);
    string SuggestCode();
    Customer Create(CustomerDraft draft);
    Customer Update(int id, CustomerDraft draft);
    Customer SetActive(int id, bool active);
    void Delete(int id);
}
