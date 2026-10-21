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
import { createProductWithInboundMovement, Movement, MovementType, recordMovement, useStockData } from "./stock-store";

type StockTab = "inventory" | "movements";

const currency = (amount: number) => `${amount.toLocaleString("vi-VN")} đ`;

function Sidebar({ width, activeTab, compact }: { width: number; activeTab: StockTab; compact: boolean }) {
  const items = [
    ["Tổng quan", "home-outline", "/main_Admin", null],
    ["Quản lý đơn hàng", "cart-outline", "/order_management", null],
    ["Quản lý sản phẩm", "cube-outline", "/product_management", null],
    ["Quản lý danh mục", "grid-outline", "/category_management", null],
    ["Tồn kho", "file-tray-stacked-outline", "/stock_inventory", "inventory"],
    ["Nhập xuất kho", "swap-vertical-outline", "/stock_movements", "movements"],
    ["Quản lý khách hàng", "person-outline", "/customer_management", null],
  ] as const;

  if (compact) {
    return (
      <View style={styles.mobileNav}>
        <Image source={require("../../../../assets/image/logo.jpg")} style={styles.mobileBrandImage} resizeMode="contain" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNavLinks}>
          {items.map(([label, icon, route, page]) => {
            const selected = page === activeTab;
            return (
              <Pressable key={route} style={[styles.mobileNavLink, selected && styles.menuLinkActive]} onPress={() => !selected && router.push(route as never)}>
                <Ionicons name={icon} size={17} color={selected ? "#fff" : "#ed263d"} />
                <Text numberOfLines={1} style={[styles.menuText, selected && styles.menuTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.sidebar, { width }]}>
      <Pressable style={styles.brand} onPress={() => router.push("/main_Admin")}>
        <Image source={require("../../../../assets/image/logo.jpg")} style={styles.brandImage} resizeMode="contain" />
        <Text style={styles.brandText}>BVP <Text style={styles.brandStrong}>Shop</Text></Text>
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(([label, icon, route, page], index) => {
          const selected = page === activeTab;
          return (
            <React.Fragment key={route}>
              {index === 1 && <Text style={styles.menuHeading}>QUẢN LÝ</Text>}
              <Pressable
                style={[styles.menuLink, selected && styles.menuLinkActive]}
                onPress={() => !selected && router.push(route as never)}
              >
                <Ionicons name={icon} size={19} color={selected ? "#fff" : "#ed263d"} />
                <Text numberOfLines={1} style={[styles.menuText, selected && styles.menuTextActive]}>{label}</Text>
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

export default function StockManagement({ initialTab }: { initialTab: StockTab }) {
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const sidebarWidth = compact ? 0 : width <= 768 ? 220 : 255;
  const { products, movements, error: stockError } = useStockData();
  const [query, setQuery] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<"Tất cả" | "Sắp hết" | "Hết hàng">("Tất cả");
  const [movementFilter, setMovementFilter] = useState<"Tất cả" | MovementType>("Tất cả");
  const [modalVisible, setModalVisible] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>("Nhập kho");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("SP0001");
  const [quantity, setQuantity] = useState("");
  const [partner, setPartner] = useState("");
  const [note, setNote] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductMinimum, setNewProductMinimum] = useState("5");

  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= product.minimum).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const stockValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return products.filter((product) => {
      const matchesQuery = `${product.id} ${product.name} ${product.category}`.toLocaleLowerCase("vi").includes(normalized);
      const matchesFilter = inventoryFilter === "Tất cả"
        || (inventoryFilter === "Hết hàng" ? product.stock === 0 : product.stock > 0 && product.stock <= product.minimum);
      return matchesQuery && matchesFilter;
    });
  }, [inventoryFilter, products, query]);

  const filteredMovements = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return movements.filter((movement) => {
      const matchesQuery = `${movement.id} ${movement.productName} ${movement.partner}`.toLocaleLowerCase("vi").includes(normalized);
      return matchesQuery && (movementFilter === "Tất cả" || movement.type === movementFilter);
    });
  }, [movementFilter, movements, query]);

  const selectedProduct = products.find((product) => product.id === selectedProductId);

  function openMovement(type: MovementType = "Nhập kho") {
    setCreatingProduct(false);
    setMovementType(type);
    setSelectedProductId(products[0]?.id ?? "");
    setQuantity("");
    setPartner("");
    setNote("");
    setModalVisible(true);
  }

  function saveMovement() {
    const amount = Number(quantity);
    const product = products.find((item) => item.id === selectedProductId);
    if (!Number.isInteger(amount) || amount <= 0) {
      Alert.alert("Thông tin chưa hợp lệ", "Vui lòng chọn sản phẩm và nhập số lượng nguyên lớn hơn 0.");
      return;
    }
    if (creatingProduct) {
      const price = Number(newProductPrice);
      const minimum = Number(newProductMinimum);
      if (!newProductName.trim() || !newProductCategory.trim() || !newProductPrice.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(minimum) || minimum < 0) {
        Alert.alert("Thông tin chưa hợp lệ", "Vui lòng nhập tên, danh mục, giá hợp lệ và mức tồn tối thiểu là số nguyên không âm.");
        return;
      }
      void createProductWithInboundMovement({ name: newProductName, category: newProductCategory, price, minimum, quantity: amount, partner, note })
        .then(() => {
          setModalVisible(false);
          setCreatingProduct(false);
          setNewProductName("");
          setNewProductCategory("");
          setNewProductPrice("");
          setNewProductMinimum("5");
        })
        .catch((error: unknown) => Alert.alert("Không thể lưu phiếu", error instanceof Error ? error.message : "Vui lòng thử lại."));
      return;
    }
    if (!product) {
      Alert.alert("Thông tin chưa hợp lệ", "Vui lòng chọn sản phẩm.");
      return;
    }
    if (movementType === "Xuất kho" && amount > product.stock) {
      Alert.alert("Không đủ tồn kho", `Sản phẩm hiện chỉ còn ${product.stock} sản phẩm.`);
      return;
    }
    const movement: Movement = {
      id: `${movementType === "Nhập kho" ? "PN" : "PX"}${Date.now()}`,
      type: movementType,
      productId: product.id,
      productName: product.name,
      quantity: amount,
      partner: partner.trim() || (movementType === "Nhập kho" ? "Nhà cung cấp" : "Xuất kho nội bộ"),
      note: note.trim() || (movementType === "Nhập kho" ? "Nhập hàng" : "Xuất hàng"),
      date: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
    };
    void recordMovement(movement)
      .then(() => setModalVisible(false))
      .catch((error: unknown) => Alert.alert(
        "Không thể lưu phiếu",
        error instanceof Error ? error.message : "Vui lòng thử lại.",
      ));
  }

  const title = initialTab === "inventory" ? "Quản lý tồn kho" : "Nhập xuất kho";

  return (
    <View style={styles.screen}>
      <Sidebar width={sidebarWidth} activeTab={initialTab} compact={compact} />
      <View style={[styles.page, compact && styles.pageCompact, { marginLeft: sidebarWidth, width: Math.max(0, width - sidebarWidth) }]}>
        <View style={styles.header}>
          <View style={styles.admin}>
            <View style={styles.adminIcon}><Ionicons name="person" size={17} color="#d9273e" /></View>
            {!compact && <Text style={styles.adminName}>Admin</Text>}
          </View>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
          <View style={styles.pageHeading}>
            <View style={styles.headingLeft}>
              <View style={styles.headingIcon}><Ionicons name={initialTab === "inventory" ? "file-tray-stacked-outline" : "swap-vertical-outline"} size={22} color="#fff" /></View>
              <View style={styles.headingText}>
                <Text style={styles.headingTitle}>{title}</Text>
                <Text style={styles.headingDescription}>
                  {initialTab === "inventory" ? "Theo dõi số lượng và giá trị hàng hóa trong kho." : "Theo dõi lịch sử và ghi nhận các phiếu nhập, xuất kho."}
                </Text>
              </View>
            </View>
            {initialTab === "inventory" ? (
              <Pressable style={styles.primaryButton} onPress={() => router.push("/stock_movements" as never)}>
                <Ionicons name="add" size={18} color="#fff" /><Text style={styles.primaryButtonText}>Tạo phiếu</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primaryButton} onPress={() => openMovement()}>
                <Ionicons name="add" size={18} color="#fff" /><Text style={styles.primaryButtonText}>Tạo phiếu mới</Text>
              </Pressable>
            )}
          </View>

          {stockError && <Text style={styles.emptyText}>Không tải được dữ liệu SQL Server: {stockError}</Text>}

          {initialTab === "inventory" ? (
            <>
              <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
                <SummaryCard label="Tổng sản phẩm" value={`${products.length}`} icon="cube-outline" color="#ed263d" background="#fff0f1" />
                <SummaryCard label="Sắp hết hàng" value={`${lowStock}`} icon="alert-circle-outline" color="#d97706" background="#fff6e5" />
                <SummaryCard label="Hết hàng" value={`${outOfStock}`} icon="close-circle-outline" color="#dc3545" background="#ffe9ec" />
                <SummaryCard label="Giá trị tồn kho" value={currency(stockValue)} icon="cash-outline" color="#16803d" background="#e9f8ef" />
              </View>
              <View style={styles.panel}>
                <View style={styles.toolbar}>
                  <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={18} color="#8791a5" />
                    <TextInput value={query} onChangeText={setQuery} placeholder="Tìm tên hoặc mã sản phẩm" placeholderTextColor="#9aa4b5" style={styles.searchInput} />
                  </View>
                  <View style={styles.filterRow}>
                    {(["Tất cả", "Sắp hết", "Hết hàng"] as const).map((filter) => (
                      <Pressable key={filter} style={[styles.filterChip, inventoryFilter === filter && styles.filterChipActive]} onPress={() => setInventoryFilter(filter)}>
                        <Text style={[styles.filterText, inventoryFilter === filter && styles.filterTextActive]}>{filter}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Text style={styles.panelTitle}>Danh sách tồn kho <Text style={styles.panelCount}>({filteredProducts.length})</Text></Text>
                {filteredProducts.map((product) => (
                  <View key={product.id} style={[styles.productRow, compact && styles.productRowCompact]}>
                    <View style={styles.productIcon}><Ionicons name="cube-outline" size={21} color="#d9273e" /></View>
                    <View style={[styles.productInfo, compact && styles.productInfoCompact]}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.mutedText}>{product.id} · {product.category}</Text>
                    </View>
                    <View style={[styles.stockValueWrap, compact && styles.stockValueWrapCompact]}>
                      <Text style={styles.stockQuantity}>{product.stock} <Text style={styles.mutedText}>sp</Text></Text>
                      <Text style={styles.mutedText}>Tối thiểu {product.minimum}</Text>
                    </View>
                    <View style={[styles.stockBadge, compact && styles.stockBadgeCompact, product.stock === 0 ? styles.stockBadgeEmpty : product.stock <= product.minimum ? styles.stockBadgeLow : styles.stockBadgeGood]}>
                      <Text style={[styles.stockBadgeText, product.stock === 0 ? styles.textDanger : product.stock <= product.minimum ? styles.textWarning : styles.textGood]}>
                        {product.stock === 0 ? "Hết hàng" : product.stock <= product.minimum ? "Sắp hết" : "Còn hàng"}
                      </Text>
                    </View>
                    <Text style={[styles.productPrice, compact && styles.productPriceCompact]}>{currency(product.price * product.stock)}</Text>
                  </View>
                ))}
                {filteredProducts.length === 0 && <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp.</Text>}
              </View>
            </>
          ) : (
            <>
              <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
                <SummaryCard label="Phiếu nhập" value={`${movements.filter((item) => item.type === "Nhập kho").length}`} icon="download-outline" color="#16803d" background="#e9f8ef" />
                <SummaryCard label="Phiếu xuất" value={`${movements.filter((item) => item.type === "Xuất kho").length}`} icon="share-outline" color="#ed263d" background="#fff0f1" />
                <SummaryCard label="Sản phẩm trong kho" value={`${products.length}`} icon="cube-outline" color="#2563eb" background="#edf4ff" />
              </View>
              <View style={[styles.panel, styles.movementPanel, compact && styles.movementPanelCompact]}>
                <View style={styles.toolbar}>
                  <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={18} color="#8791a5" />
                    <TextInput value={query} onChangeText={setQuery} placeholder="Tìm mã phiếu, sản phẩm, đối tác" placeholderTextColor="#9aa4b5" style={styles.searchInput} />
                  </View>
                  <View style={styles.filterRow}>
                    {(["Tất cả", "Nhập kho", "Xuất kho"] as const).map((filter) => (
                      <Pressable key={filter} style={[styles.filterChip, movementFilter === filter && styles.filterChipActive]} onPress={() => setMovementFilter(filter)}>
                        <Text style={[styles.filterText, movementFilter === filter && styles.filterTextActive]}>{filter}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={styles.movementListHeading}>
                  <View>
                    <Text style={styles.panelTitle}>Lịch sử giao dịch</Text>
                    <Text style={styles.movementListSubtitle}>Các thay đổi hàng hóa gần đây</Text>
                  </View>
                  <View style={styles.resultCount}><Text style={styles.resultCountText}>{filteredMovements.length} phiếu</Text></View>
                </View>
                {filteredMovements.map((movement) => (
                  <View key={movement.id} style={[styles.movementCard, compact && styles.movementCardCompact]}>
                    <View style={styles.movementCardTop}>
                      <View style={styles.movementReference}>
                        <View style={[styles.movementIcon, movement.type === "Nhập kho" ? styles.inboundIcon : styles.outboundIcon]}>
                          <Ionicons name={movement.type === "Nhập kho" ? "arrow-down" : "arrow-up"} size={18} color={movement.type === "Nhập kho" ? "#16803d" : "#d9273e"} />
                        </View>
                        <View>
                          <Text style={styles.movementCode}>{movement.id}</Text>
                          <Text style={styles.movementDate}>{movement.date}</Text>
                        </View>
                      </View>
                      <View style={[styles.movementTypeBadge, movement.type === "Nhập kho" ? styles.stockBadgeGood : styles.stockBadgeEmpty]}>
                        <Text style={[styles.stockBadgeText, movement.type === "Nhập kho" ? styles.textGood : styles.textDanger]}>{movement.type}</Text>
                      </View>
                    </View>
                    <View style={styles.movementCardMain}>
                      <View style={styles.movementProductInfo}>
                        <Text style={styles.movementProductName}>{movement.productName}</Text>
                        <Text style={styles.movementProductId}>{movement.productId}</Text>
                      </View>
                      <Text style={[styles.movementAmount, movement.type === "Nhập kho" ? styles.textGood : styles.textDanger]}>
                        {movement.type === "Nhập kho" ? "+" : "−"}{movement.quantity} <Text style={styles.movementUnit}>sp</Text>
                      </Text>
                    </View>
                    <View style={styles.movementCardFooter}>
                      <Ionicons name={movement.type === "Nhập kho" ? "business-outline" : "person-outline"} size={14} color="#8791a5" />
                      <Text style={styles.movementPartner} numberOfLines={2}>{movement.partner}</Text>
                    </View>
                    {!!movement.note && <Text style={styles.movementNote}>{movement.note}</Text>}
                  </View>
                ))}
                {filteredMovements.length === 0 && <Text style={styles.emptyText}>Chưa có phiếu nhập xuất phù hợp.</Text>}
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalEyebrow}>QUẢN LÝ KHO</Text>
                <Text style={styles.modalTitle}>{movementType === "Nhập kho" ? "Tạo phiếu nhập kho" : "Tạo phiếu xuất kho"}</Text>
                <Text style={styles.modalDescription}>Điền thông tin để cập nhật số lượng tồn</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)} accessibilityLabel="Đóng">
                <Ionicons name="close" size={22} color="#64748b" />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {!creatingProduct ? (
                <>
                  <Text style={styles.fieldLabel}>LOẠI GIAO DỊCH</Text>
                  <View style={styles.typeSelector}>
                    {(["Nhập kho", "Xuất kho"] as const).map((type) => (
                      <Pressable key={type} style={[styles.typeOption, movementType === type && (type === "Nhập kho" ? styles.inboundSelected : styles.outboundSelected)]} onPress={() => setMovementType(type)}>
                        <View style={[styles.typeOptionIcon, type === "Nhập kho" ? styles.inboundIcon : styles.outboundIcon]}>
                          <Ionicons name={type === "Nhập kho" ? "arrow-down" : "arrow-up"} size={17} color={type === "Nhập kho" ? "#16803d" : "#d9273e"} />
                        </View>
                        <View style={styles.typeOptionCopy}>
                          <Text style={[styles.typeOptionText, movementType === type && (type === "Nhập kho" ? styles.textGood : styles.textDanger)]}>{type}</Text>
                          <Text style={styles.typeOptionHint}>{type === "Nhập kho" ? "Cộng vào tồn kho" : "Trừ khỏi tồn kho"}</Text>
                        </View>
                        {movementType === type && <Ionicons name="checkmark-circle" size={19} color={type === "Nhập kho" ? "#16803d" : "#d9273e"} />}
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.sectionHeading}>
                    <Text style={styles.fieldLabel}>SẢN PHẨM</Text>
                    <Text style={styles.sectionMeta}>{products.length} mặt hàng</Text>
                  </View>
                  <ScrollView style={styles.productPicker} showsVerticalScrollIndicator nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {products.map((product) => (
                      <Pressable key={product.id} style={[styles.productOption, selectedProductId === product.id && styles.productOptionSelected]} onPress={() => setSelectedProductId(product.id)}>
                        <View style={[styles.pickerProductIcon, selectedProductId === product.id && styles.pickerProductIconSelected]}>
                          <Ionicons name="cube-outline" size={17} color={selectedProductId === product.id ? "#d9273e" : "#8791a5"} />
                        </View>
                        <View style={styles.pickerProductCopy}>
                          <Text style={styles.productOptionName} numberOfLines={1}>{product.name}</Text>
                          <Text style={styles.productOptionMeta}>{product.id} · {product.category}</Text>
                        </View>
                        <View style={styles.pickerStock}>
                          <Text style={styles.pickerStockValue}>{product.stock}</Text>
                          <Text style={styles.pickerStockLabel}>tồn</Text>
                        </View>
                        {selectedProductId === product.id && <Ionicons name="checkmark-circle" size={19} color="#d9273e" />}
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable style={styles.addProductLink} onPress={() => {
                    setMovementType("Nhập kho");
                    setCreatingProduct(true);
                    setNewProductName("");
                    setNewProductCategory("");
                    setNewProductPrice("");
                    setNewProductMinimum("5");
                  }}>
                    <Ionicons name="add-circle-outline" size={17} color="#d9273e" />
                    <Text style={styles.addProductLinkText}>Sản phẩm chưa có? Thêm sản phẩm mới</Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.newProductCard}>
                  <Pressable style={styles.backToProducts} onPress={() => setCreatingProduct(false)}>
                    <Ionicons name="arrow-back" size={15} color="#64748b" />
                    <Text style={styles.backToProductsText}>Quay lại danh sách sản phẩm</Text>
                  </Pressable>
                  <View style={styles.newProductHeading}>
                    <View style={styles.newProductIcon}><Ionicons name="cube-outline" size={18} color="#d9273e" /></View>
                    <View style={styles.newProductCopy}>
                      <Text style={styles.newProductTitle}>Thông tin sản phẩm mới</Text>
                      <Text style={styles.newProductHint}>Phiếu nhập đầu tiên sẽ được tạo cùng sản phẩm</Text>
                    </View>
                  </View>
                  <FormField label="Tên sản phẩm" value={newProductName} onChangeText={setNewProductName} placeholder="Ví dụ: Tai nghe không dây" />
                  <FormField label="Danh mục" value={newProductCategory} onChangeText={setNewProductCategory} placeholder="Ví dụ: Phụ kiện" />
                  <View style={styles.newProductFields}>
                    <View style={styles.newProductHalf}>
                      <FormField label="Giá bán (đ)" value={newProductPrice} onChangeText={setNewProductPrice} placeholder="0" keyboardType="numeric" />
                    </View>
                    <View style={styles.newProductHalf}>
                      <FormField label="Tồn tối thiểu" value={newProductMinimum} onChangeText={setNewProductMinimum} placeholder="5" keyboardType="numeric" />
                    </View>
                  </View>
                </View>
              )}
              <FormField label="Số lượng" value={quantity} onChangeText={setQuantity} placeholder="Ví dụ: 10" keyboardType="numeric" />
              {movementType === "Xuất kho" && selectedProduct && Number(quantity) > 0 && Number.isInteger(Number(quantity)) && (
                <View style={[styles.stockAfterBox, Number(quantity) > selectedProduct.stock && styles.stockAfterError]}>
                  <Ionicons name={Number(quantity) > selectedProduct.stock ? "warning-outline" : "information-circle-outline"} size={16} color={Number(quantity) > selectedProduct.stock ? "#dc3545" : "#64748b"} />
                  <Text style={[styles.stockAfterText, Number(quantity) > selectedProduct.stock && styles.textDanger]}>
                    {Number(quantity) > selectedProduct.stock
                      ? `Chỉ còn ${selectedProduct.stock} sản phẩm trong kho`
                      : `Tồn kho sau khi xuất: ${selectedProduct.stock - Number(quantity)} sản phẩm`}
                  </Text>
                </View>
              )}
              <FormField label={movementType === "Nhập kho" ? "Nhà cung cấp" : "Mã đơn hàng / nơi nhận"} value={partner} onChangeText={setPartner} placeholder={movementType === "Nhập kho" ? "Tên nhà cung cấp" : "Đơn hàng hoặc nơi nhận"} />
              <FormField label="Ghi chú" value={note} onChangeText={setNote} placeholder="Ghi chú thêm (không bắt buộc)" />
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Hủy</Text></Pressable>
              <Pressable style={[styles.primaryButton, movementType === "Xuất kho" && styles.outboundButton]} onPress={saveMovement}>
                <Ionicons name={movementType === "Nhập kho" ? "arrow-down" : "arrow-up"} size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>{movementType === "Nhập kho" ? "Tạo phiếu nhập" : "Tạo phiếu xuất"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SummaryCard({ label, value, icon, color, background }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; background: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: background }]}><Ionicons name={icon} size={19} color={color} /></View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "default" | "numeric" }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9aa4b5" keyboardType={keyboardType} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fc" },
  page: { flex: 1, height: "100%" },
  pageCompact: { paddingTop: 58 },
  mobileNav: { position: "absolute", left: 0, right: 0, top: 0, height: 58, zIndex: 10, elevation: 4, flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 10, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f1f5" },
  mobileBrandImage: { width: 34, height: 34 },
  mobileNavLinks: { alignItems: "center", gap: 5, paddingRight: 10 },
  mobileNavLink: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, borderRadius: 8 },
  sidebar: { position: "absolute", left: 0, top: 0, bottom: 0, paddingTop: 20, paddingHorizontal: 13, paddingBottom: 12, backgroundColor: "#fff", borderRightWidth: 1, borderRightColor: "#f0f1f5", zIndex: 10, elevation: 4 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, marginBottom: 25 },
  brandImage: { width: 48, height: 48 },
  brandText: { color: "#c8102e", fontSize: 21, fontWeight: "800" },
  brandStrong: { color: "#8f101f" },
  menuHeading: { marginTop: 19, marginBottom: 8, marginLeft: 6, color: "#758198", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  menuLink: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, marginBottom: 5, borderRadius: 9 },
  menuLinkActive: { backgroundColor: "#e52332", shadowColor: "#ed263d", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 5, elevation: 2 },
  menuText: { flex: 1, color: "#354157", fontSize: 12, fontWeight: "500" },
  menuTextActive: { color: "#fff", fontWeight: "600" },
  promoImage: { width: 170, height: 150, alignSelf: "center", marginTop: 12 },
  header: { height: 70, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#edf0f5", zIndex: 2 },
  admin: { flexDirection: "row", alignItems: "center", gap: 8 },
  adminIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#ffe5e9" },
  adminName: { color: "#263248", fontSize: 14, fontWeight: "600" },
  content: { flex: 1 },
  contentInner: { width: "100%", maxWidth: 1250, alignSelf: "center", padding: 24, paddingBottom: 40 },
  pageHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 },
  headingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 220 },
  headingIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#ed3448", borderRadius: 10 },
  headingText: { flex: 1 },
  headingTitle: { marginBottom: 5, color: "#172033", fontSize: 23, fontWeight: "700" },
  headingDescription: { color: "#8791a5", fontSize: 12, lineHeight: 18 },
  primaryButton: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 13, backgroundColor: "#ed263d", borderRadius: 8 },
  primaryButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  summaryRowCompact: { flexWrap: "wrap" },
  summaryCard: { flex: 1, minWidth: 135, padding: 15, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0f5" },
  summaryIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9, marginBottom: 12 },
  summaryLabel: { color: "#8791a5", fontSize: 11 },
  summaryValue: { marginTop: 6, color: "#172033", fontSize: 19, fontWeight: "700" },
  panel: { padding: 18, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0f5" },
  movementPanel: { padding: 20 },
  movementPanelCompact: { padding: 14 },
  toolbar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 16 },
  searchBox: { flex: 1, minWidth: 210, minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e3e7ee", borderRadius: 8, backgroundColor: "#fff" },
  searchInput: { flex: 1, color: "#263248", fontSize: 12, minHeight: 40 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 7, backgroundColor: "#f7f8fa", borderWidth: 1, borderColor: "#edf0f5" },
  filterChipActive: { backgroundColor: "#fff0f1", borderColor: "#ffd1d7" },
  filterText: { color: "#758198", fontSize: 11, fontWeight: "600" },
  filterTextActive: { color: "#d9273e" },
  panelTitle: { marginBottom: 5, color: "#263248", fontSize: 14, fontWeight: "700" },
  panelCount: { color: "#8791a5", fontWeight: "500" },
  movementListHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2, marginBottom: 10 },
  movementListSubtitle: { color: "#8791a5", fontSize: 11 },
  resultCount: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: "#f4f6f9" },
  resultCountText: { color: "#64748b", fontSize: 10, fontWeight: "600" },
  productRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f2f6" },
  productRowCompact: { flexWrap: "wrap", rowGap: 8, paddingVertical: 14 },
  productIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#fff0f1" },
  productInfo: { flex: 1, minWidth: 120 },
  productInfoCompact: { minWidth: 180 },
  productName: { color: "#263248", fontSize: 12, fontWeight: "600" },
  mutedText: { marginTop: 4, color: "#8791a5", fontSize: 10 },
  stockValueWrap: { width: 90 },
  stockValueWrapCompact: { marginLeft: 52, width: 84 },
  stockQuantity: { color: "#263248", fontSize: 13, fontWeight: "700" },
  stockBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  stockBadgeCompact: { marginLeft: 52 },
  stockBadgeGood: { backgroundColor: "#e9f8ef" },
  stockBadgeLow: { backgroundColor: "#fff6e5" },
  stockBadgeEmpty: { backgroundColor: "#ffe9ec" },
  stockBadgeText: { fontSize: 10, fontWeight: "600" },
  textGood: { color: "#16803d" },
  textWarning: { color: "#d97706" },
  textDanger: { color: "#dc3545" },
  productPrice: { width: 115, textAlign: "right", color: "#354157", fontSize: 11, fontWeight: "600" },
  productPriceCompact: { flex: 1, width: undefined, textAlign: "left" },
  emptyText: { paddingVertical: 24, textAlign: "center", color: "#8791a5", fontSize: 12 },
  movementCard: { padding: 15, marginTop: 10, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0f5" },
  movementCardCompact: { padding: 12, marginTop: 9 },
  movementCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f0f2f6" },
  movementReference: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  movementIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  inboundIcon: { backgroundColor: "#e9f8ef" },
  outboundIcon: { backgroundColor: "#fff0f1" },
  movementCode: { color: "#354157", fontSize: 11, fontWeight: "700" },
  movementDate: { marginTop: 4, color: "#8791a5", fontSize: 10 },
  movementCardMain: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 12 },
  movementProductInfo: { flex: 1 },
  movementProductName: { color: "#172033", fontSize: 14, fontWeight: "700" },
  movementProductId: { marginTop: 4, color: "#8791a5", fontSize: 10 },
  movementAmount: { fontSize: 18, fontWeight: "800" },
  movementUnit: { fontSize: 10, fontWeight: "600" },
  movementTypeBadge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  movementCardFooter: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 12 },
  movementPartner: { flex: 1, color: "#64748b", fontSize: 11, lineHeight: 16 },
  movementNote: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f3f4f6", color: "#8791a5", fontSize: 10, lineHeight: 15 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16, backgroundColor: "rgba(15, 23, 42, 0.45)" },
  modal: { width: "100%", maxWidth: 540, maxHeight: "92%", padding: 22, borderRadius: 18, backgroundColor: "#fff" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  modalHeading: { flex: 1 },
  modalEyebrow: { marginBottom: 5, color: "#d9273e", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  modalTitle: { color: "#172033", fontSize: 19, fontWeight: "700" },
  modalDescription: { marginTop: 5, color: "#8791a5", fontSize: 11 },
  closeButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#f4f6f9" },
  fieldLabel: { marginBottom: 7, color: "#354157", fontSize: 11, fontWeight: "600" },
  typeSelector: { flexDirection: "row", gap: 10, marginBottom: 18 },
  typeOption: { flex: 1, minHeight: 66, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 10, borderWidth: 1, borderColor: "#e8ebf0", borderRadius: 12, backgroundColor: "#fff" },
  inboundSelected: { borderColor: "#a6dfb8", backgroundColor: "#f4fcf6" },
  outboundSelected: { borderColor: "#ffc1c8", backgroundColor: "#fff7f8" },
  typeOptionIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  typeOptionCopy: { flex: 1 },
  typeOptionText: { color: "#354157", fontSize: 11, fontWeight: "700" },
  typeOptionHint: { marginTop: 4, color: "#8791a5", fontSize: 9 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  sectionMeta: { marginBottom: 7, color: "#8791a5", fontSize: 10 },
  productPicker: { maxHeight: 180, marginBottom: 10, borderWidth: 1, borderColor: "#e8ebf0", borderRadius: 12 },
  productOption: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f2f6" },
  productOptionSelected: { backgroundColor: "#fff7f8" },
  pickerProductIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#f4f6f9" },
  pickerProductIconSelected: { backgroundColor: "#ffe9ec" },
  pickerProductCopy: { flex: 1, minWidth: 0 },
  productOptionName: { color: "#263248", fontSize: 11, fontWeight: "600" },
  productOptionMeta: { marginTop: 4, color: "#8791a5", fontSize: 9 },
  pickerStock: { minWidth: 38, alignItems: "center" },
  pickerStockValue: { color: "#263248", fontSize: 12, fontWeight: "700" },
  pickerStockLabel: { marginTop: 2, color: "#8791a5", fontSize: 9 },
  addProductLink: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 14, paddingHorizontal: 4 },
  addProductLinkText: { color: "#d9273e", fontSize: 11, fontWeight: "600" },
  newProductCard: { padding: 13, marginBottom: 15, borderWidth: 1, borderColor: "#ffd5da", borderRadius: 12, backgroundColor: "#fffafb" },
  newProductHeading: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 14 },
  newProductIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#ffe9ec" },
  newProductCopy: { flex: 1 },
  newProductTitle: { color: "#263248", fontSize: 12, fontWeight: "700" },
  newProductHint: { marginTop: 3, color: "#8791a5", fontSize: 9 },
  newProductFields: { flexDirection: "row", gap: 10 },
  newProductHalf: { flex: 1 },
  backToProducts: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingVertical: 4 },
  backToProductsText: { color: "#64748b", fontSize: 10, fontWeight: "600" },
  stockAfterBox: { flexDirection: "row", alignItems: "center", gap: 7, padding: 10, marginTop: -6, marginBottom: 14, borderRadius: 9, backgroundColor: "#f4f6f9" },
  stockAfterError: { backgroundColor: "#fff0f1" },
  stockAfterText: { color: "#64748b", fontSize: 10, fontWeight: "500" },
  formField: { marginBottom: 14 },
  input: { minHeight: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: "#e3e7ee", borderRadius: 8, color: "#263248", fontSize: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 9, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f0f2f6" },
  outboundButton: { backgroundColor: "#ed263d" },
  cancelButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 16, borderWidth: 1, borderColor: "#e3e7ee", borderRadius: 8 },
  cancelText: { color: "#64748b", fontSize: 12, fontWeight: "600" },
});
