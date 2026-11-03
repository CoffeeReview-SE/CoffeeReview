namespace SmartShop.DTO.Contracts;

public interface ICustomerRepository
{
    IReadOnlyList<Customer> GetAll();
    Customer Insert(Customer customer);
    Customer Update(Customer customer);
    void Delete(int id);
}
