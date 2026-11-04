namespace SmartShop.DTO.Contracts;

public interface ISupplierRepository
{
    IReadOnlyList<Supplier> GetAll();
    Supplier Insert(Supplier supplier);
    Supplier Update(Supplier supplier);
    void Delete(int id);
}
