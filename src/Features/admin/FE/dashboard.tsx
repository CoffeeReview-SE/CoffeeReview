
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Circle,
  Path,
  Polyline,
} from "react-native-svg";
import { Text as SvgText } from "react-native-svg";
import { router } from "expo-router";

// ===== DỮ LIỆU THỐNG KÊ =====
// Đây là dữ liệu mẫu để hiển thị giao diện dashboard.
// Khi kết nối backend, có thể thay bằng dữ liệu lấy từ API.
const statistics = [
  {
    title: "Tổng đơn hàng",
    value: "128",
    percentage: "12%",
    description: "so với tháng trước",
    icon: "cart-outline" as const,
    iconColor: "#ed263d",
    iconBackground: "#ffe4e7",
    positive: true,
    chart: "2,45 20,44 38,32 52,37 68,20 84,18 98,3",
  },
  {
    title: "Đang xử lý",
    value: "18",
    percentage: "14%",
    description: "tổng đơn",
    icon: "wallet-outline" as const,
    iconColor: "#ed263d",
    iconBackground: "#fff0f1",
    positive: false,
    chart: "2,45 20,42 40,38 56,35 72,17 86,23 98,4",
  },
  {
    title: "Đang giao",
    value: "42",
    percentage: "33%",
    description: "tổng đơn",
    icon: "car-outline" as const,
    iconColor: "#ed263d",
    iconBackground: "#fff0f1",
    positive: false,
    chart: "2,45 18,38 30,42 46,28 60,36 74,17 88,13 98,3",
  },
  {
    title: "Đã hoàn thành",
    value: "68",
    percentage: "53%",
    description: "tổng đơn",
    icon: "checkmark-circle-outline" as const,
    iconColor: "#ed263d",
    iconBackground: "#fff0f1",
    positive: false,
    chart: "2,45 20,44 40,34 56,36 72,16 88,20 98,2",
  },
];

// ===== DỮ LIỆU BIỂU ĐỒ DOANH SỐ =====
const salesLabels = [
  "01/09",
  "03/09",
  "05/09",
  "09/09",
  "13/09",
  "17/09",
  "21/09",
  "25/09",
  "29/09",
];

const salesData = [
  4000000,
  6000000,
  5500000,
  9000000,
  12000000,
  10000000,
  17000000,
  9000000,
  12000000,
];

// ===== DỮ LIỆU BIỂU ĐỒ DOANH SỐ THEO DANH MỤC =====
const categoryData = [
  { label: "Điện thoại", value: 35, color: "#ff2948" },
  { label: "Laptop", value: 25, color: "#3b82f6" },
  { label: "Phụ kiện", value: 15, color: "#10b981" },
  { label: "Thiết bị game", value: 10, color: "#fbbf24" },
  { label: "Đồng hồ", value: 8, color: "#8b5cf6" },
  { label: "Khác", value: 7, color: "#94a3b8" },
];

// ===== COMPONENT SIDEBAR =====
// Thay thế thẻ <aside> và <nav> trong HTML.
function Sidebar({
  width,
  activePage,
}: {
  width: number;
  activePage: string;
}) {
  // Các mục điều hướng của trang quản trị
  const menuItems = [
    {
      label: "Tổng quan",
      icon: "home-outline" as const,
      route: "/main_Admin",
      page: "main_Admin",
    },
    {
      label: "Quản lý đơn hàng",
      icon: "cart-outline" as const,
      route: "/order_management",
      page: "order_management",
    },
    {
      label: "Quản lý sản phẩm",
      icon: "cube-outline" as const,
      route: "/product_management",
      page: "product_management",
    },
    {
      label: "Quản lý danh mục",
      icon: "grid-outline" as const,
      route: "/category_management",
      page: "category_management",
    },
    {
      label: "Quản lý khách hàng",
      icon: "person-outline" as const,
      route: "/customer_management",
      page: "customer_management",
    },
  ];

  return (
    <View style={[styles.sidebar, { width }]}>
      {/* Logo cửa hàng */}
      <Pressable
        style={styles.brand}
        onPress={() => router.push("/main_Admin")}
      >
        <Image
          source={require("@/assets/image/logo.jpg")}
          style={styles.brandImage}
          resizeMode="contain"
        />

        <Text style={styles.brandText}>
          BVP <Text style={styles.brandStrong}>Shop</Text>
        </Text>
      </Pressable>

      {/* Menu điều hướng */}
      <ScrollView
        style={styles.sidebarMenu}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={item.page}>
            {/* Nhóm quản lý */}
            {index === 1 && (
              <Text style={styles.menuHeading}>QUẢN LÝ</Text>
            )}

            {/* Các trang trong menu */}
            <Pressable
              style={[
                styles.menuLink,
                activePage === item.page && styles.menuLinkActive,
              ]}
              onPress={() => {
                if (item.page !== activePage) {
                  router.push(item.route as never);
                }
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={
                  activePage === item.page ? "#ffffff" : "#ed263d"
                }
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.menuLinkText,
                  activePage === item.page &&
                    styles.menuLinkTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}

        {/* Nhóm hệ thống */}
        <Text style={styles.systemHeading}>HỆ THỐNG</Text>

        {/* Đăng xuất */}
        <Pressable
          style={styles.menuLink}
          onPress={() =>
            Alert.alert(
              "Đăng xuất",
              "Bạn có muốn đăng xuất khỏi hệ thống không?",
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Đăng xuất",
                  style: "destructive",
                  onPress: () => {
                    // TODO: Kết nối chức năng đăng xuất tại đây.
                    Alert.alert(
                      "Thông báo",
                      "Hãy kết nối chức năng đăng xuất với hệ thống.",
                    );
                  },
                },
              ],
            )
          }
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#ed263d"
          />
          <Text style={styles.menuLinkText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      {/* Thẻ giới thiệu phía dưới sidebar */}
      <View style={styles.imageSide}>
        <Image
          source={require("@/assets/image/anh logo.png")}
          style={styles.promoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// ===== COMPONENT BIỂU ĐỒ ĐƯỜNG NHỎ =====
// Thay thế SVG mini-chart trong HTML.
function MiniChart({ points }: { points: string }) {
  return (
    <Svg width={48} height={34} viewBox="0 0 100 50">
      <Polyline
        points={points}
        fill="none"
        stroke="#ffb5c0"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ===== COMPONENT THẺ THỐNG KÊ =====
function StatCard({
  item,
}: {
  item: (typeof statistics)[number];
}) {
  return (
    <View style={styles.statCard}>
      {/* Icon của từng thẻ */}
      <View
        style={[
          styles.statIcon,
          { backgroundColor: item.iconBackground },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={19}
          color={item.iconColor}
        />
      </View>

      {/* Thông tin thống kê */}
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{item.title}</Text>
        <Text style={styles.statValue}>{item.value}</Text>

        {/* Phần trăm thay đổi */}
        <View style={styles.statChange}>
          {item.positive && (
            <Ionicons
              name="arrow-up"
              size={12}
              color="#16a34a"
            />
          )}

          <Text
            style={[
              styles.statPercentage,
              {
                color: item.positive ? "#16a34a" : "#3985ef",
              },
            ]}
          >
            {item.percentage}
          </Text>

          <Text style={styles.statDescription}>
            {item.description}
          </Text>
        </View>
      </View>

      {/* Biểu đồ đường nhỏ bên phải */}
      <View style={styles.miniChart}>
        <MiniChart points={item.chart} />
      </View>
    </View>
  );
}

// ===== COMPONENT BIỂU ĐỒ DOANH SỐ THEO NGÀY =====
function SalesChart({ compact }: { compact: boolean }) {
  // Kích thước biểu đồ thay đổi theo chiều rộng màn hình.
  const chartWidth = compact ? 310 : 550;
  const chartHeight = 240;
  const paddingLeft = 48;
  const paddingRight = 12;
  const paddingTop = 18;
  const paddingBottom = 36;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const maxValue = 20000000;
  const yTicks = [0, 5000000, 10000000, 15000000, 20000000];

  // Chuyển giá trị doanh số thành tọa độ x, y để vẽ biểu đồ.
  const points = salesData.map((value, index) => {
    const x =
      paddingLeft +
      (index / (salesData.length - 1)) * plotWidth;

    const y =
      paddingTop + plotHeight - (value / maxValue) * plotHeight;

    return { x, y, value, label: salesLabels[index] };
  });

  // Tạo đường nối giữa các điểm dữ liệu.
  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  // Tạo vùng tô phía dưới đường doanh số.
  const areaPath =
    `${linePath} L ${points[points.length - 1].x} ` +
    `${paddingTop + plotHeight} L ${paddingLeft} ` +
    `${paddingTop + plotHeight} Z`;

  return (
    <View style={styles.salesChartContainer}>
      <Svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {/* Các đường lưới và nhãn trục tung */}
        {yTicks.map((tick) => {
          const y =
            paddingTop + plotHeight - (tick / maxValue) * plotHeight;

          return (
            <React.Fragment key={tick}>
              <Path
                d={`M ${paddingLeft} ${y} H ${chartWidth - paddingRight}`}
                stroke="#edf0f5"
                strokeWidth={1}
              />
              <TextSvgLabel
                x={paddingLeft - 7}
                y={y + 4}
                value={tick === 0 ? "0" : `${tick / 1000000}tr`}
              />
            </React.Fragment>
          );
        })}

        {/* Vùng màu bên dưới đường doanh số */}
        <Path d={areaPath} fill="#ff2948" opacity={0.12} />

        {/* Đường doanh số */}
        <Path
          d={linePath}
          fill="none"
          stroke="#ff2948"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Các điểm dữ liệu */}
        {points.map((point, index) => (
          <Circle
            key={salesLabels[index]}
            cx={point.x}
            cy={point.y}
            r={3.5}
            fill="#ff2948"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        ))}

        {/* Nhãn ngày ở trục hoành */}
        {points.map((point, index) => (
          <TextSvgLabel
            key={point.label}
            x={point.x}
            y={chartHeight - 12}
            value={compact ? point.label.slice(0, 2) : point.label}
            anchor="middle"
          />
        ))}
      </Svg>
    </View>
  );
}

// ===== COMPONENT HIỂN THỊ NHÃN TRONG SVG =====
function TextSvgLabel({
  x,
  y,
  value,
  anchor = "end",
}: {
  x: number;
  y: number;
  value: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <SvgText
      x={x}
      y={y}
      fontSize={10}
      fill="#8791a5"
      textAnchor={anchor}
    >
      {value}
    </SvgText>
  );
}

// ===== HÀM TẠO CUNG TRÒN CHO BIỂU ĐỒ DOUGHNUT =====
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  // Chuyển góc sang tọa độ trên đường tròn.
  const start = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };

  const end = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };

  const largeArcFlag =
    endAngle - startAngle > Math.PI ? 1 : 0;

  return (
    `M ${start.x} ${start.y} ` +
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  );
}

// ===== COMPONENT BIỂU ĐỒ DOUGHNUT THEO DANH MỤC =====
function CategoryChart() {
  const size = 190;
  const center = size / 2;
  const radius = 72;
  const strokeWidth = 25;

  return (
    <View style={styles.doughnutContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Vòng tròn nền */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Các phần trăm doanh số của từng danh mục */}
        {categoryData.map((item, index) => {
          const startAngle =
            -Math.PI / 2 +
            categoryData
              .slice(0, index)
              .reduce((angle, previous) => angle + (previous.value / 100) * Math.PI * 2, 0);
          const endAngle =
            startAngle + (item.value / 100) * Math.PI * 2;

          return (
            <Path
              key={item.label}
              d={describeArc(
                center,
                center,
                radius,
                startAngle,
                endAngle,
              )}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
            />
          );
        })}

        {/* Tổng tỷ lệ ở giữa biểu đồ */}
        <SvgText
          x={center}
          y={center - 4}
          fontSize={24}
          fontWeight="700"
          fill="#172033"
          textAnchor="middle"
        >
          100%
        </SvgText>

        <SvgText
          x={center}
          y={center + 16}
          fontSize={11}
          fill="#8791a5"
          textAnchor="middle"
        >
          Doanh số
        </SvgText>
      </Svg>
    </View>
  );
}

// ===== COMPONENT CHÚ THÍCH DANH MỤC =====
function CategoryLegend() {
  return (
    <View style={styles.legend}>
      {categoryData.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: item.color },
            ]}
          />

          <Text style={styles.legendText}>
            {item.label} {item.value}%
          </Text>
        </View>
      ))}
    </View>
  );
}

// ===== COMPONENT CHÍNH: TRANG TỔNG QUAN ADMIN =====
export default function MainAdmin() {
  const { width: screenWidth } = useWindowDimensions();

  // Responsive: thu nhỏ sidebar trên màn hình hẹp.
  const sidebarWidth = screenWidth <= 768 ? 220 : 255;
  const compact = screenWidth <= 600;
  const tablet = screenWidth <= 1100;

  // State bộ lọc ngày.
  const [dateVisible, setDateVisible] = useState(false);
  const [dateRange, setDateRange] = useState(
    "01/09/2025 - 30/09/2025",
  );

  // State chọn kiểu hiển thị biểu đồ.
  const [chartPeriod, setChartPeriod] = useState("Theo ngày");

  // ===== XỬ LÝ TẠO ĐƠN HÀNG =====
  function createOrder() {
    // TODO: Điều hướng đến trang tạo đơn hàng khi đã xây dựng route.
    Alert.alert(
      "Tạo đơn hàng",
      "Bạn có thể kết nối nút này với màn hình tạo đơn hàng.",
    );
  }

  return (
    <View style={styles.screen}>
      {/* Sidebar BVP Shop */}
      <Sidebar
        width={sidebarWidth}
        activePage="main_Admin"
      />

      {/* Nội dung bên phải sidebar */}
      <View
        style={[
          styles.page,
          {
            marginLeft: sidebarWidth,
            width: Math.max(0, screenWidth - sidebarWidth),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Tài khoản Admin */}
          <Pressable
            style={styles.accountAdmin}
            onPress={() =>
              Alert.alert(
                "Tài khoản",
                "Bạn đang đăng nhập với quyền Admin.",
              )
            }
          >
            <View style={styles.accountIcon}>
              <Ionicons
                name="person"
                size={18}
                color="#ed263d"
              />
            </View>

            {!compact && (
              <Text style={styles.accountName}>Admin</Text>
            )}
          </Pressable>
        </View>

        {/* Main nằm dưới header */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tiêu đề trang */}
          <View style={styles.pageHeading}>
            <View style={styles.headingLeft}>
              <View style={styles.headingIcon}>
                <Ionicons
                  name="clipboard-outline"
                  size={23}
                  color="#ffffff"
                />
              </View>

              {/* Tiêu đề */}
              <View style={styles.headingText}>
                <Text style={styles.headingTitle}>Tổng quan</Text>
                <Text style={styles.headingDescription}>
                  Theo dõi và quản lý tất cả đơn hàng của khách hàng.
                </Text>
              </View>
            </View>

            {/* Các nút phía bên phải */}
            <View
              style={[
                styles.headingActions,
                compact && styles.headingActionsCompact,
              ]}
            >
              <Pressable
                style={styles.dateFilter}
                onPress={() => setDateVisible(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#ed3448"
                />

                <Text style={styles.dateFilterText}>
                  {dateRange}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={12}
                  color="#8490a5"
                />
              </Pressable>

              <Pressable
                style={styles.addOrder}
                onPress={createOrder}
              >
                <Ionicons
                  name="add"
                  size={19}
                  color="#ffffff"
                />
                <Text style={styles.addOrderText}>
                  Tạo đơn hàng
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Các thẻ thống kê */}
          <View
            style={[
              styles.statistics,
              compact && styles.statisticsCompact,
            ]}
          >
            {statistics.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.statCardWrapper,
                  compact
                    ? styles.statCardWrapperMobile
                    : tablet
                      ? styles.statCardWrapperTablet
                      : styles.statCardWrapperDesktop,
                ]}
              >
                <StatCard item={item} />
              </View>
            ))}
          </View>

          {/* Các biểu đồ của dashboard */}
          <View
            style={[
              styles.dashboardChart,
              tablet && styles.dashboardChartStacked,
            ]}
          >
            {/* Biểu đồ doanh số */}
            <View
              style={[
                styles.chartCard,
                styles.salesCard,
                compact && styles.chartCardMobile,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.chartTitleRow}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={20}
                    color="#ed263d"
                  />
                  <Text style={styles.chartTitle}>
                    Doanh số theo ngày
                  </Text>
                </View>

                <Pressable
                  style={styles.periodSelect}
                  onPress={() =>
                    setChartPeriod((previous) =>
                      previous === "Theo ngày"
                        ? "Theo tuần"
                        : previous === "Theo tuần"
                          ? "Theo tháng"
                          : "Theo ngày",
                    )
                  }
                >
                  <Text style={styles.periodText}>
                    {chartPeriod}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={12}
                    color="#64748b"
                  />
                </Pressable>
              </View>

              {/* Biểu đồ đường doanh số */}
              <SalesChart compact={compact} />

              <View style={styles.chartFooter}>
                <View style={styles.salesLegendLine} />
                <Text style={styles.salesLegendText}>
                  Doanh số
                </Text>
              </View>
            </View>

            {/* Biểu đồ doanh số theo danh mục */}
            <View
              style={[
                styles.chartCard,
                styles.categoryCard,
                compact && styles.chartCardMobile,
              ]}
            >
              <View style={styles.chartTitleRow}>
                <Ionicons
                  name="pie-chart-outline"
                  size={20}
                  color="#ed263d"
                />
                <Text style={styles.chartTitle}>
                  Doanh số theo danh mục
                </Text>
              </View>

              <View
                style={[
                  styles.pieWrapper,
                  compact && styles.pieWrapperMobile,
                ]}
              >
                {/* Biểu đồ doughnut */}
                <CategoryChart />

                {/* Chú thích danh mục */}
                <CategoryLegend />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Hộp thoại chọn khoảng thời gian */}
      <Modal
        visible={dateVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDateVisible(false)}
        >
          <Pressable
            style={styles.dateModal}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>
              Chọn khoảng thời gian
            </Text>

            {[
              "01/09/2025 - 30/09/2025",
              "01/10/2025 - 31/10/2025",
              "01/10/2026 - 12/10/2026",
            ].map((range) => (
              <Pressable
                key={range}
                style={[
                  styles.dateOption,
                  dateRange === range && styles.dateOptionActive,
                ]}
                onPress={() => {
                  setDateRange(range);
                  setDateVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    dateRange === range &&
                      styles.dateOptionTextActive,
                  ]}
                >
                  {range}
                </Text>

                {dateRange === range && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#ed263d"
                  />
                )}
              </Pressable>
            ))}

            <Pressable
              style={styles.closeButton}
              onPress={() => setDateVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ===== STYLE SHEET =====
// Chuyển CSS sang StyleSheet của React Native.
// Những thuộc tính như position: fixed, grid, hover, canvas và
// media query được thay bằng bố cục View, responsive và SVG.

const styles = StyleSheet.create({
  // Cài đặt chung
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8f9fc",
  },
  page: {
    flex: 1,
    height: "100%",
  },

  // ===== SIDEBAR BVP SHOP =====
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 20,
    paddingHorizontal: 13,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#f0f1f5",
    zIndex: 10,
    elevation: 4,
  },

  // Logo
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 25,
  },
  brandImage: {
    width: 48,
    height: 48,
  },
  brandText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#c8102e",
  },
  brandStrong: {
    color: "#8f101f",
  },

  // Menu
  sidebarMenu: {
    flex: 1,
  },
  menuHeading: {
    marginTop: 19,
    marginBottom: 8,
    marginLeft: 6,
    color: "#758198",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  systemHeading: {
    marginTop: 26,
    marginBottom: 8,
    marginLeft: 6,
    color: "#758198",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Các trang trong menu
  menuLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 43,
    paddingHorizontal: 12,
    marginBottom: 5,
    borderRadius: 9,
  },
  menuLinkActive: {
    backgroundColor: "#e52332",
    shadowColor: "#ed263d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  },
  menuLinkText: {
    flex: 1,
    color: "#354157",
    fontSize: 12,
    fontWeight: "500",
  },
  menuLinkTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Thẻ quảng bá phía dưới
  imageSide: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
  },
  promoImage: {
    width: 170,
    height: 150,
  },

  // ===== HEADER =====
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf0f5",
    zIndex: 2,
  },

  // Tài khoản Admin
  accountAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#ffe5e9",
  },
  accountName: {
    color: "#263248",
    fontSize: 14,
    fontWeight: "600",
  },

  // Main nằm dưới header
  mainContent: {
    flex: 1,
  },
  mainContentInner: {
    padding: 24,
    paddingBottom: 40,
  },

  // ===== TIÊU ĐỀ TRANG =====
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
  headingText: {
    flex: 1,
  },
  headingTitle: {
    marginBottom: 6,
    color: "#172033",
    fontSize: 23,
    fontWeight: "700",
  },
  headingDescription: {
    color: "#8791a5",
    fontSize: 12,
    lineHeight: 18,
  },

  // Các nút phía bên phải
  headingActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  headingActionsCompact: {
    width: "100%",
  },
  dateFilter: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e8f0",
    borderRadius: 8,
  },
  dateFilterText: {
    color: "#45516a",
    fontSize: 11,
  },
  addOrder: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    backgroundColor: "#ed263d",
    borderWidth: 1,
    borderColor: "#ed263d",
    borderRadius: 8,
  },
  addOrderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  // ===== LƯỚI THỐNG KÊ =====
  statistics: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -7,
    rowGap: 14,
  },
  statisticsCompact: {
    marginHorizontal: 0,
  },
  statCardWrapper: {
    paddingHorizontal: 7,
  },
  statCardWrapperDesktop: {
    width: "25%",
  },
  statCardWrapperTablet: {
    width: "50%",
  },
  statCardWrapperMobile: {
    width: "100%",
    paddingHorizontal: 0,
  },

  // Từng thẻ
  statCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minHeight: 112,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#edf0f5",
    borderRadius: 11,
    overflow: "hidden",
    elevation: 1,
  },

  // Icon của từng thẻ
  statIcon: {
    flexShrink: 0,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },

  // Thông tin thống kê
  statInfo: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  statLabel: {
    marginTop: 3,
    marginBottom: 6,
    color: "#5d6880",
    fontSize: 11,
  },
  statValue: {
    marginBottom: 8,
    color: "#151e32",
    fontSize: 23,
    fontWeight: "700",
  },

  // Phần trăm thay đổi
  statChange: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  statPercentage: {
    fontSize: 10,
    fontWeight: "700",
  },
  statDescription: {
    color: "#8791a5",
    fontSize: 9,
  },

  // Biểu đồ đường nhỏ
  miniChart: {
    position: "absolute",
    right: 6,
    bottom: 22,
  },

  // ===== BIỂU ĐỒ DASHBOARD =====
  dashboardChart: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
    marginTop: 20,
  },
  dashboardChartStacked: {
    flexDirection: "column",
  },

  // Khung biểu đồ
  chartCard: {
    minWidth: 0,
    minHeight: 350,
    padding: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#edf0f5",
    borderRadius: 12,
    elevation: 1,
  },
  salesCard: {
    flex: 1.8,
  },
  categoryCard: {
    flex: 1,
  },
  chartCardMobile: {
    padding: 12,
  },

  // Tiêu đề biểu đồ
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartTitle: {
    flexShrink: 1,
    color: "#162447",
    fontSize: 15,
    fontWeight: "700",
  },

  // Bộ chọn kiểu thời gian
  periodSelect: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: "#e4e8f0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  periodText: {
    color: "#45516a",
    fontSize: 11,
  },

  // Biểu đồ đường doanh số
  salesChartContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 5,
  },
  salesLegendLine: {
    width: 20,
    height: 3,
    backgroundColor: "#ff2948",
    borderRadius: 2,
  },
  salesLegendText: {
    color: "#8791a5",
    fontSize: 11,
  },

  // Biểu đồ danh mục
  pieWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 12,
  },
  pieWrapperMobile: {
    flexDirection: "column",
    paddingTop: 8,
  },
  doughnutContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Chú thích danh mục
  legend: {
    flex: 1,
    minWidth: 115,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    color: "#45516a",
    fontSize: 11,
  },

  // ===== MODAL CHỌN NGÀY =====
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  dateModal: {
    width: "100%",
    maxWidth: 380,
    padding: 18,
    backgroundColor: "#ffffff",
    borderRadius: 14,
  },
  modalTitle: {
    marginBottom: 12,
    color: "#172033",
    fontSize: 17,
    fontWeight: "700",
  },
  dateOption: {
    minHeight: 45,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 7,
  },
  dateOptionActive: {
    backgroundColor: "#fff0f2",
  },
  dateOptionText: {
    color: "#354157",
    fontSize: 12,
  },
  dateOptionTextActive: {
    color: "#d71932",
    fontWeight: "600",
  },
  closeButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#e52332",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});