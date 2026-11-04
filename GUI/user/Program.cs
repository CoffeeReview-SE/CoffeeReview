using SmartShop.User.Components;
using SmartShop.BUS;
using SmartShop.DAO;
using SmartShop.DTO.Contracts;

var builder = WebApplication.CreateBuilder(args);
// The composition root selects storage; pages and BUS depend only on contracts.
builder.Services.AddScoped<IShopRepository, DemoShopDao>();
builder.Services.AddScoped<IShopService, ShopState>();
builder.Services.AddScoped<ICustomerRepository, DemoCustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IEmployeeRepository, DemoEmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<ISupplierRepository, DemoSupplierRepository>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<SmartShop.UI.Shared.ShopUiState>();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddAdditionalAssemblies(typeof(SmartShop.Admin.Components.Pages.Admin).Assembly)
    .AddInteractiveServerRenderMode();

app.Run();
