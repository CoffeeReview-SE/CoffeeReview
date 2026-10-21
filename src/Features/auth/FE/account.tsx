import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { LanguageSelector } from "@/Core/components/language-selector";
import { AiConsultationWidget } from "@/Core/components/ai-consultation-widget";
import { useLanguage } from "@/Core/contexts/language-context";
import {
  changeCurrentPassword,
  deleteAddress,
  deleteCurrentAccount,
  getAddresses,
  getCurrentUser,
  getPromoEmailPreference,
  logoutUser,
  saveAddress,
  setPromoEmailPreference,
  updateCurrentUser,
  type Address,
  type UserProfile,
} from "../Use-cases/authService";

// Các mục hiển thị ngay trong trang tài khoản, không cần chuyển sang route khác.
type AccountInlineSection =
  | "profile"
  | "settings"
  | "addresses"
  | "favorites"
  | "wallet"
  | "coupons";

const menuItems = [
  {
    icon: "receipt-outline" as const,
    label: "Đơn hàng của tôi",
    detail: "Theo dõi trạng thái đơn hàng",
    route: "/orders" as const,
  },
  {
    icon: "cart-outline" as const,
    label: "Giỏ hàng",
    detail: "Xem các sản phẩm bạn đã chọn",
    route: "/cart" as const,
  },
  {
    icon: "location-outline" as const,
    label: "Địa chỉ giao hàng",
    detail: "Quản lý địa chỉ nhận hàng",
    section: "addresses" as const,
  },
  {
    icon: "heart-outline" as const,
    label: "Sản phẩm yêu thích",
    detail: "Các sản phẩm bạn đã lưu",
    section: "favorites" as const,
  },
  {
    icon: "wallet-outline" as const,
    label: "Ví của tôi",
    detail: "Phương thức thanh toán",
    section: "wallet" as const,
  },
  {
    icon: "pricetag-outline" as const,
    label: "Mã giảm giá",
    detail: "Ưu đãi dành cho bạn",
    section: "coupons" as const,
  },
  {
    icon: "settings-outline" as const,
    label: "Cài đặt tài khoản",
    detail: "Bảo mật và tùy chọn",
    section: "settings" as const,
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState<AccountInlineSection | null>(null);

  // Tải hồ sơ hiện tại một lần; cờ isMounted tránh cập nhật state sau khi rời màn hình.
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && user === null) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        t("Đăng xuất thất bại"),
        error instanceof Error ? t(error.message) : t("Không thể đăng xuất lúc này."),
      );
    }
  };

  if (isLoading || !user) {
    return null;
  }

  // Dùng thông tin này để đồng bộ tiêu đề và mô tả với mục đang được chọn.
  const selectedMenuItem = menuItems.find(
    (item) => item.section === activeSection,
  );

  return (
    <>
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Pressable style={styles.brand} onPress={() => router.replace("/")}>
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={[styles.logo, isMobile && styles.logoMobile]}
            resizeMode="contain"
          />
          <Text style={[styles.brandText, isMobile && styles.brandTextMobile]}>
            {t("BVP Shop")}
          </Text>
        </Pressable>
        {!isMobile && (
          <Text style={styles.headerCaption}>{t("Tài khoản của tôi")}</Text>
        )}
        <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
          <LanguageSelector />
          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/")}
          >
            <Ionicons name="home-outline" size={18} color="#fff" />
            <Text style={styles.homeText}>{t("Trang chủ")}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.layout, isMobile && styles.layoutMobile]}>
        {!isMobile && (
          <View style={styles.sidebar}>
            <View style={styles.userSummary}>
              <View style={styles.avatar}>
                {user.avatarUri ? (
                  <Image
                    source={{ uri: user.avatarUri }}
                    style={styles.avatarPhoto}
                  />
                ) : (
                  <Ionicons name="person" size={30} color="#d32f2f" />
                )}
              </View>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            {[
              t("Tổng quan"),
              ...menuItems.map((item) => item.label),
            ].map((label, index) => (
              <Pressable
                key={label}
                style={[
                  styles.sideItem,
                  (index === 0
                    ? activeSection === null
                    : menuItems[index - 1]?.section === activeSection) &&
                    styles.sideItemActive,
                ]}
                onPress={() => {
                  if (index === 0) {
                    setActiveSection(null);
                    return;
                  }

                  const item = menuItems[index - 1];
                  if (item?.route) return router.push(item.route);
                  if (item?.section) return setActiveSection(item.section);

                  Alert.alert(
                    t(label),
                    t("Mục này sẽ được hoàn thiện ở bước tiếp theo."),
                  );
                }}
              >
                <Ionicons
                  name={
                    index === 0
                      ? "grid-outline"
                      : (menuItems[index - 1]?.icon ?? "grid-outline")
                  }
                  size={18}
                  color={index === 0 ? "#d32f2f" : "#555"}
                />
                <Text
                  style={[
                    styles.sideText,
                    (index === 0
                      ? activeSection === null
                      : menuItems[index - 1]?.section === activeSection) &&
                      styles.sideTextActive,
                  ]}
                >
                  {t(label)}
                </Text>
              </Pressable>
            ))}
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#d32f2f" />
              <Text style={styles.logoutText}>{t("Đăng xuất")}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.main}>
          <View style={styles.pageTitleRow}>
            <Ionicons
              name={
                activeSection === "profile"
                  ? "person-circle-outline"
                  : (selectedMenuItem?.icon ?? "person-circle-outline")
              }
              size={27}
              color="#d32f2f"
            />
            <Text style={styles.pageTitle}>
              {activeSection === "profile"
                ? t("Chỉnh sửa thông tin cá nhân")
                : t(selectedMenuItem?.label ?? "Tài khoản của tôi")}
            </Text>
          </View>
          <Text style={styles.pageSubtitle}>
            {activeSection === "profile"
              ? t("Cập nhật họ tên, email và số điện thoại của bạn.")
              : t(selectedMenuItem?.detail ??
                "Quản lý thông tin cá nhân và hoạt động mua sắm của bạn.")}
          </Text>

          {activeSection === null ? (
            <>
              <View
                style={[
                  styles.profileCard,
                  isMobile && styles.profileCardMobile,
                ]}
              >
                <View style={styles.profileLeft}>
                  <View style={styles.avatarLarge}>
                    {user.avatarUri ? (
                      <Image
                        source={{ uri: user.avatarUri }}
                        style={styles.avatarPhotoLarge}
                      />
                    ) : (
                      <Ionicons name="person" size={32} color="#d32f2f" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.greeting}>
                      {t("Xin chào")}, {user.fullName}!
                    </Text>
                    <Text style={styles.muted}>
                      {t("Chào mừng bạn quay lại BVP Shop.")}
                    </Text>
                    <Text style={styles.emailText}>{user.email}</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.editButton}
                  onPress={() => setActiveSection("profile")}
                >
                  <Ionicons name="create-outline" size={16} color="#d32f2f" />
                  <Text style={styles.editText}>{t("Chỉnh sửa")}</Text>
                </Pressable>
              </View>

              <View
                style={[styles.statsRow, isMobile && styles.statsRowMobile]}
              >
                <StatCard
                  icon="receipt-outline"
                  title={t("Đơn hàng")}
                  value="3"
                  note={t("Tổng đơn hàng")}
                />
                <StatCard
                  icon="heart-outline"
                  title={t("Yêu thích")}
                  value="0"
                  note={t("Sản phẩm đã lưu")}
                />
                <StatCard
                  icon="wallet-outline"
                  title={t("Ví của tôi")}
                  value="0đ"
                  note={t("Số dư hiện tại")}
                />
              </View>

              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionTitleIcon}>
                    <Ionicons
                      name="grid-outline"
                      size={17}
                      color="#c62828"
                    />
                  </View>
                  <Text style={styles.sectionTitle}>{t("Quản lý tài khoản")}</Text>
                </View>
                <Text style={styles.sectionCaption}>
                  {t("Các tiện ích dành cho bạn")}
                </Text>
              </View>

              <View style={styles.menuCard}>
                {menuItems.map((item, index) => (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.menuItem,
                      index < menuItems.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={() => {
                      if (item.route) return router.push(item.route);
                      if (item.section) return setActiveSection(item.section);
                    }}
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon} size={21} color="#d32f2f" />
                    </View>
                    <View style={styles.menuCopy}>
                      <Text style={styles.menuTitle}>{t(item.label)}</Text>
                      <Text style={styles.menuDetail}>{t(item.detail)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#999" />
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.inlineSectionWrap}>
              <Pressable
                style={styles.inlineBackButton}
                onPress={() => setActiveSection(null)}
              >
                <Ionicons name="arrow-back" size={17} color="#d32f2f" />
                <Text style={styles.inlineBackText}>{t("Tổng quan tài khoản")}</Text>
              </Pressable>
              {activeSection === "addresses" && (
                <InlineAddressSection userId={user.id} />
              )}
              {activeSection === "profile" && (
                <InlineProfileEditor user={user} onUpdated={setUser} />
              )}
              {activeSection === "settings" && (
                <InlineAccountSettings
                  userId={user.id}
                  onAccountDeleted={() => {
                    setUser(null);
                    router.replace("/login");
                  }}
                />
              )}
              {activeSection === "favorites" && (
                <InlineEmptySection
                  icon="heart-outline"
                  title={t("Chưa có sản phẩm yêu thích")}
                  description={t("Sản phẩm bạn lưu sẽ xuất hiện tại đây.")}
                />
              )}
              {activeSection === "wallet" && <InlineWalletSection />}
              {activeSection === "coupons" && (
                <InlineEmptySection
                  icon="pricetag-outline"
                  title={t("Chưa có mã giảm giá")}
                  description={t("Mã ưu đãi khả dụng sẽ được hiển thị tại đây.")}
                />
              )}
            </View>
          )}

          {isMobile && (
            <Pressable style={styles.mobileLogout} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#d32f2f" />
              <Text style={styles.logoutText}>{t("Đăng xuất")}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <Text style={styles.footer}>© BVP Shop</Text>
    </ScrollView>
    <AiConsultationWidget onPress={() => router.push("/chat")} />
    </>
  );
}

function InlineProfileEditor({
  user,
  onUpdated,
}: {
  user: UserProfile;
  onUpdated: (user: UserProfile) => void;
}) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [birthDate, setBirthDate] = useState(user.birthDate ?? "");
  const [gender, setGender] = useState<UserProfile["gender"]>(user.gender);
  const [avatarUri, setAvatarUri] = useState(user.avatarUri ?? "");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Chọn ảnh vuông từ thư viện và giới hạn kích thước dữ liệu base64 lưu trong hồ sơ.
  const chooseAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64 && asset.base64.length <= 1_500_000) {
          setAvatarUri(
            `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`,
          );
        } else {
          setFeedback(t("Ảnh quá lớn. Hãy chọn ảnh khác có dung lượng nhỏ hơn."));
          return;
        }
        setFeedback("");
      }
    } catch {
      setFeedback(t("Không mở được thư viện ảnh. Vui lòng thử lại."));
    }
  };

  const saveProfile = async () => {
    // Kiểm tra dữ liệu tại giao diện trước khi gửi yêu cầu cập nhật hồ sơ.
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setFeedback(t("Vui lòng nhập đầy đủ họ tên, email và số điện thoại."));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback(t("Email chưa đúng định dạng."));
      return;
    }
    if (!/^[0-9+()\-\s]{9,15}$/.test(phone.trim())) {
      setFeedback(t("Số điện thoại chưa hợp lệ."));
      return;
    }
    if (birthDate.trim()) {
      const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate.trim());
      if (!dateMatch) {
        setFeedback(t("Ngày sinh dùng định dạng DD/MM/YYYY."));
        return;
      }
      const [, day, month, year] = dateMatch;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (
        parsedDate.getFullYear() !== Number(year) ||
        parsedDate.getMonth() !== Number(month) - 1 ||
        parsedDate.getDate() !== Number(day) ||
        parsedDate > new Date()
      ) {
        setFeedback(t("Ngày sinh không hợp lệ."));
        return;
      }
    }

    setIsSaving(true);
    setFeedback("");
    try {
      onUpdated(
        await updateCurrentUser({
          fullName,
          email,
          phone,
          birthDate,
          gender,
          avatarUri,
        }),
      );
      setFeedback(t("Thông tin cá nhân đã được cập nhật."));
    } catch (error) {
      setFeedback(
        error instanceof Error ? t(error.message) : t("Không lưu được thông tin."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.inlinePanel}>
      <Text style={styles.inlineSectionTitle}>{t("Thông tin cá nhân")}</Text>
      <Text style={styles.inlineSectionDescription}>
        {t("Cập nhật thông tin cá nhân hiển thị trên tài khoản và đơn hàng.")}
      </Text>
      <View style={styles.avatarEditorRow}>
        <View style={styles.avatarEditorPreview}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarEditorImage}
            />
          ) : (
            <Ionicons name="person" size={34} color="#d32f2f" />
          )}
        </View>
        <View style={styles.avatarEditorCopy}>
          <Text style={styles.inlineFieldLabel}>{t("Ảnh đại diện")}</Text>
          <Text style={styles.inlineSectionDescription}>
            {t("Chọn ảnh từ thư viện trên thiết bị.")}
          </Text>
          <Pressable
            style={styles.inlineSecondaryButton}
            onPress={chooseAvatar}
          >
            <Text style={styles.inlineSecondaryButtonText}>{t("Chọn ảnh")}</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.inlineFieldLabel}>{t("Họ và tên")}</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder={t("Họ và tên")}
        style={styles.inlineInput}
      />
      <Text style={styles.inlineFieldLabel}>{t("Email")}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.inlineInput}
      />
      <Text style={styles.inlineFieldLabel}>{t("Số điện thoại")}</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder={t("Số điện thoại")}
        keyboardType="phone-pad"
        style={styles.inlineInput}
      />
      <Text style={styles.inlineFieldLabel}>{t("Ngày sinh")}</Text>
      <TextInput
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="DD/MM/YYYY"
        style={styles.inlineInput}
      />
      <Text style={styles.inlineFieldLabel}>{t("Giới tính")}</Text>
      <View style={styles.genderOptions}>
        {(
          [
            ["female", t("Nữ")],
            ["male", t("Nam")],
            ["other", t("Khác")],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: gender === value }}
            onPress={() => setGender(value)}
            style={[
              styles.genderOption,
              gender === value && styles.genderOptionSelected,
            ]}
          >
            <Text
              style={[
                styles.genderOptionText,
                gender === value && styles.genderOptionTextSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {!!feedback && (
        <Text
          style={[
            styles.inlineFeedback,
            feedback === t("Thông tin cá nhân đã được cập nhật.") && styles.inlineSuccess,
          ]}
        >
          {feedback}
        </Text>
      )}
      <View style={styles.inlineActions}>
        <Pressable
          style={styles.inlinePrimaryButton}
          onPress={saveProfile}
          disabled={isSaving}
        >
          <Text style={styles.inlinePrimaryButtonText}>
            {isSaving ? t("Đang lưu...") : t("Lưu thay đổi")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InlineAccountSettings({
  userId,
  onAccountDeleted,
}: {
  userId: string;
  onAccountDeleted: () => void;
}) {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [promoEmails, setPromoEmails] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Nạp tùy chọn email khuyến mãi theo tài khoản và không cập nhật state khi đã unmount.
  useEffect(() => {
    let isMounted = true;
    getPromoEmailPreference(userId)
      .then((enabled) => {
        if (isMounted) setPromoEmails(enabled);
      })
      .catch(() => {
        if (isMounted) setFeedback(t("Không tải được tùy chọn thông báo."));
      });
    return () => {
      isMounted = false;
    };
  }, [t, userId]);

  const savePassword = async () => {
    // Chỉ đổi mật khẩu khi người dùng đã nhập đủ và hai mật khẩu mới trùng nhau.
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback(t("Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới."));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback(t("Mật khẩu xác nhận không khớp."));
      return;
    }

    setIsSavingPassword(true);
    setFeedback("");
    try {
      await changeCurrentPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback(t("Mật khẩu đã được thay đổi."));
    } catch (error) {
      setFeedback(
        error instanceof Error ? t(error.message) : t("Không đổi được mật khẩu."),
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const togglePromoEmails = async (enabled: boolean) => {
    // Cập nhật lạc quan; nếu lưu thất bại thì khôi phục trạng thái trước đó.
    setPromoEmails(enabled);
    try {
      await setPromoEmailPreference(userId, enabled);
      setFeedback("");
    } catch {
      setPromoEmails(!enabled);
      setFeedback(t("Không lưu được tùy chọn email khuyến mãi."));
    }
  };

  const confirmAccountDeletion = () => {
    // Yêu cầu xác thực bằng mật khẩu và cụm xác nhận trước thao tác không thể hoàn tác.
    if (!deletePassword || deleteConfirmation !== t("XOA TAI KHOAN")) {
      setFeedback(
        t('Nhập mật khẩu và chính xác cụm "XOA TAI KHOAN" để tiếp tục.'),
      );
      return;
    }

    Alert.alert(
      t("Xóa tài khoản vĩnh viễn?"),
      t("Tài khoản, địa chỉ đã lưu và tùy chọn email khuyến mãi của bạn sẽ bị xóa khỏi thiết bị này. Thao tác này không thể hoàn tác."),
      [
        { text: t("Giữ tài khoản"), style: "cancel" },
        {
          text: t("Xóa tài khoản"),
          style: "destructive",
          onPress: async () => {
            setIsDeletingAccount(true);
            setFeedback("");
            try {
              await deleteCurrentAccount(deletePassword, "XOA TAI KHOAN");
              onAccountDeleted();
            } catch (error) {
              setFeedback(
                error instanceof Error
                  ? error.message
                  : t("Không thể xóa tài khoản."),
              );
              setIsDeletingAccount(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.inlineSectionWrap}>
      <View style={styles.inlinePanel}>
        <Text style={styles.inlineSectionTitle}>{t("Đổi mật khẩu")}</Text>
        <Text style={styles.inlineSectionDescription}>
          {t("Dùng mật khẩu hiện tại để đặt mật khẩu mới cho tài khoản.")}
        </Text>
        <Text style={styles.inlineFieldLabel}>{t("Mật khẩu hiện tại")}</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t("Nhập mật khẩu hiện tại")}
          secureTextEntry
          style={styles.inlineInput}
        />
        <Text style={styles.inlineFieldLabel}>{t("Mật khẩu mới")}</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t("Ít nhất 6 ký tự")}
          secureTextEntry
          style={styles.inlineInput}
        />
        <Text style={styles.inlineFieldLabel}>{t("Xác nhận mật khẩu mới")}</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("Nhập lại mật khẩu mới")}
          secureTextEntry
          style={styles.inlineInput}
        />
        <View style={styles.inlineActions}>
          <Pressable
            style={styles.inlinePrimaryButton}
            onPress={savePassword}
            disabled={isSavingPassword}
          >
            <Text style={styles.inlinePrimaryButtonText}>
              {isSavingPassword ? t("Đang cập nhật...") : t("Đổi mật khẩu")}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.inlinePanel}>
        <View style={styles.inlineSwitchRow}>
          <View style={styles.inlineSectionCopy}>
            <Text style={styles.inlineFieldLabel}>{t("Email khuyến mãi")}</Text>
            <Text style={styles.inlineSectionDescription}>
              {t("Cho phép nhận thông tin ưu đãi qua email.")}
            </Text>
          </View>
          <Switch
            value={promoEmails}
            onValueChange={togglePromoEmails}
            trackColor={{ true: "#d32f2f" }}
          />
        </View>
        <View style={styles.inlineNotice}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#946200"
          />
          <Text style={styles.inlineNoticeText}>
            {t("Tùy chọn được lưu trên thiết bị này; gửi email cần dịch vụ backend.")}
          </Text>
        </View>
      </View>

      <View style={styles.inlinePanel}>
        <Text style={styles.inlineSectionTitle}>{t("Bảo mật tài khoản")}</Text>
        <VerificationStatus
          label="Email"
          value={t(userId ? "Chưa xác minh" : "Không khả dụng")}
        />
        <VerificationStatus label={t("Số điện thoại")} value={t("Chưa xác minh")} />
        <View style={styles.inlineNotice}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#946200"
          />
          <Text style={styles.inlineNoticeText}>
            {t("Xác minh email hoặc số điện thoại cần backend gửi mã xác thực; bản demo chưa hỗ trợ.")}
          </Text>
        </View>
      </View>

      <View style={styles.dangerPanel}>
        <Text style={styles.dangerTitle}>{t("Xóa tài khoản")}</Text>
        <Text style={styles.inlineSectionDescription}>
          {t("Xóa tài khoản và dữ liệu gắn với tài khoản trên thiết bị này. Cần nhập lại mật khẩu và xác nhận rõ ràng.")}
        </Text>
        <Text style={styles.inlineFieldLabel}>{t("Mật khẩu hiện tại")}</Text>
        <TextInput
          value={deletePassword}
          onChangeText={setDeletePassword}
          placeholder={t("Nhập mật khẩu để xác nhận")}
          secureTextEntry
          style={styles.inlineInput}
        />
        <Text style={styles.inlineFieldLabel}>
          {t("Nhập XOA TAI KHOAN để xác nhận")}
        </Text>
        <TextInput
          value={deleteConfirmation}
          onChangeText={setDeleteConfirmation}
          placeholder={t("XOA TAI KHOAN")}
          autoCapitalize="characters"
          style={styles.inlineInput}
        />
        <Pressable
          style={styles.deleteAccountButton}
          onPress={confirmAccountDeletion}
          disabled={isDeletingAccount}
        >
          <Text style={styles.deleteAccountButtonText}>
            {isDeletingAccount ? t("Đang xóa...") : t("Xóa tài khoản vĩnh viễn")}
          </Text>
        </Pressable>
      </View>

      {!!feedback && <Text style={styles.inlineFeedback}>{feedback}</Text>}
    </View>
  );
}

function VerificationStatus({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.verificationRow}>
      <Text style={styles.verificationLabel}>{t(label)}</Text>
      <View style={styles.verificationValueGroup}>
        <Ionicons name="alert-circle-outline" size={16} color="#946200" />
        <Text style={styles.verificationValue}>{t(value)}</Text>
      </View>
    </View>
  );
}

function InlineAddressSection({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<Address | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getAddresses(userId)
      .then((savedAddresses) => {
        if (isMounted) setAddresses(savedAddresses);
      })
      .catch(() => {
        if (isMounted) setFeedback(t("Không tải được danh sách địa chỉ."));
      });
    return () => {
      isMounted = false;
    };
  }, [t, userId]);

  const updateField = (
    key: "receiver" | "phone" | "province" | "district" | "ward" | "detail",
    value: string,
  ) => setForm((current) => (current ? { ...current, [key]: value } : current));

  const startNewAddress = () => {
    setForm({
      id: `${Date.now()}`,
      receiver: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      detail: "",
      isDefault: addresses.length === 0,
    });
    setFeedback("");
  };

  const saveCurrentAddress = async () => {
    if (!form) return;
    if (
      !form.receiver.trim() ||
      !form.phone.trim() ||
      !form.province.trim() ||
      !form.district.trim() ||
      !form.ward.trim() ||
      !form.detail.trim()
    ) {
      setFeedback(t("Vui lòng điền đầy đủ thông tin địa chỉ."));
      return;
    }

    setIsSaving(true);
    try {
      setAddresses(await saveAddress(form, userId));
      setForm(null);
      setFeedback("");
    } catch {
      setFeedback(t("Không lưu được địa chỉ. Vui lòng thử lại."));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (address: Address) => {
    Alert.alert(t("Xóa địa chỉ"), `${t("Xóa địa chỉ của")} ${address.receiver}?`, [
      { text: t("Hủy"), style: "cancel" },
      {
        text: t("Xóa"),
        style: "destructive",
        onPress: async () => {
          try {
            setAddresses(await deleteAddress(address.id, userId));
          } catch {
              setFeedback(t("Không xóa được địa chỉ. Vui lòng thử lại."));
          }
        },
      },
    ]);
  };

  const addressFields = [
    {
      key: "receiver",
      label: "Họ tên người nhận",
      placeholder: "Nguyễn Văn A",
    },
    { key: "phone", label: "Số điện thoại", placeholder: "09..." },
    {
      key: "province",
      label: "Tỉnh / Thành phố",
      placeholder: "TP. Hồ Chí Minh",
    },
    { key: "district", label: "Quận / Huyện", placeholder: "Quận 1" },
    { key: "ward", label: "Phường / Xã", placeholder: "Phường Bến Nghé" },
    {
      key: "detail",
      label: "Địa chỉ chi tiết",
      placeholder: "Số nhà, tên đường...",
    },
  ] as const;

  return (
    <View style={styles.inlineSectionWrap}>
      <View style={styles.inlineSectionToolbar}>
        <View style={styles.inlineSectionCopy}>
          <Text style={styles.inlineSectionTitle}>{t("Địa chỉ đã lưu")}</Text>
          <Text style={styles.inlineSectionDescription}>
            {t("Chọn địa chỉ nhận hàng mặc định hoặc cập nhật danh sách của bạn.")}
          </Text>
        </View>
        {!form && (
          <Pressable
            style={styles.inlinePrimaryButton}
            onPress={startNewAddress}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.inlinePrimaryButtonText}>{t("Thêm địa chỉ")}</Text>
          </Pressable>
        )}
      </View>

      {form && (
        <View style={styles.inlinePanel}>
          <Text style={styles.inlineSectionTitle}>
            {addresses.some((address) => address.id === form.id)
              ? t("Chỉnh sửa địa chỉ")
              : t("Địa chỉ mới")}
          </Text>
          {addressFields.map((field) => (
            <View key={field.key}>
              <Text style={styles.inlineFieldLabel}>{t(field.label)}</Text>
              <TextInput
                value={form[field.key]}
                onChangeText={(value) => updateField(field.key, value)}
                placeholder={t(field.placeholder)}
                placeholderTextColor="#999"
                style={styles.inlineInput}
                keyboardType={field.key === "phone" ? "phone-pad" : "default"}
              />
            </View>
          ))}
          <View style={styles.inlineSwitchRow}>
            <Text style={styles.inlineFieldLabel}>
              {t("Đặt làm địa chỉ mặc định")}
            </Text>
            <Switch
              value={form.isDefault}
              onValueChange={(value) =>
                setForm((current) =>
                  current ? { ...current, isDefault: value } : current,
                )
              }
              trackColor={{ true: "#d32f2f" }}
            />
          </View>
          <View style={styles.inlineActions}>
            <Pressable
              style={styles.inlineSecondaryButton}
              onPress={() => {
                setForm(null);
                setFeedback("");
              }}
            >
              <Text style={styles.inlineSecondaryButtonText}>{t("Hủy")}</Text>
            </Pressable>
            <Pressable
              style={styles.inlinePrimaryButton}
              onPress={saveCurrentAddress}
              disabled={isSaving}
            >
              <Text style={styles.inlinePrimaryButtonText}>
                {isSaving ? t("Đang lưu...") : t("Lưu địa chỉ")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {!!feedback && <Text style={styles.inlineFeedback}>{feedback}</Text>}

      {addresses.length === 0 && !form ? (
        <InlineEmptySection
          icon="location-outline"
          title={t("Bạn chưa lưu địa chỉ nào")}
          description={t("Thêm địa chỉ để thuận tiện cho lần đặt hàng tiếp theo.")}
        />
      ) : (
        addresses.map((address) => (
          <View key={address.id} style={styles.inlinePanel}>
            <View style={styles.inlineAddressHeader}>
              <View style={styles.inlineSectionCopy}>
                <Text style={styles.inlineAddressName}>
                  {address.receiver} · {address.phone}
                </Text>
                <Text style={styles.inlineAddressText}>
                  {address.detail}, {address.ward}, {address.district},{" "}
                  {address.province}
                </Text>
              </View>
              {address.isDefault && (
                <Text style={styles.inlineDefaultBadge}>{t("Mặc định")}</Text>
              )}
            </View>
            <View style={styles.inlineActions}>
              <Pressable onPress={() => setForm({ ...address })}>
                <Text style={styles.inlineLink}>{t("Chỉnh sửa")}</Text>
              </Pressable>
              {!address.isDefault && (
                <Pressable
                  onPress={async () => {
                    try {
                      setAddresses(
                        await saveAddress(
                          { ...address, isDefault: true },
                          userId,
                        ),
                      );
                    } catch {
                      setFeedback(t("Không thể đổi địa chỉ mặc định."));
                    }
                  }}
                >
                  <Text style={styles.inlineLink}>{t("Đặt mặc định")}</Text>
                </Pressable>
              )}
              <Pressable onPress={() => confirmDelete(address)}>
                <Text style={styles.inlineDelete}>{t("Xóa")}</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function InlineEmptySection({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.inlineEmptyPanel}>
      <View style={styles.inlineEmptyIcon}>
        <Ionicons name={icon} size={27} color="#d32f2f" />
      </View>
      <Text style={styles.inlineEmptyTitle}>{t(title)}</Text>
      <Text style={styles.inlineSectionDescription}>{t(description)}</Text>
    </View>
  );
}

function InlineWalletSection() {
  const { t } = useLanguage();

  return (
    <View style={styles.inlinePanel}>
      <View style={styles.inlineWalletHeader}>
        <View style={styles.inlineEmptyIcon}>
          <Ionicons name="wallet-outline" size={25} color="#d32f2f" />
        </View>
        <View style={styles.inlineSectionCopy}>
          <Text style={styles.inlineFieldLabel}>{t("Số dư ví hiện tại")}</Text>
          <Text style={styles.inlineWalletBalance}>{t("0đ")}</Text>
        </View>
      </View>
      <View style={styles.inlineNotice}>
        <Ionicons name="information-circle-outline" size={19} color="#946200" />
        <Text style={styles.inlineNoticeText}>
          {t("Ví điện tử và phương thức thanh toán chưa được kết nối trong bản demo.")}
        </Text>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  title,
  value,
  note,
}: {
  icon: "receipt-outline" | "heart-outline" | "wallet-outline";
  title: string;
  value: string;
  note: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={19} color="#d32f2f" />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  pageContent: { flexGrow: 1, paddingBottom: 24 },
  header: {
    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 18,
    backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 25,
  },
  headerMobile: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    minHeight: 78,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 25,
  },
  headerActionsMobile: { gap: 8 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: { width: 65, height: 65, borderRadius: 8 },
  logoMobile: { width: 48, height: 48, borderRadius: 7 },
  brandText: { color: "#fff", fontSize: 27, fontWeight: "800", marginLeft: 3 },
  brandTextMobile: { fontSize: 22, marginLeft: 0 },
  headerCaption: { color: "#fff", fontSize: 13 },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  homeText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  layout: {
    width: "94%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
    paddingVertical: 28,
  },
  layoutMobile: { width: "100%", paddingHorizontal: 16, paddingVertical: 22 },
  sidebar: {
    width: 245,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 14,
  },
  userSummary: {
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  userName: { color: "#222", fontWeight: "700", fontSize: 14 },
  userEmail: { color: "#888", fontSize: 11, marginTop: 4 },
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sideItemActive: { backgroundColor: "#fff0f0" },
  sideText: { color: "#555", fontSize: 12, flex: 1 },
  sideTextActive: { color: "#d32f2f", fontWeight: "700" },
  logoutButton: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
  },
  logoutText: { color: "#d32f2f", fontSize: 13, fontWeight: "700" },
  main: { flex: 1, minWidth: 0 },
  pageTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  pageTitle: { fontSize: 27, fontWeight: "800", color: "#222" },
  pageSubtitle: { color: "#777", fontSize: 13, marginTop: 6, marginBottom: 20 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  profileCardMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 16,
  },
  profileLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPhoto: { width: 60, height: 60, borderRadius: 30 },
  avatarPhotoLarge: { width: 68, height: 68, borderRadius: 34 },
  greeting: { fontSize: 17, fontWeight: "700", color: "#222" },
  muted: { fontSize: 12, color: "#777", marginTop: 5 },
  emailText: { fontSize: 12, color: "#d32f2f", marginTop: 5 },
  editButton: {
    borderWidth: 1,
    borderColor: "#d32f2f",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  editText: { color: "#d32f2f", fontSize: 12, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 14, marginTop: 16 },
  statsRowMobile: { flexDirection: "column" },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    borderRadius: 12,
    padding: 18,
  },
  statTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  statTitle: { color: "#555", fontSize: 12, fontWeight: "600" },
  statValue: { fontSize: 25, fontWeight: "800", color: "#222", marginTop: 16 },
  statNote: { color: "#888", fontSize: 11, marginTop: 3 },
  sectionHeader: { marginTop: 26, marginBottom: 12 },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  sectionTitleIcon: {
    alignItems: "center",
    backgroundColor: "#fff0f0",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  sectionTitle: { fontSize: 18, color: "#222", fontWeight: "800" },
  sectionCaption: { color: "#888", fontSize: 12, marginTop: 4 },
  inlineSectionWrap: { gap: 14 },
  inlineBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    paddingVertical: 7,
  },
  inlineBackText: { color: "#d32f2f", fontSize: 13, fontWeight: "700" },
  inlineSectionToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  inlineSectionCopy: { flex: 1, minWidth: 0 },
  inlineSectionTitle: { color: "#222", fontSize: 17, fontWeight: "800" },
  inlineSectionDescription: {
    color: "#777",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 4,
  },
  inlinePrimaryButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#d32f2f",
    borderRadius: 8,
  },
  inlinePrimaryButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  inlineSecondaryButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  inlineSecondaryButtonText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
  },
  inlinePanel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    borderRadius: 10,
    padding: 18,
    gap: 12,
  },
  inlineFieldLabel: {
    color: "#444",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inlineInput: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#222",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 7,
  },
  inlineSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 4,
  },
  inlineFeedback: { color: "#b42318", fontSize: 12, lineHeight: 18 },
  inlineSuccess: { color: "#16834a" },
  avatarEditorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  avatarEditorPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditorImage: { width: 76, height: 76, borderRadius: 38 },
  avatarEditorCopy: { flex: 1, alignItems: "flex-start", gap: 5 },
  genderOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genderOption: {
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  genderOptionSelected: { borderColor: "#d32f2f", backgroundColor: "#fff0f0" },
  genderOptionText: { color: "#555", fontSize: 13, fontWeight: "600" },
  genderOptionTextSelected: { color: "#d32f2f", fontWeight: "700" },
  inlineAddressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  inlineAddressName: { color: "#333", fontSize: 14, fontWeight: "700" },
  inlineAddressText: {
    color: "#666",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  inlineDefaultBadge: {
    color: "#b42318",
    backgroundColor: "#fff0f0",
    overflow: "hidden",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  inlineLink: { color: "#d32f2f", fontSize: 12, fontWeight: "700" },
  inlineDelete: { color: "#b42318", fontSize: 12, fontWeight: "700" },
  inlineEmptyPanel: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    borderRadius: 10,
  },
  inlineEmptyIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 26,
    backgroundColor: "#fff0f0",
  },
  inlineEmptyTitle: {
    color: "#333",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  inlineWalletHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  inlineWalletBalance: {
    color: "#222",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  inlineNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff8e6",
    borderRadius: 8,
  },
  inlineNoticeText: { flex: 1, color: "#73530b", fontSize: 12, lineHeight: 18 },
  verificationRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  verificationLabel: { color: "#444", fontSize: 13, fontWeight: "600" },
  verificationValueGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationValue: { color: "#946200", fontSize: 12, fontWeight: "600" },
  dangerPanel: {
    backgroundColor: "#fffafa",
    borderWidth: 1,
    borderColor: "#efcaca",
    borderRadius: 10,
    padding: 18,
    gap: 10,
  },
  dangerTitle: { color: "#a12622", fontSize: 16, fontWeight: "800" },
  deleteAccountButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#b42318",
  },
  deleteAccountButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#eee" },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: { flex: 1 },
  menuTitle: { color: "#333", fontSize: 13, fontWeight: "700" },
  menuDetail: { color: "#888", fontSize: 11, marginTop: 4 },
  mobileLogout: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d32f2f",
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
  },
  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    paddingVertical: 10,
  },
});
