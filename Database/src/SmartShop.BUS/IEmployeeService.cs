using SmartShop.DTO;

namespace SmartShop.BUS;

public interface IEmployeeService
{
    IReadOnlyList<Employee> Search(string query = "", bool? isActive = null);
    Employee Get(int id);
    string SuggestCode();
    Employee Create(EmployeeDraft draft);
    Employee Update(int id, EmployeeDraft draft);
    Employee SetActive(int id, bool active);
    void Delete(int id);
}
