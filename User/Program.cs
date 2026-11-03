using SmartShop.User.Components;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<SmartShop.BUS.ShopState>();
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
