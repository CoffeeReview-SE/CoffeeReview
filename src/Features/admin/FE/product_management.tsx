import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Tab = "products" | "categories";
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Đang bán" | "Hết hàng";
};
type Category = { id: string; name: string; description: string; productCount: number };

const initialProducts: Product[] = [
  { id: "SP0001", name: "iPhone 15 Pro Max", category: "Điện thoại", price: 28990000, stock: 18, status: "Đang bán" },
  { id: "SP0002", name: "MacBook Air M3", category: "Laptop", price: 25990000, stock: 7, status: "Đang bán" },
  { id: "SP0003", name: "Tai nghe Sony WH-1000XM5", category: "Phụ kiện", price: 7490000, stock: 0, status: "Hết hàng" },
  { id: "SP0004", name: "Apple Watch Series 10", category: "Đồng hồ", price: 11990000, stock: 12, status: "Đang bán" },
  { id: "SP0005", name: "Bàn phím cơ Keychron K2", category: "Phụ kiện", price: 2190000, stock: 24, status: "Đang bán" },
];

const initialCategories: Category[] = [
  { id: "DM001", name: "Điện thoại", description: "Smartphone và thiết bị di động", productCount: 24 },
  { id: "DM002", name: "Laptop", description: "Máy tính xách tay và máy tính cá nhân", productCount: 16 },
  { id: "DM003", name: "Phụ kiện", description: "Phụ kiện công nghệ và thiết bị ngoại vi", productCount: 38 },
  { id: "DM004", name: "Đồng hồ", description: "Đồng hồ thông minh và phụ kiện", productCount: 9 },
];

const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

function Sidebar({ width, active }: { width: number; active: Tab }) {
  const items = [
    ["Tổng quan", "home-outline", "/main_Admin", null],
    ["Quản lý đơn hàng", "cart-outline", "/order_management", null],
    ["Quản lý sản phẩm", "cube-outline", "/product_management", "products"],
    ["Quản lý danh mục", "grid-outline", "/category_management", "categories"],
    ["Quản lý khách hàng", "person-outline", "/customer_management", null],
  ] as const;

  return (
    <View style={[styles.sidebar, { width }]}>
      <Pressable style={styles.brand} onPress={() => router.push("/main_Admin")}>
        <Image source={require("../../../../assets/image/logo.jpg")} style={styles.brandImage} resizeMode="contain" />
        <Text style={styles.brandText}>BVP <Text style={styles.brandStrong}>Shop</Text></Text>
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(([label, icon, route, page], index) => {
          const selected = page === active;
          return (
            <React.Fragment key={route}>
              {index === 1 && <Text style={styles.menuHeading}>QUẢN LÝ</Text>}
              <Pressable
                style={[styles.menuLink, selected && styles.menuLinkActive]}
                onPress={() => !selected && router.push(route as never)}
              >
                <Ionicons name={icon as React.ComponentProps<typeof Ionicons>["name"]} size={19} color={selected ? "#fff" : "#ed263d"} />
                <Text style={[styles.menuText, selected && styles.menuTextActive]} numberOfLines={1}>{label}</Text>
              </Pressable>
            </React.Fragment>
          );
        })}
        <Text style={styles.menuHeading}>HỆ THỐNG</Text>
        <Pressable style={styles.menuLink} onPress={() => Alert.alert("Đăng xuất", "Hãy kết nối chức năng đăng xuất với hệ thống.")}>
          <Ionicons name="log-out-outline" size={19} color="#ed263d" />
          <Text style={styles.menuText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
      <Image source={require("../../../../assets/image/anh logo.png")} style={styles.promoImage} resizeMode="contain" />
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: "default" | "numeric" }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholderTextColor="#9aa4b5" keyboardType={keyboardType} />
    </View>
  );
}

export function ProductManagement({ initialTab = "products" }: { initialTab?: Tab }) {
  const { width } = useWindowDimensions();
  const sidebarWidth = width <= 768 ? 220 : 255;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [modal, setModal] = useState<"product" | "category" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const filteredProducts = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi");
    return products.filter((item) => {
      const matchesQuery = `${item.id} ${item.name} ${item.category}`.toLocaleLowerCase("vi").includes(query);
      return matchesQuery && (status === "Tất cả trạng thái" || item.status === status);
    });
  }, [keyword, products, status]);

  const openProduct = (item?: Product) => {
    setEditingProduct(item ?? null);
    setName(item?.name ?? "");
    setCategory(item?.category ?? "");
    setPrice(item ? String(item.price) : "");
    setStock(item ? String(item.stock) : "");
    setModal("product");
  };
  const openCategory = (item?: Category) => {
    setEditingCategory(item ?? null);
    setName(item?.name ?? "");
    setDescription(item?.description ?? "");
    setModal("category");
  };

  const saveProduct = () => {
    const numericPrice = Number(price.replace(/\D/g, ""));
    const numericStock = Number(stock.replace(/\D/g, ""));
    if (!name.trim() || !category.trim() || !numericPrice || numericStock < 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên, danh mục, giá và tồn kho hợp lệ.");
      return;
    }
    const next: Product = {
      id: editingProduct?.id ?? `SP${String(products.length + 1).padStart(4, "0")}`,
      name: name.trim(),
      category: category.trim(),
      price: numericPrice,
      stock: numericStock,
      status: numericStock > 0 ? "Đang bán" : "Hết hàng",
    };
    setProducts((current) => editingProduct ? current.map((item) => item.id === editingProduct.id ? next : item) : [next, ...current]);
    setModal(null);
  };

  const saveCategory = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên và mô tả danh mục.");
      return;
    }
    const next: Category = {
      id: editingCategory?.id ?? `DM${String(categories.length + 1).padStart(3, "0")}`,
      name: name.trim(),
      description: description.trim(),
      productCount: editingCategory?.productCount ?? 0,
    };
    setCategories((current) => editingCategory ? current.map((item) => item.id === editingCategory.id ? next : item) : [next, ...current]);
    setModal(null);
  };

  const removeProduct = (item: Product) => Alert.alert("Xóa sản phẩm", `Bạn có chắc muốn xóa "${item.name}"?`, [
    { text: "Hủy", style: "cancel" },
    { text: "Xóa", style: "destructive", onPress: () => setProducts((current) => current.filter((value) => value.id !== item.id)) },
  ]);
  const removeCategory = (item: Category) => Alert.alert("Xóa danh mục", `Bạn có chắc muốn xóa "${item.name}"?`, [
    { text: "Hủy", style: "cancel" },
    { text: "Xóa", style: "destructive", onPress: () => setCategories((current) => current.filter((value) => value.id !== item.id)) },
  ]);

  return (
    <View style={styles.screen}>
      <Sidebar width={sidebarWidth} active={tab} />
      <View style={[styles.page, { marginLeft: sidebarWidth }]}>
        <View style={styles.header}>
          <Pressable style={styles.accountAdmin} onPress={() => Alert.alert("Tài khoản", "Bạn đang đăng nhập với quyền Admin.")}>
            <View style={styles.accountIcon}>
              <Ionicons name="person" size={18} color="#ed263d" />
            </View>
            <Text style={styles.accountName}>Admin</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={styles.pageHeading}>
            <View style={styles.headingLeft}>
              <View style={styles.headingIcon}>
                <Ionicons name={tab === "products" ? "cube-outline" : "grid-outline"} size={23} color="#fff" />
              </View>
              <View style={styles.headingText}>
                <Text style={styles.headingTitle}>{tab === "products" ? "Quản lý sản phẩm" : "Quản lý danh mục"}</Text>
                <Text style={styles.headingDescription}>Theo dõi và quản lý danh mục hàng hóa của cửa hàng.</Text>
              </View>
            </View>
            <Pressable style={styles.addButton} onPress={() => tab === "products" ? openProduct() : openCategory()}>
              <Ionicons name="add" size={19} color="#fff" />
              <Text style={styles.addButtonText}>{tab === "products" ? "Thêm sản phẩm" : "Thêm danh mục"}</Text>
            </Pressable>
          </View>

        <View style={styles.tabs}>
          <Pressable style={[styles.tab, tab === "products" && styles.tabActive]} onPress={() => { setTab("products"); setKeyword(""); }}>
            <Ionicons name="cube-outline" size={17} color={tab === "products" ? "#d9273e" : "#8791a5"} />
            <Text style={[styles.tabText, tab === "products" && styles.tabTextActive]}>Sản phẩm ({products.length})</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === "categories" && styles.tabActive]} onPress={() => { setTab("categories"); setKeyword(""); }}>
            <Ionicons name="grid-outline" size={17} color={tab === "categories" ? "#d9273e" : "#8791a5"} />
            <Text style={[styles.tabText, tab === "categories" && styles.tabTextActive]}>Danh mục ({categories.length})</Text>
          </Pressable>
        </View>

        {tab === "products" ? (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Tổng sản phẩm</Text><Text style={styles.summaryValue}>{products.length}</Text></View>
              <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Đang bán</Text><Text style={[styles.summaryValue, { color: "#16803d" }]}>{products.filter((item) => item.status === "Đang bán").length}</Text></View>
              <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Hết hàng</Text><Text style={[styles.summaryValue, { color: "#d9273e" }]}>{products.filter((item) => item.status === "Hết hàng").length}</Text></View>
            </View>
            <View style={styles.toolbar}>
              <View style={styles.searchBox}><Ionicons name="search-outline" size={18} color="#8791a5" /><TextInput value={keyword} onChangeText={setKeyword} placeholder="Tìm theo tên hoặc mã sản phẩm" placeholderTextColor="#9aa4b5" style={styles.searchInput} /></View>
              <Pressable style={styles.filter} onPress={() => setStatus(status === "Tất cả trạng thái" ? "Đang bán" : status === "Đang bán" ? "Hết hàng" : "Tất cả trạng thái")}>
                <Ionicons name="filter-outline" size={16} color="#59667d" /><Text style={styles.filterText}>{status}</Text><Ionicons name="chevron-down" size={15} color="#8791a5" />
              </Pressable>
            </View>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Danh sách sản phẩm</Text>
              {filteredProducts.map((item) => (
                <View style={styles.productRow} key={item.id}>
                  <View style={styles.productIcon}><Ionicons name="cube-outline" size={22} color="#d9273e" /></View>
                  <View style={styles.productInfo}><Text style={styles.rowName}>{item.name}</Text><Text style={styles.rowMeta}>{item.id} · {item.category}</Text></View>
                  <Text style={styles.price}>{money(item.price)}</Text>
                  <Text style={styles.stock}>{item.stock} sản phẩm</Text>
                  <Text style={[styles.status, item.status === "Đang bán" ? styles.available : styles.out]}>{item.status}</Text>
                  <View style={styles.actions}><Pressable onPress={() => openProduct(item)}><Ionicons name="create-outline" size={19} color="#64748b" /></Pressable><Pressable onPress={() => removeProduct(item)}><Ionicons name="trash-outline" size={19} color="#d9273e" /></Pressable></View>
                </View>
              ))}
              {filteredProducts.length === 0 && <Text style={styles.empty}>Không tìm thấy sản phẩm phù hợp.</Text>}
            </View>
          </>
        ) : (
          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Danh sách danh mục</Text>
            <View style={styles.toolbar}><View style={[styles.searchBox, { flex: 1 }]}><Ionicons name="search-outline" size={18} color="#8791a5" /><TextInput value={keyword} onChangeText={setKeyword} placeholder="Tìm danh mục" placeholderTextColor="#9aa4b5" style={styles.searchInput} /></View></View>
            {categories.filter((item) => `${item.id} ${item.name} ${item.description}`.toLocaleLowerCase("vi").includes(keyword.trim().toLocaleLowerCase("vi"))).map((item) => (
              <View style={styles.categoryRow} key={item.id}>
                <View style={styles.categoryIcon}><Ionicons name="grid-outline" size={21} color="#d9273e" /></View>
                <View style={styles.productInfo}><Text style={styles.rowName}>{item.name}</Text><Text style={styles.rowMeta}>{item.id} · {item.description}</Text></View>
                <Text style={styles.categoryCount}>{item.productCount} sản phẩm</Text>
                <View style={styles.actions}><Pressable onPress={() => openCategory(item)}><Ionicons name="create-outline" size={19} color="#64748b" /></Pressable><Pressable onPress={() => removeCategory(item)}><Ionicons name="trash-outline" size={19} color="#d9273e" /></Pressable></View>
              </View>
            ))}
          </View>
        )}
        </ScrollView>
      </View>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.overlay}><View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{modal === "product" ? (editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm") : (editingCategory ? "Sửa danh mục" : "Thêm danh mục")}</Text><Pressable onPress={() => setModal(null)}><Ionicons name="close" size={22} color="#64748b" /></Pressable></View>
          <ScrollView>
            <Field label={modal === "product" ? "Tên sản phẩm" : "Tên danh mục"} value={name} onChangeText={setName} />
            {modal === "product" ? <><Field label="Danh mục" value={category} onChangeText={setCategory} /><Field label="Giá bán" value={price} onChangeText={setPrice} keyboardType="numeric" /><Field label="Tồn kho" value={stock} onChangeText={setStock} keyboardType="numeric" /></> : <Field label="Mô tả" value={description} onChangeText={setDescription} />}
          </ScrollView>
          <View style={styles.modalActions}><Pressable style={styles.cancelButton} onPress={() => setModal(null)}><Text style={styles.cancelText}>Hủy</Text></Pressable><Pressable style={styles.saveButton} onPress={modal === "product" ? saveProduct : saveCategory}><Text style={styles.saveText}>Lưu thay đổi</Text></Pressable></View>
        </View></View>
      </Modal>
    </View>
  );
}

export default ProductManagement;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fc" },
  page: { flex: 1, height: "100%" },
  sidebar: { position: "absolute", left: 0, top: 0, bottom: 0, paddingTop: 20, paddingHorizontal: 13, paddingBottom: 12, backgroundColor: "#fff", borderRightWidth: 1, borderRightColor: "#f0f1f5", zIndex: 10, elevation: 4 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, marginBottom: 25 },
  brandImage: { width: 48, height: 48 }, brandText: { color: "#c8102e", fontSize: 21, fontWeight: "800" }, brandStrong: { color: "#8f101f" },
  menuHeading: { marginTop: 19, marginBottom: 8, marginLeft: 6, color: "#758198", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  menuLink: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, marginBottom: 5, borderRadius: 9 }, menuLinkActive: { backgroundColor: "#e52332", shadowColor: "#ed263d", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 5, elevation: 2 }, menuText: { flex: 1, color: "#354157", fontSize: 12, fontWeight: "500" }, menuTextActive: { color: "#fff", fontWeight: "600" }, promoImage: { width: 170, height: 150, alignSelf: "center", marginTop: 12 },
  header: { height: 70, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#edf0f5", zIndex: 2 },
  accountAdmin: { flexDirection: "row", alignItems: "center", gap: 8 }, accountIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#ffe5e9" }, accountName: { color: "#263248", fontSize: 14, fontWeight: "600" },
  content: { flex: 1 }, contentInner: { width: "100%", maxWidth: 1250, alignSelf: "center", padding: 24, paddingBottom: 40 },
  pageHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }, headingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 220 }, headingIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#ed3448", borderRadius: 10 }, headingText: { flex: 1 }, headingTitle: { marginBottom: 6, color: "#172033", fontSize: 23, fontWeight: "700" }, headingDescription: { color: "#8791a5", fontSize: 12, lineHeight: 18 }, addButton: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 12, backgroundColor: "#ed263d", borderWidth: 1, borderColor: "#ed263d", borderRadius: 8 }, addButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 18 }, tab: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0f5" }, tabActive: { borderColor: "#ffd1d7", backgroundColor: "#fff2f3" }, tabText: { color: "#8791a5", fontSize: 12, fontWeight: "600" }, tabTextActive: { color: "#d9273e" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 18 }, summaryCard: { flex: 1, padding: 16, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0f5" }, summaryLabel: { color: "#8791a5", fontSize: 11 }, summaryValue: { marginTop: 7, color: "#172033", fontSize: 22, fontWeight: "700" },
  toolbar: { flexDirection: "row", gap: 10, marginBottom: 16 }, searchBox: { flex: 2, minHeight: 43, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e3e7ee", borderRadius: 8, backgroundColor: "#fff" }, searchInput: { flex: 1, color: "#263248", fontSize: 12 }, filter: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e3e7ee", borderRadius: 8, backgroundColor: "#fff" }, filterText: { color: "#59667d", fontSize: 11 },
  listCard: { padding: 18, borderRadius: 11, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0f5" }, listTitle: { marginBottom: 14, color: "#172033", fontSize: 15, fontWeight: "700" }, productRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f0f2f6" }, productIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#fff0f2" }, productInfo: { flex: 1, minWidth: 120 }, rowName: { color: "#253047", fontSize: 12, fontWeight: "600" }, rowMeta: { marginTop: 4, color: "#8791a5", fontSize: 10 }, price: { width: 110, color: "#253047", fontSize: 11, fontWeight: "600" }, stock: { width: 95, color: "#647087", fontSize: 11 }, status: { width: 74, paddingVertical: 5, textAlign: "center", borderRadius: 12, overflow: "hidden", fontSize: 10, fontWeight: "600" }, available: { color: "#16803d", backgroundColor: "#dcfce7" }, out: { color: "#d9273e", backgroundColor: "#ffe4e8" }, actions: { flexDirection: "row", gap: 14, paddingHorizontal: 4 }, empty: { padding: 24, color: "#8791a5", textAlign: "center", fontSize: 12 },
  categoryRow: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: "#f0f2f6" }, categoryIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#fff0f2" }, categoryCount: { width: 100, color: "#647087", fontSize: 11 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(15, 23, 42, 0.4)" }, modal: { width: "100%", maxWidth: 470, maxHeight: "90%", padding: 20, borderRadius: 14, backgroundColor: "#fff" }, modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, modalTitle: { color: "#172033", fontSize: 17, fontWeight: "700" }, field: { marginBottom: 14 }, fieldLabel: { marginBottom: 6, color: "#59667d", fontSize: 11, fontWeight: "600" }, input: { minHeight: 43, paddingHorizontal: 11, borderWidth: 1, borderColor: "#e0e5ed", borderRadius: 8, color: "#253047", fontSize: 12 }, modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 }, cancelButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, backgroundColor: "#f1f3f6" }, cancelText: { color: "#59667d", fontSize: 12, fontWeight: "600" }, saveButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, backgroundColor: "#e5233b" }, saveText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
