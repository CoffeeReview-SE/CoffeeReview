using SmartShop.BUS;

var shop = new ShopState();
static void Check(bool condition, string message)
{
    if (!condition) throw new Exception(message);
    Console.WriteLine("PASS " + message);
}
static void Rejected(Action action, string message)
{
    try { action(); } catch (InvalidOperationException) { Console.WriteLine("PASS " + message); return; }
    throw new Exception(message);
}
var first = shop.Products[0];
Check(shop.Search("Samsung", "Điện thoại", null, "low").Count() == 2, "BUS filters the product catalog");
Check(shop.Add(first) && shop.Add(first), "Add two products");
Check(shop.Count == 2 && shop.Total == first.Price * 2, "Quantity and total are correct");
Rejected(() => shop.UpdateProduct(first.Id, first.Price, 1), "Stock cannot fall below cart quantity");
Rejected(() => shop.Checkout(" ", "0900000000", "123 Demo Street"), "Invalid delivery input is rejected by BUS");
Check(shop.Count == 2 && shop.Orders.Count == 0 && shop.Products[0].Stock == first.Stock, "Failed checkout leaves cart and stock unchanged");
var order = shop.Checkout("Demo Customer", "0900000000", "123 Demo Street");
Check(order.Total == first.Price * 2 && order.Items[0].Quantity == 2, "Order snapshot has correct totals");
Check(shop.Products[0].Stock == first.Stock - 2 && shop.Count == 0 && shop.Orders.Count == 1, "Checkout updates stock and empties cart");
shop.UpdateProduct(first.Id, first.Price + 1000, first.Stock - 2);
Check(order.Total == first.Price * 2 && order.Items[0].Product.Price == first.Price, "Changing catalog price preserves historical order price");
shop.UpdateOrderStatus(order.Code, "Đã xác nhận");
Check(shop.Orders[0].Status == "Đã xác nhận", "Admin updates order status through BUS");
Rejected(() => shop.UpdateOrderStatus(order.Code, "unknown"), "Invalid order status is rejected");
Rejected(() => shop.Checkout("Demo Customer", "0900000000", "123 Demo Street"), "Empty cart checkout is rejected");
var secondSession = new ShopState();
Check(secondSession.Orders.Count == 0 && secondSession.Products[0].Stock == first.Stock, "Demo sessions are isolated");
var lastProduct = shop.Products[^1];
shop.UpdateProduct(lastProduct.Id, lastProduct.Price, 1);
Check(shop.Add(lastProduct) && !shop.Add(lastProduct), "Cart cannot exceed available stock");
Console.WriteLine("All integration smoke checks passed.");
