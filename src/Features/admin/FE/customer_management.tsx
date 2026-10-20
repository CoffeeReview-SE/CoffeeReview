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

// Dữ liệu cần hiển thị cho từng đơn hàng trong lịch sử mua sắm.
type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  payment: string;
};
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  status: "Hoạt động" | "Đã khóa";
  address: string;
  orders: Order[];
  history: string[];
};

// Dữ liệu mẫu dựng sẵn trên giao diện; hiện chưa được lấy từ backend.
const initialCustomers: Customer[] = [
  {
    id: "KH0001",
    name: "Nguyễn Minh Anh",
    email: "minhanh@example.com",
    phone: "0901 234 567",
    joined: "12/08/2025",
    status: "Hoạt động",
    address: "32 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    orders: [
      {
        id: "BVP001258",
        date: "28/09/2025",
        total: 12500000,
        status: "Hoàn thành",
        payment: "COD",
      },
      {
        id: "BVP001142",
        date: "16/08/2025",
        total: 2490000,
        status: "Đang giao",
        payment: "Chuyển khoản",
      },
      {
        id: "BVP001087",
        date: "02/07/2025",
        total: 890000,
        status: "Đã hủy",
        payment: "COD",
      },
    ],
    history: [
      "Tài khoản được tạo ngày 12/08/2025",
      "Hồ sơ được cập nhật ngày 18/09/2025",
    ],
  },
  {
    id: "KH0002",
    name: "Trần Quốc Bảo",
    email: "quocbao@example.com",
    phone: "0987 654 321",
    joined: "04/09/2025",
    status: "Hoạt động",
    address: "18 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    orders: [
      {
        id: "BVP001257",
        date: "28/09/2025",
        total: 2490000,
        status: "Hoàn thành",
        payment: "Chuyển khoản",
      },
      {
        id: "BVP001104",
        date: "12/09/2025",
        total: 1710000,
        status: "Hoàn thành",
        payment: "COD",
      },
    ],
    history: ["Tài khoản được tạo ngày 04/09/2025"],
  },
  {
    id: "KH0003",
    name: "Lê Thu Hà",
    email: "thuha@example.com",
    phone: "0912 345 678",
    joined: "21/09/2025",
    status: "Hoạt động",
    address: "Chưa thêm địa chỉ giao hàng",
    orders: [],
    history: ["Tài khoản được tạo ngày 21/09/2025"],
  },
  {
    id: "KH0004",
    name: "Phạm Hoàng Nam",
    email: "hoangnam@example.com",
    phone: "0934 567 890",
    joined: "09/05/2025",
    status: "Đã khóa",
    address: "75 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
    orders: [
      {
        id: "BVP001031",
        date: "11/08/2025",
        total: 4200000,
        status: "Hoàn thành",
        payment: "COD",
      },
      {
        id: "BVP000982",
        date: "02/07/2025",
        total: 4700000,
        status: "Đã hủy",
        payment: "COD",
      },
    ],
    history: [
      "Tài khoản được tạo ngày 09/05/2025",
      "Tài khoản bị khóa ngày 22/09/2025: Yêu cầu xác minh giao dịch",
    ],
  },
  {
    id: "KH0005",
    name: "Đỗ Ngọc Linh",
    email: "ngoclinh@example.com",
    phone: "0976 111 222",
    joined: "26/09/2025",
    status: "Hoạt động",
    address: "120 Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh",
    orders: [
      {
        id: "BVP001260",
        date: "29/09/2025",
        total: 5690000,
        status: "Đang xử lý",
        payment: "Chuyển khoản",
      },
    ],
    history: ["Tài khoản được tạo ngày 26/09/2025"],
  },
  {
    id: "KH0006",
    name: "Võ Thành Đạt",
    email: "thanhdat@example.com",
    phone: "0968 222 333",
    joined: "15/06/2025",
    status: "Hoạt động",
    address: "Chưa thêm địa chỉ giao hàng",
    orders: [],
    history: ["Tài khoản được tạo ngày 15/06/2025"],
  },
];

const statusOptions = [
  "Tất cả trạng thái",
  "Hoạt động",
  "Chưa mua hàng",
  "Đã khóa",
];
const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
// Chỉ cộng các đơn đã hoàn thành để phản ánh số tiền chi tiêu thành công.
const successfulSpend = (customer: Customer) =>
  customer.orders
    .filter((order) => order.status === "Hoàn thành")
    .reduce((sum, order) => sum + order.total, 0);

function Sidebar({ width }: { width: number }) {
  const items = [
    ["Tổng quan", "home-outline", "/main_Admin"],
    ["Quản lý đơn hàng", "cart-outline", "/order_management"],
    ["Quản lý sản phẩm", "cube-outline", "/product_management"],
    ["Quản lý danh mục", "grid-outline", "/category_management"],
    ["Tồn kho", "file-tray-stacked-outline", "/stock_inventory"],
    ["Nhập xuất kho", "swap-vertical-outline", "/stock_movements"],
    ["Quản lý khách hàng", "people-outline", "/customer_management"],
  ] as const;
  return (
    <View style={[styles.sidebar, { width }]}>
      <Pressable
        style={styles.brand}
        onPress={() => router.push("/main_Admin")}
      >
        <Image
          source={require("../../../../assets/image/logo.jpg")}
          style={styles.brandImage}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>
          BVP <Text style={styles.brandStrong}>Shop</Text>
        </Text>
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(([label, icon, route], index) => (
          <React.Fragment key={route}>
            {index === 1 && <Text style={styles.menuHeading}>QUẢN LÝ</Text>}
            <Pressable
              style={[styles.menuLink, index === 6 && styles.menuActive]}
              onPress={() => index !== 6 && router.push(route as never)}
            >
              <Ionicons
                name={icon}
                size={19}
                color={index === 6 ? "#fff" : "#ed263d"}
              />
              <Text
                numberOfLines={1}
                style={[styles.menuText, index === 6 && styles.menuTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}
        <Text style={styles.menuHeading}>HỆ THỐNG</Text>
        <Pressable
          style={styles.menuLink}
          onPress={() =>
            Alert.alert(
              "Đăng xuất",
              "Hãy kết nối chức năng đăng xuất với hệ thống.",
            )
          }
        >
          <Ionicons name="log-out-outline" size={19} color="#ed263d" />
          <Text style={styles.menuText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
      <Image
        source={require("../../../../assets/image/anh logo.png")}
        style={styles.promoImage}
        resizeMode="contain"
      />
    </View>
  );
}

function Badge({ customer }: { customer: Customer }) {
  // Ưu tiên trạng thái khóa; nếu không khóa thì khách chưa có đơn được phân loại riêng.
  const locked = customer.status === "Đã khóa";
  const noOrders = customer.orders.length === 0;
  return (
    <View
      style={[
        styles.badge,
        locked
          ? styles.badgeLocked
          : noOrders
            ? styles.badgeNoOrders
            : styles.badgeActive,
      ]}
    >
      <View
        style={[
          styles.dot,
          locked
            ? styles.dotLocked
            : noOrders
              ? styles.dotNoOrders
              : styles.dotActive,
        ]}
      />
      <Text
        style={[
          styles.badgeText,
          locked
            ? styles.textLocked
            : noOrders
              ? styles.textNoOrders
              : styles.textActive,
        ]}
      >
        {locked ? "Đã khóa" : noOrders ? "Chưa mua hàng" : "Hoạt động"}
      </Text>
    </View>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon,
  color,
  tint,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  tint: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <View style={styles.statCopy}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function CustomerRow({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) {
  return (
    <View style={styles.customerListRow}>
      <View style={[styles.customerIdentity, styles.colCustomer]}>
        <Avatar name={customer.name} />
        <View style={styles.nameBlock}>
          <Text style={styles.rowName} numberOfLines={1}>
            {customer.name}
          </Text>
          <Text style={styles.rowId}>{customer.id}</Text>
        </View>
      </View>
      <View style={styles.colContact}>
        <Text style={styles.contactEmail} numberOfLines={1}>
          {customer.email}
        </Text>
        <Text style={styles.contactPhone}>{customer.phone}</Text>
      </View>
      <Text style={styles.colDate}>{customer.joined}</Text>
      <View style={styles.colPurchase}>
        <Text style={styles.purchaseOrders}>{customer.orders.length} đơn</Text>
        <Text style={styles.spendText}>{money(successfulSpend(customer))}</Text>
      </View>
      <View style={styles.colStatus}>
        <Badge customer={customer} />
      </View>
      <View style={styles.colAction}>
        <Pressable style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={14} color="#d9273e" />
        </Pressable>
      </View>
    </View>
  );
}

function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <View style={large ? styles.avatarLarge : styles.avatar}>
      <Text style={large ? styles.avatarLargeText : styles.avatarText}>
        {name.slice(0, 1)}
      </Text>
    </View>
  );
}

function CustomerCard({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.customerCard} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.customerIdentity}>
          <Avatar name={customer.name} />
          <View style={styles.nameBlock}>
            <Text style={styles.rowName}>{customer.name}</Text>
            <Text style={styles.rowId}>
              {customer.id} · {customer.email}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#98a2b3" />
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.contactPhone}>{customer.phone}</Text>
        <Badge customer={customer} />
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cardValue}>{customer.orders.length} đơn hàng</Text>
        <Text style={styles.cardValue}>{money(successfulSpend(customer))}</Text>
        <Text style={styles.cardDate}>{customer.joined}</Text>
      </View>
    </Pressable>
  );
}

function PanelTitle({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  return (
    <View style={styles.panelTitleRow}>
      <Ionicons name={icon} size={18} color="#d9273e" />
      <Text style={styles.panelTitle}>{title}</Text>
    </View>
  );
}

function CustomerInfo({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color="#d9273e" />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function CustomerManagement() {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const mobile = width < 650;
  const sidebarWidth = width <= 768 ? 220 : 255;
  const [customers, setCustomers] = useState(initialCustomers);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState(statusOptions[0]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"status" | "edit" | null>(null);
  const [reason, setReason] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const selected =
    customers.find((customer) => customer.id === selectedId) ?? null;
  // Lọc theo từ khóa trên mã/tên/email/điện thoại kết hợp với trạng thái đã chọn.
  const filtered = useMemo(
    () =>
      customers.filter((customer) => {
        const query = keyword.trim().toLocaleLowerCase("vi");
        const matchesSearch =
          `${customer.id} ${customer.name} ${customer.email} ${customer.phone}`
            .toLocaleLowerCase("vi")
            .includes(query);
        const matchesFilter =
          filter === statusOptions[0] ||
          (filter === "Chưa mua hàng"
            ? customer.orders.length === 0
            : customer.status === filter);
        return matchesSearch && matchesFilter;
      }),
    [customers, filter, keyword],
  );
  // Mỗi trang hiển thị tối đa 5 khách hàng; luôn có ít nhất một trang.
  const pageCount = Math.max(1, Math.ceil(filtered.length / 5));
  const pageCustomers = filtered.slice((page - 1) * 5, page * 5);

  // Cập nhật bất biến danh sách, chỉ thay đổi khách hàng có ID tương ứng.
  function updateCustomer(
    id: string,
    update: (customer: Customer) => Customer,
  ) {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id ? update(customer) : customer,
      ),
    );
  }
  function openEdit() {
    if (!selected) return;
    setEditName(selected.name);
    setEditPhone(selected.phone);
    setDialog("edit");
  }
  // Lưu các trường liên hệ sau khi kiểm tra dữ liệu bắt buộc.
  function saveEdit() {
    if (!selected || !editName.trim() || !editPhone.trim())
      return Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập họ tên và số điện thoại.",
      );
    updateCustomer(selected.id, (customer) => ({
      ...customer,
      name: editName.trim(),
      phone: editPhone.trim(),
    }));
    setDialog(null);
  }
  // Đổi trạng thái khóa/mở khóa và ghi lý do thành một sự kiện đầu lịch sử.
  function saveStatus() {
    if (!selected || !reason.trim())
      return Alert.alert(
        "Cần có lý do",
        "Vui lòng nhập lý do thay đổi trạng thái.",
      );
    const next: Customer["status"] =
      selected.status === "Đã khóa" ? "Hoạt động" : "Đã khóa";
    const event =
      next === "Đã khóa" ? "Tài khoản bị khóa" : "Tài khoản được mở khóa";
    updateCustomer(selected.id, (customer) => ({
      ...customer,
      status: next,
      history: [
        `${event} ngày 13/10/2026: ${reason.trim()}`,
        ...customer.history,
      ],
    }));
    setReason("");
    setDialog(null);
  }

  // Bố cục thay đổi theo độ rộng: danh sách dạng thẻ trên mobile, dạng bảng trên màn hình lớn.
  return (
    <View style={styles.screen}>
      <Sidebar width={sidebarWidth} />
      <View style={[styles.page, { marginLeft: sidebarWidth }]}>
        <View style={styles.header}>
          <View style={styles.admin}>
            <View style={styles.adminIcon}>
              <Ionicons name="person" size={17} color="#d9273e" />
            </View>
            <Text style={styles.adminName}>Admin</Text>
          </View>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          keyboardShouldPersistTaps="handled"
        >
          {selected ? (
            <>
              <Pressable
                style={styles.backLink}
                onPress={() => setSelectedId(null)}
              >
                <Ionicons name="arrow-back" size={17} color="#d9273e" />
                <Text style={styles.backText}>Danh sách khách hàng</Text>
              </Pressable>
              <View
                style={[
                  styles.detailHeading,
                  mobile && styles.detailHeadingMobile,
                ]}
              >
                <View>
                  <Text style={styles.pageTitle}>Chi tiết khách hàng</Text>
                  <Text style={styles.pageSubtitle}>
                    {selected.id} · Tham gia {selected.joined}
                  </Text>
                </View>
                <View style={styles.headingActions}>
                  <Pressable style={styles.outlineButton} onPress={openEdit}>
                    <Ionicons name="create-outline" size={16} color="#344054" />
                    <Text style={styles.outlineText}>Sửa hồ sơ</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.statusAction,
                      selected.status === "Đã khóa" && styles.unlockAction,
                    ]}
                    onPress={() => {
                      setReason("");
                      setDialog("status");
                    }}
                  >
                    <Ionicons
                      name={
                        selected.status === "Đã khóa"
                          ? "lock-open-outline"
                          : "lock-closed-outline"
                      }
                      size={15}
                      color="#fff"
                    />
                    <Text style={styles.statusActionText}>
                      {selected.status === "Đã khóa"
                        ? "Mở khóa"
                        : "Khóa tài khoản"}
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View
                style={[
                  styles.identityPanel,
                  compact && styles.identityPanelCompact,
                ]}
              >
                <View style={styles.identityMain}>
                  <Avatar name={selected.name} large />
                  <View style={styles.identityCopy}>
                    <Text style={styles.customerName}>{selected.name}</Text>
                    <Text style={styles.identityMeta}>
                      {selected.id} · {selected.email}
                    </Text>
                    <Badge customer={selected} />
                  </View>
                </View>
                <View style={styles.metrics}>
                  <Metric
                    icon="receipt-outline"
                    label="Tổng đơn hàng"
                    value={String(selected.orders.length)}
                  />
                  <Metric
                    icon="wallet-outline"
                    label="Chi tiêu thành công"
                    value={money(successfulSpend(selected))}
                  />
                  <Metric
                    icon="checkmark-circle-outline"
                    label="Đơn thành công"
                    value={String(
                      selected.orders.filter(
                        (order) => order.status === "Hoàn thành",
                      ).length,
                    )}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.detailColumns,
                  compact && styles.detailColumnsCompact,
                ]}
              >
                <View style={[styles.detailLeft, compact && styles.detailFull]}>
                  <View style={styles.panel}>
                    <PanelTitle
                      icon="person-circle-outline"
                      title="Thông tin cá nhân"
                    />
                    <CustomerInfo
                      icon="person-outline"
                      label="Họ và tên"
                      value={selected.name}
                    />
                    <CustomerInfo
                      icon="mail-outline"
                      label="Email"
                      value={selected.email}
                    />
                    <CustomerInfo
                      icon="call-outline"
                      label="Số điện thoại"
                      value={selected.phone}
                    />
                    <CustomerInfo
                      icon="calendar-outline"
                      label="Ngày đăng ký"
                      value={selected.joined}
                    />
                  </View>
                  <View style={styles.panel}>
                    <PanelTitle
                      icon="location-outline"
                      title="Địa chỉ giao hàng"
                    />
                    <Text style={styles.address}>{selected.address}</Text>
                  </View>
                  <View style={styles.panel}>
                    <PanelTitle icon="time-outline" title="Lịch sử tài khoản" />
                    {selected.history.map((event, index) => (
                      <View
                        key={`${event}-${index}`}
                        style={styles.historyItem}
                      >
                        <View style={styles.historyDot} />
                        <Text style={styles.historyText}>{event}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View
                  style={[styles.detailRight, compact && styles.detailFull]}
                >
                  <View style={styles.panel}>
                    <View style={styles.panelHeading}>
                      <PanelTitle
                        icon="receipt-outline"
                        title="Lịch sử mua hàng"
                      />
                      <Text style={styles.panelCount}>
                        {selected.orders.length} đơn
                      </Text>
                    </View>
                    {selected.orders.length ? (
                      selected.orders.map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))
                    ) : (
                      <View style={styles.emptyOrders}>
                        <Ionicons
                          name="bag-handle-outline"
                          size={23}
                          color="#98a2b3"
                        />
                        <Text style={styles.emptyText}>
                          Khách hàng chưa có đơn hàng.
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.supportPanel}>
                    <View style={styles.supportIcon}>
                      <Ionicons
                        name="headset-outline"
                        size={19}
                        color="#b42336"
                      />
                    </View>
                    <View style={styles.supportCopy}>
                      <Text style={styles.supportTitle}>Hỗ trợ khách hàng</Text>
                      <Text style={styles.supportDescription}>
                        Liên hệ qua email hoặc số điện thoại đã đăng ký.
                      </Text>
                    </View>
                    <Pressable
                      style={styles.supportButton}
                      onPress={() =>
                        Alert.alert(
                          "Chưa khả dụng",
                          "Chức năng hỗ trợ cần được kết nối với Backend.",
                        )
                      }
                    >
                      <Text style={styles.supportButtonText}>Ghi nhận</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.pageHeading}>
                <View style={styles.headingLeft}>
                  <View style={styles.headingIcon}>
                    <Ionicons name="people-outline" size={23} color="#fff" />
                  </View>
                  <View style={styles.headingText}>
                    <Text style={styles.headingTitle}>Quản lý khách hàng</Text>
                    <Text style={styles.headingDescription}>
                      Theo dõi tài khoản, lịch sử mua hàng và tình trạng khách hàng.
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[styles.statsGrid, mobile && styles.statsGridMobile]}
              >
                <StatCard
                  title="Tổng khách hàng"
                  value={String(customers.length)}
                  detail="Tài khoản đã đăng ký"
                  icon="people-outline"
                  color="#d9273e"
                  tint="#fff0f1"
                />
                <StatCard
                  title="Khách hàng mới"
                  value={String(
                    customers.filter((c) => c.joined.endsWith("09/2025"))
                      .length,
                  )}
                  detail="Trong tháng 09/2025"
                  icon="person-add-outline"
                  color="#2376c9"
                  tint="#edf5ff"
                />
                <StatCard
                  title="Đã mua hàng"
                  value={String(
                    customers.filter((c) =>
                      c.orders.some((o) => o.status === "Hoàn thành"),
                    ).length,
                  )}
                  detail="Có đơn hoàn thành"
                  icon="bag-check-outline"
                  color="#16845b"
                  tint="#eaf7f0"
                />
                <StatCard
                  title="Tài khoản bị khóa"
                  value={String(
                    customers.filter((c) => c.status === "Đã khóa").length,
                  )}
                  detail="Cần theo dõi"
                  icon="lock-closed-outline"
                  color="#b7791f"
                  tint="#fff6e6"
                />
              </View>
              <View style={[styles.filters, mobile && styles.filtersMobile]}>
                <View style={styles.searchBox}>
                  <Ionicons name="search-outline" size={18} color="#758198" />
                  <TextInput
                    value={keyword}
                    onChangeText={(value) => {
                      setKeyword(value);
                      setPage(1);
                    }}
                    placeholder="Tìm tên, mã, email, số điện thoại..."
                    placeholderTextColor="#98a2b3"
                    style={styles.searchInput}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                  />
                </View>
                <Pressable
                  style={styles.filterSelect}
                  onPress={() => setFilterOpen(true)}
                >
                  <Ionicons name="filter-outline" size={16} color="#667085" />
                  <Text style={styles.filterText} numberOfLines={1}>
                    {filter}
                  </Text>
                  <Ionicons name="chevron-down" size={15} color="#667085" />
                </Pressable>
              </View>
              <View style={styles.listCard}>
                <View style={styles.listHeading}>
                  <Text style={styles.listTitle}>Danh sách khách hàng</Text>
                  <Text style={styles.resultCount}>
                    {filtered.length} khách hàng
                  </Text>
                </View>
                {mobile ? (
                  <View style={styles.customerCards}>
                    {pageCustomers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onPress={() => setSelectedId(customer.id)}
                      />
                    ))}
                    {!pageCustomers.length && <EmptyList />}
                  </View>
                ) : (
                  <View>
                    {pageCustomers.map((customer) => (
                      <CustomerRow
                        key={customer.id}
                        customer={customer}
                        onPress={() => setSelectedId(customer.id)}
                      />
                    ))}
                    {!pageCustomers.length && <EmptyList />}
                  </View>
                )}
                <View style={styles.pagination}>
                  <Text style={styles.paginationText}>
                    Hiển thị {filtered.length ? (page - 1) * 5 + 1 : 0}–
                    {Math.min(page * 5, filtered.length)} trong {filtered.length}{" "}
                    khách hàng
                  </Text>
                  <View style={styles.pageControls}>
                    <Pressable
                      accessibilityLabel="Trang trước"
                      disabled={page === 1}
                      style={styles.pageButton}
                      onPress={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      <Ionicons
                        name="chevron-back"
                        size={16}
                        color={page === 1 ? "#c7ccd4" : "#475467"}
                      />
                    </Pressable>
                    <Text style={styles.pageNumber}>
                      {page} / {pageCount}
                    </Text>
                    <Pressable
                      accessibilityLabel="Trang sau"
                      disabled={page >= pageCount}
                      style={styles.pageButton}
                      onPress={() =>
                        setPage((current) => Math.min(pageCount, current + 1))
                      }
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={page >= pageCount ? "#c7ccd4" : "#475467"}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
              <Text style={styles.demoNote}>
                Dữ liệu minh họa, chưa kết nối API hoặc SQL Server. Thay đổi
                trên trang chỉ được lưu trong phiên hiện tại.
              </Text>
            </>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.dialog} onPress={() => {}}>
            <Text style={styles.dialogTitle}>Lọc trạng thái</Text>
            {statusOptions.map((option) => (
              <Pressable
                key={option}
                style={styles.optionRow}
                onPress={() => {
                  setFilter(option);
                  setPage(1);
                  setFilterOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    filter === option && styles.optionSelected,
                  ]}
                >
                  {option}
                </Text>
                {filter === option && (
                  <Ionicons name="checkmark" size={18} color="#d9273e" />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={dialog !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDialog(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setDialog(null)}>
          <Pressable style={styles.dialog} onPress={() => {}}>
            {dialog === "status" ? (
              <>
                <Text style={styles.dialogTitle}>
                  {selected?.status === "Đã khóa"
                    ? "Mở khóa tài khoản"
                    : "Khóa tài khoản"}
                </Text>
                <Text style={styles.dialogDescription}>
                  {selected?.name} · {selected?.id}. Lịch sử đơn hàng sẽ được
                  giữ nguyên.
                </Text>
                <Text style={styles.inputLabel}>
                  Lý do thay đổi trạng thái *
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Nhập lý do để lưu vào lịch sử tài khoản"
                  placeholderTextColor="#98a2b3"
                  style={[styles.dialogInput, styles.reasonInput]}
                  multiline
                />
                <View style={styles.dialogActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setDialog(null)}
                  >
                    <Text style={styles.cancelText}>Hủy</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.confirmButton,
                      selected?.status === "Đã khóa" && styles.unlockAction,
                    ]}
                    onPress={saveStatus}
                  >
                    <Text style={styles.confirmText}>Xác nhận</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.dialogTitle}>Cập nhật hồ sơ</Text>
                <Text style={styles.dialogDescription}>
                  Chỉ chỉnh sửa thông tin liên hệ. Mật khẩu không được hiển thị
                  hoặc thay đổi tại đây.
                </Text>
                <Text style={styles.inputLabel}>Họ và tên</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.dialogInput}
                />
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  style={styles.dialogInput}
                />
                <View style={styles.dialogActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setDialog(null)}
                  >
                    <Text style={styles.cancelText}>Hủy</Text>
                  </Pressable>
                  <Pressable style={styles.confirmButton} onPress={saveEdit}>
                    <Text style={styles.confirmText}>Lưu thay đổi</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricTop}>
        <Ionicons name={icon} size={16} color="#d9273e" />
        <Text style={styles.metricValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function OrderRow({ order }: { order: Order }) {
  const palette =
    order.status === "Hoàn thành"
      ? ["#e7f6ed", "#198754"]
      : order.status === "Đang giao"
        ? ["#e9f1ff", "#2865bd"]
        : order.status === "Đã hủy"
          ? ["#fff0f0", "#cf3340"]
          : ["#fff5df", "#a66b00"];
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.orderDate}>
          {order.date} · {order.payment}
        </Text>
      </View>
      <View style={styles.orderEnd}>
        <Text style={styles.orderTotal}>{money(order.total)}</Text>
        <View style={[styles.orderBadge, { backgroundColor: palette[0] }]}>
          <Text style={[styles.orderBadgeText, { color: palette[1] }]}>
            {order.status}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#98a2b3" />
    </View>
  );
}

function EmptyList() {
  return (
    <View style={styles.emptyList}>
      <Ionicons name="people-outline" size={28} color="#98a2b3" />
      <Text style={styles.emptyText}>Không tìm thấy khách hàng phù hợp.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, flexDirection: "row", backgroundColor: "#f8f9fc" },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 20,
    paddingHorizontal: 13,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#f0f1f5",
    zIndex: 10,
    elevation: 4,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 25,
  },
  brandImage: { width: 48, height: 48 },
  brandText: { color: "#c8102e", fontSize: 21, fontWeight: "800" },
  brandStrong: { color: "#8f101f" },
  menuHeading: {
    marginTop: 19,
    marginBottom: 8,
    marginLeft: 6,
    color: "#758198",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  menuLink: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    marginBottom: 5,
    borderRadius: 9,
  },
  menuActive: {
    backgroundColor: "#e52332",
    shadowColor: "#ed263d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  },
  menuText: { flex: 1, color: "#354157", fontSize: 12, fontWeight: "500" },
  menuTextActive: { color: "#fff", fontWeight: "600" },
  promoImage: { alignSelf: "center", width: 170, height: 150, marginTop: 12 },
  page: { flex: 1, height: "100%" },
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf0f5",
  },
  admin: { flexDirection: "row", alignItems: "center", gap: 9 },
  adminIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffe5e9",
  },
  adminName: { color: "#263248", fontSize: 14, fontWeight: "600" },
  content: { flex: 1 },
  contentInner: {
    width: "100%",
    maxWidth: 1250,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 40,
  },
  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  headingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 220,
  },
  headingIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ed3448",
    borderRadius: 10,
  },
  headingText: { flex: 1 },
  headingTitle: {
    marginBottom: 6,
    color: "#172033",
    fontSize: 23,
    fontWeight: "700",
  },
  headingDescription: { color: "#8791a5", fontSize: 12, lineHeight: 18 },
  pageTitle: {
    color: "#202b3c",
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 5,
  },
  pageSubtitle: { color: "#788396", fontSize: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  statsGridMobile: { gap: 9 },
  statCard: {
    flex: 1,
    flexBasis: 200,
    minWidth: 170,
    minHeight: 96,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#edf0f5",
    borderRadius: 10,
  },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statCopy: { flex: 1, minWidth: 0 },
  statTitle: { color: "#667085", fontSize: 10 },
  statValue: {
    marginTop: 5,
    color: "#202b3c",
    fontSize: 22,
    fontWeight: "700",
  },
  statDetail: { marginTop: 4, color: "#98a2b3", fontSize: 9 },
  listCard: {
    padding: 18,
    borderRadius: 11,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#edf0f5",
  },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  listTitle: { color: "#172033", fontSize: 15, fontWeight: "700" },
  resultCount: { color: "#667085", fontSize: 11, fontWeight: "600" },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  filtersMobile: { flexDirection: "column", alignItems: "stretch" },
  searchBox: {
    flex: 1,
    minWidth: 130,
    minHeight: 43,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e3e7ee",
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    color: "#202b3c",
    fontSize: 11,
    outlineStyle: "none",
  } as any,
  filterSelect: {
    minWidth: 175,
    minHeight: 43,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e3e7ee",
    borderRadius: 8,
  },
  filterText: { flex: 1, color: "#475467", fontSize: 10 },
  customerListRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f2f6",
  },
  colCustomer: { flex: 2, minWidth: 140 },
  colContact: { flex: 1.5, minWidth: 125 },
  colDate: { width: 78, color: "#647087", fontSize: 10 },
  colPurchase: { width: 96, gap: 4 },
  colStatus: { width: 110 },
  colAction: { width: 62 },
  customerIdentity: { flexDirection: "row", alignItems: "center", gap: 9 },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0f1",
  },
  avatarText: { color: "#c62a3d", fontSize: 13, fontWeight: "700" },
  nameBlock: { flex: 1, minWidth: 0 },
  rowName: { color: "#253047", fontSize: 12, fontWeight: "600" },
  rowId: { marginTop: 4, color: "#929bab", fontSize: 9 },
  contactEmail: { color: "#475467", fontSize: 9 },
  contactPhone: { marginTop: 4, color: "#929bab", fontSize: 9 },
  purchaseOrders: { color: "#647087", fontSize: 10 },
  spendText: { color: "#253047", fontSize: 10, fontWeight: "600" },
  viewButton: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewText: { color: "#c9273d", fontSize: 10, fontWeight: "600" },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeActive: { backgroundColor: "#eaf7f0" },
  badgeLocked: { backgroundColor: "#fff0f0" },
  badgeNoOrders: { backgroundColor: "#f1f3f5" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: "#16845b" },
  dotLocked: { backgroundColor: "#cf3340" },
  dotNoOrders: { backgroundColor: "#7a8494" },
  badgeText: { fontSize: 8, fontWeight: "600" },
  textActive: { color: "#16845b" },
  textLocked: { color: "#c3323f" },
  textNoOrders: { color: "#697586" },
  pagination: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  paginationText: { color: "#8791a1", fontSize: 9 },
  pageControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageButton: {
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e3e6eb",
    borderRadius: 6,
  },
  pageNumber: { color: "#475467", fontSize: 10 },
  demoNote: { paddingTop: 7, color: "#98a2b3", fontSize: 9 },
  customerCards: { gap: 9 },
  customerCard: {
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eceef1",
    borderRadius: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMiddle: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBottom: {
    marginTop: 11,
    paddingTop: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f1f3",
  },
  cardValue: { color: "#475467", fontSize: 9, fontWeight: "600" },
  cardDate: { marginLeft: "auto", color: "#929bab", fontSize: 8 },
  emptyList: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: { color: "#8993a3", fontSize: 10 },
  backLink: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 15,
  },
  backText: { color: "#c9273d", fontSize: 10, fontWeight: "600" },
  detailHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  detailHeadingMobile: { alignItems: "flex-start", flexDirection: "column" },
  headingActions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  outlineButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9dde4",
    borderRadius: 6,
  },
  outlineText: { color: "#344054", fontSize: 9, fontWeight: "600" },
  statusAction: {
    minHeight: 36,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#c93642",
    borderRadius: 6,
  },
  unlockAction: { backgroundColor: "#18825a" },
  statusActionText: { color: "#fff", fontSize: 9, fontWeight: "600" },
  identityPanel: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eceef1",
    borderRadius: 8,
    marginBottom: 14,
  },
  identityPanelCompact: { flexDirection: "column", alignItems: "stretch" },
  identityMain: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0f1",
  },
  avatarLargeText: { color: "#c9273d", fontSize: 22, fontWeight: "700" },
  identityCopy: { gap: 5 },
  customerName: { color: "#202b3c", fontSize: 16, fontWeight: "700" },
  identityMeta: { color: "#7d8798", fontSize: 9 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: {
    minWidth: 115,
    paddingLeft: 11,
    borderLeftWidth: 1,
    borderLeftColor: "#eceef1",
  },
  metricTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  metricValue: { color: "#253146", fontSize: 11, fontWeight: "700" },
  metricLabel: { marginTop: 5, color: "#8791a1", fontSize: 8 },
  detailColumns: { flexDirection: "row", alignItems: "flex-start", gap: 13 },
  detailColumnsCompact: { flexDirection: "column" },
  detailLeft: { flex: 0.92, gap: 11 },
  detailRight: { flex: 1.5, gap: 11 },
  detailFull: { width: "100%", flex: 0 },
  panel: {
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eceef1",
    borderRadius: 8,
  },
  panelTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  panelTitle: { color: "#293548", fontSize: 11, fontWeight: "700" },
  infoItem: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  infoIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff2f3",
    borderRadius: 7,
  },
  infoCopy: { flex: 1 },
  infoLabel: { color: "#8993a3", fontSize: 8 },
  infoValue: { marginTop: 3, color: "#344054", fontSize: 9, fontWeight: "500" },
  address: { marginTop: 12, color: "#475467", fontSize: 9, lineHeight: 16 },
  historyItem: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  historyDot: {
    width: 7,
    height: 7,
    marginTop: 3,
    borderRadius: 4,
    backgroundColor: "#d9273e",
  },
  historyText: { flex: 1, color: "#667085", fontSize: 8, lineHeight: 14 },
  panelHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  panelCount: { color: "#8993a3", fontSize: 8 },
  orderRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f3",
  },
  orderInfo: { flex: 1 },
  orderId: { color: "#c9273d", fontSize: 9, fontWeight: "700" },
  orderDate: { marginTop: 5, color: "#8993a3", fontSize: 8 },
  orderEnd: { alignItems: "flex-end", gap: 5 },
  orderTotal: { color: "#344054", fontSize: 9, fontWeight: "700" },
  orderBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 9 },
  orderBadgeText: { fontSize: 7, fontWeight: "600" },
  emptyOrders: {
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  supportPanel: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#fff8f7",
    borderWidth: 1,
    borderColor: "#f5e1df",
    borderRadius: 8,
  },
  supportIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffe9e7",
    borderRadius: 8,
  },
  supportCopy: { flex: 1 },
  supportTitle: { color: "#344054", fontSize: 9, fontWeight: "700" },
  supportDescription: {
    marginTop: 3,
    color: "#7d8798",
    fontSize: 8,
    lineHeight: 12,
  },
  supportButton: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ead4d2",
    borderRadius: 5,
  },
  supportButtonText: { color: "#9b2b37", fontSize: 8, fontWeight: "600" },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    backgroundColor: "rgba(16,24,40,0.38)",
  },
  dialog: {
    width: "100%",
    maxWidth: 430,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  dialogTitle: { color: "#202b3c", fontSize: 16, fontWeight: "700" },
  dialogDescription: {
    marginTop: 7,
    marginBottom: 15,
    color: "#758198",
    fontSize: 10,
    lineHeight: 16,
  },
  inputLabel: {
    marginBottom: 6,
    color: "#475467",
    fontSize: 9,
    fontWeight: "600",
  },
  dialogInput: {
    minHeight: 39,
    marginBottom: 12,
    paddingHorizontal: 10,
    color: "#344054",
    fontSize: 10,
    borderWidth: 1,
    borderColor: "#d9dde4",
    borderRadius: 6,
  },
  reasonInput: { minHeight: 78, paddingTop: 9, textAlignVertical: "top" },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    minHeight: 36,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d9dde4",
    borderRadius: 6,
  },
  cancelText: { color: "#475467", fontSize: 9, fontWeight: "600" },
  confirmButton: {
    minHeight: 36,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c93642",
    borderRadius: 6,
  },
  confirmText: { color: "#fff", fontSize: 9, fontWeight: "600" },
  optionRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f3",
  },
  optionText: { color: "#475467", fontSize: 10 },
  optionSelected: { color: "#c9273d", fontWeight: "700" },
});
