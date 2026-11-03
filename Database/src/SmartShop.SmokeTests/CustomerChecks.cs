using Microsoft.Extensions.DependencyInjection;
using SmartShop.BUS;
using SmartShop.DAO;
using SmartShop.DTO;
using SmartShop.DTO.Contracts;

internal static class CustomerChecks
{
    public static void Run()
    {
        var repository = new ObservedRepository();
        ICustomerService service = new CustomerService(repository);
        Check(service.Search().Count == 3, "Load demo customers into BUS");
        Check(service.Search("nguyen an").Single().Code == "KH001", "Find Vietnamese names without accents");
        Check(service.Search("0900000002").Single().Code == "KH002", "Find customers by phone");
        service.Search("KH"); service.Search("example.com");
        Check(repository.Reads == 1, "Search stays on the BUS ArrayList without re-reading DAO");

        var saved = service.Create(Draft("  kh900  "));
        Check(saved.Id > 0 && saved.Code == "KH900" && saved.Name == "Khách Demo", "Create normalizes data and generates an ID");
        Check(saved.Email == "", "Email is optional");
        Reject(() => service.Create(Draft(" Kh900 ")), "Reject duplicate code case-insensitively");
        Check(service.Search().Count == 4, "Duplicate rejection does not change the list");

        var invalid = Draft("KH901"); invalid.Phone = "123";
        Reject(() => service.Create(invalid), "Reject invalid phone in BUS");
        invalid = Draft("KH901"); invalid.Name = "   ";
        Reject(() => service.Create(invalid), "Reject blank name in BUS");
        invalid = Draft("KH901"); invalid.Email = "bad-email";
        Reject(() => service.Create(invalid), "Reject invalid email in BUS");
        invalid = Draft("KH901"); invalid.Address = "short";
        Reject(() => service.Create(invalid), "Reject incomplete address in BUS");
        invalid = Draft("@@");
        Reject(() => service.Create(invalid), "Reject invalid customer code");

        var edit = CustomerDraft.From(saved);
        edit.Name = "Tên mới";
        Check(service.Get(saved.Id).Name == saved.Name, "Editing a draft does not mutate stored data before save");
        var updated = service.Update(saved.Id, edit);
        Check(updated.Name == "Tên mới" && updated.Code == saved.Code && updated.CreatedAt == saved.CreatedAt,
            "Edit preserves the immutable code and creation date");
        edit.Code = "KH999";
        Reject(() => service.Update(saved.Id, edit), "Reject code tampering even if UI readonly is bypassed");

        service.SetActive(saved.Id, false);
        Check(!service.Get(saved.Id).IsActive && !service.Search("KH900", true).Any(), "Locked customer is excluded from active selection");
        Check(service.Search("KH900", false).Count == 1, "Filter locked customers");
        service.SetActive(saved.Id, true);
        Check(service.Search("KH900", true).Count == 1, "Unlock customer");

        repository.FailWrites = true;
        var before = service.Get(saved.Id);
        edit = CustomerDraft.From(before); edit.Name = "Không lưu được";
        Reject(() => service.Update(saved.Id, edit), "Propagate an update failure");
        Reject(() => service.Create(Draft("KH902")), "Propagate an insert failure");
        Reject(() => service.Delete(saved.Id), "Propagate a delete failure");
        Check(service.Get(saved.Id) == before && service.Search().Count == 4,
            "DAO failure leaves the BUS cache unchanged");
        repository.FailWrites = false;
        service.Delete(saved.Id);
        Check(!service.Search("KH900").Any(), "Delete removes customer from the BUS list");
        Reject(() => service.Get(saved.Id), "Deleted customer is no longer found");
        var replacement = service.Create(Draft("KH903"));
        Check(replacement.Id > saved.Id, "Generated IDs are not reused after deletion");
        Reject(() => repository.Insert(service.Get(1) with { Id = 0, Code = "kh001" }),
            "DAO also protects unique codes");

        var services = new ServiceCollection();
        services.AddScoped<ICustomerRepository, DemoCustomerRepository>();
        services.AddScoped<ICustomerService, CustomerService>();
        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
        using var scopeA = provider.CreateScope(); using var scopeB = provider.CreateScope();
        var a = scopeA.ServiceProvider.GetRequiredService<ICustomerService>();
        var b = scopeB.ServiceProvider.GetRequiredService<ICustomerService>();
        a.Create(Draft("KH950"));
        Check(a.Search("KH950").Count == 1 && b.Search("KH950").Count == 0, "Customer scopes do not leak data between sessions");
        Check(ReferenceEquals(a, scopeA.ServiceProvider.GetRequiredService<ICustomerService>()),
            "Admin and customer picker share the same scoped customer service");
    }

    private static CustomerDraft Draft(string code) => new()
    {
        Code = code, Name = "  Khách Demo  ", Phone = "0900000099", Email = "", Address = "123 Đường Demo, TP. Hồ Chí Minh"
    };
    private static void Check(bool value, string message)
    {
        if (!value) throw new Exception(message);
        Console.WriteLine("PASS CUSTOMER " + message);
    }
    private static void Reject(Action action, string message)
    {
        try { action(); }
        catch (InvalidOperationException) { Console.WriteLine("PASS CUSTOMER " + message); return; }
        throw new Exception(message);
    }

    private sealed class ObservedRepository : ICustomerRepository
    {
        private readonly DemoCustomerRepository inner = new();
        public int Reads { get; private set; }
        public bool FailWrites { get; set; }
        public IReadOnlyList<Customer> GetAll() { Reads++; return inner.GetAll(); }
        public Customer Insert(Customer value) { VerifyWrite(); return inner.Insert(value); }
        public Customer Update(Customer value) { VerifyWrite(); return inner.Update(value); }
        public void Delete(int id) { VerifyWrite(); inner.Delete(id); }
        private void VerifyWrite()
        {
            if (FailWrites) throw new InvalidOperationException("Simulated customer storage failure.");
        }
    }
}
