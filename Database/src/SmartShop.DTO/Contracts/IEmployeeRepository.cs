namespace SmartShop.DTO.Contracts;

public interface IEmployeeRepository
{
    IReadOnlyList<Employee> GetAll();
    Employee Insert(Employee employee);
    Employee Update(Employee employee);
    void Delete(int id);
}
