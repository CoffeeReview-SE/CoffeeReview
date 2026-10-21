import type { Product, ProductCategory } from "@/Core/services/products-api";

export const fallbackCategories: ProductCategory[] = [
  {
    id: "PHONE1",
    name: "Điện thoại",
    description: "Điện thoại thông minh chính hãng",
    productCount: 10,
  },
  {
    id: "LAPTOP",
    name: "Laptop",
    description: "Laptop cho học tập và công việc",
    productCount: 10,
  },
  {
    id: "WATCH1",
    name: "Đồng hồ",
    description: "Đồng hồ thông minh",
    productCount: 10,
  },
  {
    id: "ACC001",
    name: "Phụ kiện",
    description: "Phụ kiện công nghệ",
    productCount: 10,
  },
];

export const fallbackProducts: Product[] = [
  {
    id: "SP001",
    categoryId: "PHONE1",
    name: "iPhone 16e 128GB",
    description: "Màn hình OLED; Camera 48MP; Pin dùng cả ngày",
    category: "Điện thoại",
    price: 16990000,
    stock: 12,
    status: "Đang bán",
  },
  {
    id: "SP002",
    categoryId: "ACC001",
    name: "Tai nghe Bluetooth",
    description: "Bluetooth; Pin 24 giờ; Âm thanh chất lượng cao",
    category: "Phụ kiện",
    price: 790000,
    stock: 25,
    status: "Đang bán",
  },
  {
    id: "SP003",
    categoryId: "ACC001",
    name: "Chuột không dây",
    description: "Kết nối USB; Thiết kế công thái học",
    category: "Phụ kiện",
    price: 390000,
    stock: 30,
    status: "Đang bán",
  },
  {
    id: "SP004",
    categoryId: "LAPTOP",
    name: "Laptop ASUS Vivobook",
    description: "Màn hình sắc nét; RAM 16GB; SSD 512GB",
    category: "Laptop",
    price: 18490000,
    stock: 6,
    status: "Đang bán",
  },
  {
    id: "SP005",
    categoryId: "ACC001",
    name: "Sạc nhanh USB-C 20W",
    description: "Công suất 20W; Tương thích USB-C",
    category: "Phụ kiện",
    price: 350000,
    stock: 18,
    status: "Đang bán",
  },
];

const categorySamples: Record<string, { category: string; names: string[]; price: number }> = {
  PHONE1: {
    category: "Điện thoại",
    names: ["Samsung Galaxy S25", "Google Pixel 9", "Xiaomi 15", "OPPO Reno 13", "Vivo V40", "Realme GT 7", "Sony Xperia 1", "Nokia X30", "ASUS ROG Phone", "OnePlus 13"],
    price: 8990000,
  },
  LAPTOP: {
    category: "Laptop",
    names: ["MacBook Air M3", "Dell Inspiron 15", "HP Pavilion 14", "Lenovo IdeaPad 5", "Acer Swift Go", "MSI Modern 14", "LG Gram 14", "Huawei MateBook", "Microsoft Surface Laptop", "ASUS Zenbook"],
    price: 14990000,
  },
  WATCH1: {
    category: "Đồng hồ",
    names: ["Apple Watch SE", "Samsung Galaxy Watch", "Xiaomi Watch 2", "Garmin Venu", "Huawei Watch GT", "Amazfit Active", "Fitbit Versa", "Kieslect Lora", "Mibro Watch", "Haylou Solar"],
    price: 1290000,
  },
  ACC001: {
    category: "Phụ kiện",
    names: ["Bàn phím cơ", "Webcam Full HD", "Hub USB-C", "Pin sạc dự phòng", "Cáp sạc nhanh", "Loa Bluetooth", "Giá đỡ laptop", "Đèn bàn LED", "Túi chống sốc", "Miếng lót chuột"],
    price: 190000,
  },
};

const generatedFallbackProducts: Product[] = [
  ...fallbackProducts,
  ...Object.entries(categorySamples).flatMap(([categoryId, sample]) =>
    sample.names.map((name, index) => ({
      id: `SAMPLE-${categoryId}-${index + 1}`,
      categoryId,
      name,
      description: `Sản phẩm ${sample.category}; Chính hãng; Bảo hành 12 tháng`,
      category: sample.category,
      price: sample.price + index * 100000,
      stock: 10 + index,
      status: "Đang bán" as const,
    })),
  ),
];

export const allFallbackProducts: Product[] = Object.keys(categorySamples).flatMap((categoryId) =>
  generatedFallbackProducts.filter((product) => product.categoryId === categoryId).slice(0, 10),
);
