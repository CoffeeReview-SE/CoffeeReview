using Microsoft.Extensions.DependencyInjection;
using SmartShop.BUS;
using SmartShop.DAO;
using SmartShop.DTO;
using SmartShop.DTO.Contracts;

internal static class EmployeeChecks
{
    public static void Run()
    {
        var repository = new ObservedRepository();
        IEmployeeService service = new EmployeeService(repository);
        Check(service.Search().Count == 3, "Load demo employees into BUS");
        Check(service.Search("nguyen minh").Single().Code == "NV001", "Find Vietnamese names without accents");
        Check(service.Search("0910000002").Single().Code == "NV002", "Find employees by phone");
        service.Search("NV"); service.Search("example.com");
        Check(repository.Reads == 1, "Search stays on the BUS ArrayList without re-reading DAO");

        var saved = service.Create(Draft("  nv900  "));
        Check(saved.Id > 0 && saved.Code == "NV900" && saved.Name == "Nhân viên Demo", "Create normalizes data and generates an ID");
        Check(saved.Email == "", "Email is optional");
        Reject(() => service.Create(Draft(" Nv900 ")), "Reject duplicate code case-insensitively");
        Check(service.Search().Count == 4, "Duplicate rejection does not change the list");

        var invalid = Draft("NV901"); invalid.Phone = "123";
        Reject(() => service.Create(invalid), "Reject invalid phone in BUS");
        invalid = Draft("NV901"); invalid.Name = "   ";
        Reject(() => service.Create(invalid), "Reject blank name in BUS");
        invalid = Draft("NV901"); invalid.Email = "bad-email";
        Reject(() => service.Create(invalid), "Reject invalid email in BUS");
        invalid = Draft("NV901"); invalid.Address = "short";
        Reject(() => service.Create(invalid), "Reject incomplete address in BUS");
        invalid = Draft("@@");
        Reject(() => service.Create(invalid), "Reject invalid employee code");

        var edit = EmployeeDraft.From(saved);
        edit.Name = "Tên mới";
        Check(service.Get(saved.Id).Name == saved.Name, "Editing a draft does not mutate stored data before save");
        var updated = service.Update(saved.Id, edit);
        Check(updated.Name == "Tên mới" && updated.Code == saved.Code && updated.CreatedAt == saved.CreatedAt,
            "Edit preserves the immutable code and creation date");
        edit.Code = "NV999";
        Reject(() => service.Update(saved.Id, edit), "Reject code tampering even if UI readonly is bypassed");

        service.SetActive(saved.Id, false);
        Check(!service.Get(saved.Id).IsActive && !service.Search("NV900", true).Any(), "Locked employee is excluded from active selection");
        Check(service.Search("NV900", false).Count == 1, "Filter locked employees");
        service.SetActive(saved.Id, true);
        Check(service.Search("NV900", true).Count == 1, "Unlock employee");

        repository.FailWrites = true;
        var before = service.Get(saved.Id);
        edit = EmployeeDraft.From(before); edit.Name = "Không lưu được";
        Reject(() => service.Update(saved.Id, edit), "Propagate an update failure");
        Reject(() => service.Create(Draft("NV902")), "Propagate an insert failure");
        Reject(() => service.Delete(saved.Id), "Propagate a delete failure");
        Check(service.Get(saved.Id) == before && service.Search().Count == 4,
            "DAO failure leaves the BUS cache unchanged");
        repository.FailWrites = false;
        service.Delete(saved.Id);
        Check(!service.Search("NV900").Any(), "Delete removes employee from the BUS list");
        Reject(() => service.Get(saved.Id), "Deleted employee is no longer found");
        var replacement = service.Create(Draft("NV903"));
        Check(replacement.Id > saved.Id, "Generated IDs are not reused after deletion");
        Reject(() => repository.Insert(service.Get(1) with { Id = 0, Code = "nv001" }),
            "DAO also protects unique codes");

        var services = new ServiceCollection();
        services.AddScoped<IEmployeeRepository, DemoEmployeeRepository>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
        using var scopeA = provider.CreateScope(); using var scopeB = provider.CreateScope();
        var a = scopeA.ServiceProvider.GetRequiredService<IEmployeeService>();
        var b = scopeB.ServiceProvider.GetRequiredService<IEmployeeService>();
        a.Create(Draft("NV950"));
        Check(a.Search("NV950").Count == 1 && b.Search("NV950").Count == 0, "Employee scopes do not leak data between sessions");
        Check(ReferenceEquals(a, scopeA.ServiceProvider.GetRequiredService<IEmployeeService>()),
            "Admin and employee picker share the same scoped employee service");
    }

    private static EmployeeDraft Draft(string code) => new()
    {
        Code = code, Name = "  Nhân viên Demo  ", Phone = "0900000099", Email = "", Address = "123 Đường Demo, TP. Hồ Chí Minh"
    };
    private static void Check(bool value, string message)
    {
        if (!value) throw new Exception(message);
        Console.WriteLine("PASS EMPLOYEE " + message);
    }
    private static void Reject(Action action, string message)
    {
        try { action(); }
        catch (InvalidOperationException) { Console.WriteLine("PASS EMPLOYEE " + message); return; }
        throw new Exception(message);
    }

    private sealed class ObservedRepository : IEmployeeRepository
    {
        private readonly DemoEmployeeRepository inner = new();
        public int Reads { get; private set; }
        public bool FailWrites { get; set; }
        public IReadOnlyList<Employee> GetAll() { Reads++; return inner.GetAll(); }
        public Employee Insert(Employee value) { VerifyWrite(); return inner.Insert(value); }
        public Employee Update(Employee value) { VerifyWrite(); return inner.Update(value); }
        public void Delete(int id) { VerifyWrite(); inner.Delete(id); }
        private void VerifyWrite()
        {
            if (FailWrites) throw new InvalidOperationException("Simulated employee storage failure.");
        }
    }
}
