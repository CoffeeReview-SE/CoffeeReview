import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LanguageSelector } from "@/Core/components/language-selector";
import { AiConsultationWidget } from "@/Core/components/ai-consultation-widget";
import { useLanguage } from "@/Core/contexts/language-context";
import { useProducts } from "@/Core/hooks/use-products";

/* ================================================= */
/*                 HOVER BUTTON                      */
/* ================================================= */

function HoverButton({ children, style, hoverStyle, ...props }: any) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <Pressable
            {...props}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            style={[style, hovered ? hoverStyle : style]}
        >
            {typeof children === "function"
                ? children(hovered)
                : children}
        </Pressable>
    );
}

function HeaderButton({
    icon,
    text,
    onPress,
    isMobile,
}: {
    icon: string;
    text: string;
    onPress?: () => void;
    isMobile: boolean;
}) {
    return (
        <HoverButton
            onPress={onPress}
            style={[
                styles.headerButtonContainer,
                isMobile && styles.headerButtonContainerMobile,
            ]}
            hoverStyle={styles.headerButtonContainerHover}
        >
            {(hovered: boolean) => (
                <>
                    <View
                        style={[
                            styles.headerButton,
                            isMobile && styles.headerButtonMobile,
                            hovered && styles.headerButtonHover,
                        ]}
                    >
                        <Ionicons
                            name={
                                icon === "cart-shopping"
                                    ? "cart-outline"
                                    : icon === "box"
                                      ? "cube-outline"
                                      : "person-outline"
                            }
                            size={isMobile ? 22 : 25}
                            color={hovered ? "red" : "#ffffff"}
                        />
                    </View>
                    <Text
                        style={[
                            styles.headerButtonText,
                            isMobile && styles.headerButtonTextMobile,
                        ]}
                    >
                        {text}
                    </Text>
                </>
            )}
        </HoverButton>
    );
}

function productCategoryIcon(categoryId: string, productName = ""): React.ComponentProps<typeof Ionicons>["name"] {
    if (categoryId === "PHONE1") return "phone-portrait-outline";
    if (categoryId === "LAPTOP") return "laptop-outline";
    if (categoryId === "WATCH1") return "watch-outline";
    const name = productName.toLowerCase();
    if (name.includes("ssd")) return "server-outline";
    if (name.includes("ram")) return "albums-outline";
    if (name.includes("cpu") || name.includes("gpu") || name.includes("rtx") || name.includes("core ultra")) return "hardware-chip-outline";
    if (name.includes("mainboard") || name.includes("motherboard")) return "git-network-outline";
    return "headset-outline";
}

function descriptionIcon(line: string): React.ComponentProps<typeof Ionicons>["name"] {
    const normalized = line.toLowerCase();
    if (normalized.includes("battery") || normalized.includes("pin")) return "battery-full-outline";
    if (normalized.includes("display") || normalized.includes("màn hình")) return "phone-portrait-outline";
    if (normalized.includes("ssd") || normalized.includes("storage") || normalized.includes("bộ nhớ")) return "server-outline";
    if (normalized.includes("ram")) return "albums-outline";
    if (normalized.includes("camera") || normalized.includes("lens")) return "camera-outline";
    if (normalized.includes("bluetooth") || normalized.includes("wi-fi") || normalized.includes("gps")) return "wifi-outline";
    return "hardware-chip-outline";
}

/* ================================================= */
/*                     APP                           */
/* ================================================= */

export default function ProductDetail() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { productId } = useLocalSearchParams<{ productId?: string }>();
    const { products, loading } = useProducts(Boolean(productId), language);
    const managedProduct = products.find((item) => item.id === productId);
    const descriptionLines = managedProduct?.description
        .split(/[;\n]+/)
        .map((line) => line.trim().replace(/[.]$/, ""))
        .filter(Boolean) ?? [];

    const { width } = useWindowDimensions();

    // Dùng cùng ngưỡng 600px để chuyển bố cục và style sang phiên bản điện thoại.
    const isMobile = width < 760;

    /* ================================================= */
    /*                     STATE                         */
    /* ================================================= */

    // Lưu lựa chọn hiện tại để cập nhật ảnh chính và trạng thái được chọn trong giao diện.
    const [selectedColor, setSelectedColor] = useState(1);
    const [selectedCapacity, setSelectedCapacity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    if (productId && !loading && !managedProduct) {
        return (
            <View style={[styles.container, styles.unavailableContainer]}>
                <Ionicons name="cube-outline" size={48} color="#c82435" />
                <Text style={styles.unavailableText}>{t("Sản phẩm không tồn tại")}</Text>
                <Pressable onPress={() => router.replace("/")} style={styles.unavailableButton}>
                    <Text style={styles.unavailableButtonText}>{t("Trang chủ")}</Text>
                </Pressable>
            </View>
        );
    }

    /* ================================================= */
    /*                 DANH SÁCH ẢNH                     */
    /* ================================================= */

    const productImages = [
        require("@/assets/image/16e1.jpg"),
        require("@/assets/image/16e2.jpg"),
        require("@/assets/image/16e3.jpg"),
        require("@/assets/image/16e4.jpg"),
        require("@/assets/image/16e5.png"),
    ];

    /* ================================================= */
    /*                  THÔNG TIN MÀU                    */
    /* ================================================= */

    const colors = [
        {
            id: 1,
            name: t("Trắng"),
            color: "#FFFFFF",
        },
        {
            id: 2,
            name: t("Đen"),
            color: "#000000",
        },
        {
            id: 3,
            name: t("Xanh"),
            color: "#0000FF",
        },
        {
            id: 4,
            name: t("Tím"),
            color: "#800080",
        },
    ];

    /* ================================================= */
    /*               THÔNG TIN DUNG LƯỢNG               */
    /* ================================================= */

    const capacities = [
        {
            id: 1,
            name: "128GB",
        },
        {
            id: 2,
            name: "256GB",
        },
    ];

    const specifications = [
        { icon: "phone-portrait-outline" as const, label: "Màn hình", value: '6.1" Super Retina' },
        { icon: "hardware-chip-outline" as const, label: "Chip", value: "A18 Bionic" },
        { icon: "camera-outline" as const, label: "Camera", value: "Hệ thống 48MP mới" },
        { icon: "battery-full-outline" as const, label: "Pin", value: "4820 mAh" },
    ];

    const searchBar = (
        <View style={[styles.searchBar, isMobile && styles.searchBarMobile]}>
            <TextInput
                placeholder={t("Tìm kiếm sản phẩm")}
                placeholderTextColor="#888"
                style={[styles.searchInput, isMobile && styles.searchInputMobile]}
            />
            <HoverButton
                style={[styles.searchButton, isMobile && styles.searchButtonMobile]}
                hoverStyle={styles.buttonHover}
            >
                <FontAwesome6
                    name="magnifying-glass"
                    size={isMobile ? 16 : 18}
                    color="#ffffff"
                />
            </HoverButton>
        </View>
    );

    /* ================================================= */
    /*                    RENDER                         */
    /* ================================================= */

    return (
        <View style={styles.container}>

            {/* ================================================= */}
            {/*                       HEADER                      */}
            {/* ================================================= */}

            <View
                style={[
                    styles.header,
                    isMobile && styles.headerMobile,
                ]}
            >

                {/* ================================================= */}
                {/*                        LOGO                       */}
                {/* ================================================= */}

                <Pressable
                    onPress={() => router.push("/")}
                    style={[
                        styles.logo,
                        isMobile && styles.logoMobile,
                    ]}
                >
                    <Image
                        source={require("@/assets/image/logo.jpg")}
                        style={[
                            styles.logoImage,
                            isMobile &&
                            styles.logoImageMobile,
                        ]}
                    />

                    <Text
                        style={[
                            styles.logoText,
                            isMobile &&
                            styles.logoTextMobile,
                        ]}
                    >
                        BVP Shop
                    </Text>
                </Pressable>

                {!isMobile && searchBar}

                {/* ================================================= */}
                {/*                  CUSTOMER ICONS                    */}
                {/* ================================================= */}

                <View
                    style={[
                        styles.customerIcons,
                        isMobile &&
                        styles.customerIconsMobile,
                    ]}
                >
                    <LanguageSelector />
                    {/* Giỏ hàng */}

                    <HeaderButton
                        icon="cart-shopping"
                        text={t("Giỏ hàng")}
                        onPress={() => router.push("/cart")}
                        isMobile={isMobile}
                    />

                    {/* Đơn hàng */}

                    <HeaderButton
                        icon="box"
                        text={t("Đơn hàng")}
                        onPress={() => router.push("/orders")}
                        isMobile={isMobile}
                    />

                </View>

                {isMobile && searchBar}
            </View>

            {/* ================================================= */}
            {/*                MAIN - SCROLL                       */}
            {/* ================================================= */}

            <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    isMobile &&
                    styles.scrollContentMobile,
                ]}
                showsVerticalScrollIndicator={false}
            >

                {/* ================================================= */}
                {/*                  PRODUCT DETAIL                  */}
                {/* ================================================= */}

                <View
                    style={[
                        styles.productDetail,
                        isMobile &&
                        styles.productDetailMobile,
                    ]}
                >

                    {/* ================================================= */}
                    {/*                  PRODUCT IMAGES                  */}
                    {/* ================================================= */}

                    <View
                        style={[
                            styles.productImages,
                            isMobile &&
                            styles.productImagesMobile,
                        ]}
                    >

                        {/* ẢNH LỚN */}

                        {managedProduct ? (
                        <View style={[styles.mainImage, styles.managedProductImage, isMobile && styles.mainImageMobile]}>
                            <Ionicons name={productCategoryIcon(managedProduct.categoryId, managedProduct.name)} size={100} color="#d9273e" />
                        </View>
                        ) : <View
                            style={[
                                styles.mainImage,
                                isMobile &&
                                styles.mainImageMobile,
                            ]}
                        >
                            <Image
                                source={
                                    productImages[
                                    selectedImage
                                    ]
                                }
                                style={[
                                    styles.mainProductImage,
                                    isMobile &&
                                    styles.mainProductImageMobile,
                                ]}
                            />
                        </View>}

                        {/* THUMBNAIL */}

                        {!managedProduct && <View
                            style={[
                                styles.thumbnailList,
                                isMobile &&
                                styles.thumbnailListMobile,
                            ]}
                        >
                            {productImages.map(
                                (image, index) => (
                                    // Chọn ảnh thu nhỏ để đổi ảnh chính đang hiển thị.
                                    <Pressable
                                        key={index}
                                        onPress={() =>
                                            setSelectedImage(
                                                index
                                            )
                                        }
                                        style={[
                                            styles.thumbnail,
                                            isMobile &&
                                            styles.thumbnailMobile,
                                            selectedImage ===
                                            index &&
                                            styles.thumbnailActive,
                                        ]}
                                    >
                                        <Image
                                            source={image}
                                            style={
                                                styles.thumbnailImage
                                            }
                                        />
                                    </Pressable>
                                )
                            )}
                        </View>}
                    </View>

                    {/* ================================================= */}
                    {/*                PRODUCT INFORMATION                */}
                    {/* ================================================= */}

                    <View
                        style={[
                            styles.informationProduct,
                            isMobile &&
                            styles.informationProductMobile,
                        ]}
                    >

                        {/* TÊN */}

                        <Text
                            style={[
                                styles.productName,
                                isMobile &&
                                styles.productNameMobile,
                            ]}
                        >
                            {managedProduct?.name ?? (productId ? t("Sản phẩm không tồn tại") : t("iPhone 16e 128GB"))}
                        </Text>

                        {!managedProduct && <Text style={styles.tagline}>
                            {t("The New Standard of Intelligence.")}
                        </Text>}
                        {managedProduct && <Text style={styles.tagline}>{managedProduct.category}</Text>}

                        <View style={styles.voicePanel}>
                            <View style={styles.voicePanelHeading}>
                                <Ionicons name="mic" size={15} color="#a8262d" />
                                <Text style={styles.voicePanelTitle}>{t("GIỌNG NÓI")}</Text>
                                <Ionicons name="chevron-up" size={15} color="#8b8b8b" />
                            </View>
                            <View style={styles.voiceActions}>
                                <Pressable style={styles.voiceAction}>
                                    <Ionicons name="play" size={12} color="#b3242b" />
                                    <Text style={styles.voiceActionText}>{t("Nghe mô tả")}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* GIÁ */}

                        <Text
                            style={[
                                styles.productPrice,
                                isMobile &&
                                styles.productPriceMobile,
                            ]}
                        >
                            {managedProduct ? `${managedProduct.price.toLocaleString("vi-VN")} ` : "16.990.000"} ₫
                        </Text>

                        {/* THÔNG TIN */}

                        <View style={styles.specificationsCard}>
                            <Text style={styles.specificationsTitle}>{t("Thông số nổi bật")}</Text>
                            <View style={styles.specificationsGrid}>
                                {managedProduct ? descriptionLines.map((line, index) => (
                                    <View key={`${managedProduct.id}-${index}`} style={[styles.specificationItem, isMobile && styles.specificationItemMobile]}>
                                        <View style={styles.specificationIcon}>
                                            <Ionicons name={descriptionIcon(line)} size={17} color="#b32b36" />
                                        </View>
                                        <Text style={styles.specificationText}>{line}</Text>
                                    </View>
                                )) : specifications.map(({ icon, label, value }) => (
                                    <View key={label} style={[styles.specificationItem, isMobile && styles.specificationItemMobile]}>
                                        <View style={styles.specificationIcon}>
                                            <Ionicons name={icon} size={17} color="#b32b36" />
                                        </View>
                                        <Text style={styles.specificationText}>
                                            <Text style={styles.infoLabel}>{t(label)}:</Text> {t(value)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            {managedProduct && <View style={styles.productMetaRow}>
                                <Text style={styles.productMetaText}>{t("Danh mục")}: {managedProduct.category}</Text>
                                <Text style={styles.productMetaText}>{t("Tồn kho")}: {managedProduct.stock}</Text>
                            </View>}
                        </View>

                        {/* ================================================= */}
                        {/*                     CHỌN MÀU                     */}
                        {/* ================================================= */}

                        {/* Cập nhật màu đang chọn để làm nổi bật lựa chọn trong danh sách. */}
                        {!managedProduct && <><Text style={styles.optionLabel}>Màu sắc</Text>
                        <View
                            style={[
                                styles.colorContainer,
                                isMobile &&
                                styles.colorContainerMobile,
                            ]}
                        >
                            {colors.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() =>
                                        setSelectedColor(
                                            item.id
                                        )
                                    }
                                    style={[
                                        styles.colorItem,
                                        isMobile &&
                                        styles.colorItemMobile,
                                        selectedColor ===
                                        item.id &&
                                        styles.colorItemActive,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.colorCircle,
                                            isMobile &&
                                            styles.colorCircleMobile,
                                            {
                                                backgroundColor:
                                                    item.color,
                                            },
                                            selectedColor ===
                                            item.id &&
                                            styles.colorCircleActive,
                                        ]}
                                    />

                                    <Text
                                        style={[
                                            styles.colorText,
                                            isMobile &&
                                            styles.colorTextMobile,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* ================================================= */}
                        {/*                  CHỌN DUNG LƯỢNG                */}
                        {/* ================================================= */}

                        {/* Cập nhật dung lượng đang chọn và trạng thái hiển thị của nút. */}
                        <Text style={styles.optionLabel}>Dung lượng</Text>
                        <View
                            style={[
                                styles.capacityContainer,
                                isMobile &&
                                styles.capacityContainerMobile,
                            ]}
                        >
                            {capacities.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() =>
                                        setSelectedCapacity(
                                            item.id
                                        )
                                    }
                                    style={[
                                        styles.capacityItem,
                                        isMobile &&
                                        styles.capacityItemMobile,
                                        selectedCapacity ===
                                        item.id &&
                                        styles.capacityItemActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.capacityText,
                                            isMobile &&
                                            styles.capacityTextMobile,
                                            selectedCapacity ===
                                            item.id &&
                                            styles.capacityTextActive,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View></>}

                        {/* ================================================= */}
                        {/*                    BUTTONS                       */}
                        {/* ================================================= */}

                        <View
                            style={[
                                styles.buyContainer,
                                isMobile &&
                                styles.buyContainerMobile,
                            ]}
                        >
                            {/* Các handler bên dưới hiện là placeholder, chưa gọi API mua hàng/giỏ hàng. */}
                            {/* MUA NGAY */}

                            <Pressable
                                onPress={() =>
                                    console.log(
                                        "Mua ngay"
                                    )
                                }
                                style={({
                                    pressed,
                                }: {
                                    pressed: boolean;
                                }) => [
                                        styles.buyButton,
                                        isMobile &&
                                        styles.buyButtonMobile,
                                        pressed &&
                                        styles.actionButtonPressed,
                                    ]}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        isMobile &&
                                        styles.buttonTextMobile,
                                    ]}
                                >
                                    {t("MUA NGAY")}
                                </Text>
                            </Pressable>

                            {/* THÊM VÀO GIỎ */}

                            <Pressable
                                onPress={() =>
                                    console.log(
                                        "Thêm vào giỏ"
                                    )
                                }
                                style={({
                                    pressed,
                                }: {
                                    pressed: boolean;
                                }) => [
                                        styles.cartButton,
                                        isMobile &&
                                        styles.cartButtonMobile,
                                        pressed &&
                                        styles.actionButtonPressed,
                                    ]}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        isMobile &&
                                        styles.buttonTextMobile,
                                    ]}
                                >
                                    {t("🛒 THÊM VÀO GIỎ")}
                                </Text>
                            </Pressable>

                            {/* YÊU THÍCH */}

                            <Pressable
                                onPress={() =>
                                    console.log(
                                        "Yêu thích"
                                    )
                                }
                                style={({
                                    pressed,
                                }: {
                                    pressed: boolean;
                                }) => [
                                        styles.favoriteButton,
                                        isMobile &&
                                        styles.favoriteButtonMobile,
                                        pressed &&
                                        styles.actionButtonPressed,
                                    ]}
                            >
                                <Text
                                    style={[
                                        styles.favoriteText,
                                        isMobile &&
                                        styles.favoriteTextMobile,
                                    ]}
                                >
                                    ♡
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
                <View style={[styles.productHighlights, isMobile && styles.productHighlightsMobile]}>
                    <View style={[styles.ratingCard, isMobile && styles.highlightCardMobile]}>
                        <View style={styles.highlightHeading}>
                            <View style={[styles.highlightIcon, styles.ratingIcon]}>
                                <Ionicons name="star" size={19} color="#c27a16" />
                            </View>
                            <View style={styles.highlightHeadingCopy}>
                                <Text style={styles.highlightTitle}>{t("Đánh giá sản phẩm")}</Text>
                                <Text style={styles.highlightSubtitle}>{t("Chia sẻ trải nghiệm của bạn")}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingControls}>
                            <View style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Pressable
                                        key={star}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${t("Đánh giá")} ${star} ${t("sao")}`}
                                        accessibilityState={{ selected: selectedRating === star }}
                                        onPress={() => setSelectedRating(star)}
                                        style={({ pressed }) => [styles.ratingStarButton, pressed && styles.ratingStarPressed]}
                                    >
                                        <Ionicons
                                            name={selectedRating >= star ? "star" : "star-outline"}
                                            size={25}
                                            color={selectedRating >= star ? "#e39a27" : "#c78b39"}
                                        />
                                    </Pressable>
                                ))}
                            </View>
                            <Text style={styles.ratingHint}>
                                {selectedRating
                                    ? `${selectedRating}/5 · ${t("Cảm ơn bạn đã đánh giá")}`
                                    : t("Chạm vào sao để đánh giá")}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.deliveryCard, isMobile && styles.highlightCardMobile]}>
                        <View style={styles.highlightHeading}>
                            <View style={[styles.highlightIcon, styles.deliveryIcon]}>
                                <Ionicons name="cube-outline" size={19} color="#a8323d" />
                            </View>
                            <View style={styles.highlightHeadingCopy}>
                                <Text style={styles.highlightTitle}>{t("Thông tin giao hàng")}</Text>
                                <Text style={styles.highlightSubtitle}>{t("Mua sắm an tâm, hỗ trợ tận tình")}</Text>
                            </View>
                        </View>
                        <View style={styles.deliveryBenefits}>
                            {[
                                { icon: "car-outline" as const, title: "Miễn phí giao hàng", detail: "Áp dụng theo điều kiện đơn hàng" },
                                { icon: "shield-checkmark-outline" as const, title: "Bảo hành chính hãng 1 năm", detail: "An tâm trong quá trình sử dụng" },
                                { icon: "card-outline" as const, title: "Thanh toán an toàn", detail: "Bảo mật thông tin thanh toán" },
                            ].map((benefit) => (
                                <View key={benefit.title} style={styles.deliveryBenefit}>
                                    <Ionicons name={benefit.icon} size={18} color="#a8323d" />
                                    <View style={styles.deliveryBenefitCopy}>
                                        <Text style={styles.deliveryBenefitTitle}>{t(benefit.title)}</Text>
                                        <Text style={styles.deliveryBenefitDetail}>{t(benefit.detail)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <AiConsultationWidget onPress={() => router.push("/chat")} />
        </View>
    );
}

/* ================================================= */
/*                     STYLES                        */
/* ================================================= */

const styles = StyleSheet.create({

    /* ================================================= */
    /*                    CONTAINER                      */
    /* ================================================= */

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },

    unavailableContainer: {
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
    },

    unavailableText: {
        color: "#333333",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },

    unavailableButton: {
        backgroundColor: "#c82435",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },

    unavailableButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },

    /* ================================================= */
    /*                  CONTENT SCROLL                   */
    /* ================================================= */

    contentScroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 90,
    },

    scrollContentMobile: {
        paddingBottom: 100,
    },

    /* ================================================= */
    /*                    HEADER                         */
    /* ================================================= */

    header: {
        backgroundColor: "red",
        paddingHorizontal: 25,
        paddingTop: 45,
        paddingBottom: 18,

        flexDirection: "row",

        alignItems: "center",

        gap: 25,

        zIndex: 1000,
        elevation: 10,
    },

    headerMobile: {
        backgroundColor: "red",
        paddingHorizontal: 15,
        paddingTop: 30,
        paddingBottom: 15,

        flexDirection: "column",

        alignItems: "stretch",

        justifyContent: "center",

        gap: 0,

        zIndex: 1000,
        elevation: 10,
    },

    /* ================================================= */
    /*                      LOGO                         */
    /* ================================================= */

    logo: {
        flexDirection: "row",

        alignItems: "center",
    },

    logoMobile: {
        justifyContent: "center",
    },

    logoImage: {
        width: 65,
        height: 65,

        borderRadius: 8,
    },

    logoImageMobile: {
        width: 48,
        height: 48,

        borderRadius: 7,
    },

    logoText: {
        fontSize: 27,

        fontWeight: "700",

        marginLeft: 12,

        color: "#ffffff",
    },

    logoTextMobile: {
        fontSize: 22,

        marginLeft: 9,

        color: "#ffffff",
    },

    /* ================================================= */
    /*                    SEARCH BAR                     */
    /* ================================================= */

    searchBar: {
        flex: 1,
        height: 48,

        flexDirection: "row",

        alignItems: "center",

        backgroundColor: "#ffffff",

        borderRadius: 30,

        overflow: "hidden",

        paddingLeft: 5,
    },

    searchBarMobile: {
        width: "100%",
        height: 44,

        marginTop: 15,

        paddingLeft: 5,
    },

    /* ================================================= */
    /*                   SEARCH INPUT                    */
    /* ================================================= */

    searchInput: {
        flex: 1,

        height: "100%",

        paddingHorizontal: 15,

        fontSize: 14,

        color: "#333",

        outlineStyle: "none" as any,
    },

    searchInputMobile: {
        paddingHorizontal: 12,

        fontSize: 13,
    },

    /* ================================================= */
    /*                  SEARCH BUTTON                   */
    /* ================================================= */

    searchButton: {
        width: 42,
        height: 42,

        marginRight: 3,

        borderRadius: 21,

        backgroundColor: "red",

        justifyContent: "center",

        alignItems: "center",
    },

    searchButtonMobile: {
        width: 38,

        height: 38,

        borderRadius: 20,
    },

    /* ================================================= */
    /*                 CUSTOMER ICONS                    */
    /* ================================================= */

    customerIcons: {
        flexDirection: "row",

        alignItems: "center",

        gap: 25,
    },

    customerIconsMobile: {
        flexDirection: "row",

        justifyContent: "space-around",

        width: "100%",

        marginTop: 15,

        gap: 0,
    },

    /* ================================================= */
    /*                HEADER BUTTON                      */
    /* ================================================= */

    headerButtonContainer: {
        alignItems: "center",
    },

    headerButtonContainerMobile: {
        alignItems: "center",
    },

    headerButtonContainerHover: {
        transform: [
            {
                scale: 1.05,
            },
        ],
    },

    headerButton: {
        width: 50,

        height: 40,

        borderRadius: 25,

        backgroundColor: "transparent",

        justifyContent: "center",

        alignItems: "center",
    },

    headerButtonMobile: {
        width: 42,

        height: 36,

        borderRadius: 20,

        backgroundColor: "transparent",

        justifyContent: "center",

        alignItems: "center",
    },

    headerButtonHover: {
        backgroundColor: "#ffffff",

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 5,
        },

        shadowOpacity: 0.2,

        shadowRadius: 7,

        elevation: 5,
    },

    headerButtonText: {
        fontSize: 12,

        marginTop: 3,

        color: "#ffffff",

        fontWeight: "500",
    },

    headerButtonTextMobile: {
        fontSize: 10,

        marginTop: 2,

        color: "#ffffff",
    },

    /* ================================================= */
    /*                 COMMON HOVER                     */
    /* ================================================= */

    buttonHover: {
        transform: [
            {
                scale: 1.05,
            },
        ],

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 5,
        },

        shadowOpacity: 0.2,

        shadowRadius: 7,

        elevation: 5,
    },

    /* ================================================= */
    /*                 PRODUCT DETAIL                   */
    /* ================================================= */

    productDetail: {
        flexDirection: "row",
        gap: 32,
        width: 1040,

        maxWidth: "95%",

        alignSelf: "center",

        marginTop: 32,
        padding: 26,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#eeeeee",
        borderRadius: 16,
        shadowColor: "#272727",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 3,

        alignItems: "center",

        justifyContent: "center",
    },

    productDetailMobile: {
        flexDirection: "column",

        gap: 10,

        width: "94%",

        maxWidth: "100%",

        alignSelf: "center",

        marginTop: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#eeeeee",
        borderRadius: 14,

        alignItems: "stretch",

        justifyContent: "center",
    },

    productHighlights: {
        width: 1040,
        maxWidth: "95%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "stretch",
        gap: 16,
        marginTop: 16,
        marginBottom: 30,
    },

    productHighlightsMobile: {
        width: "94%",
        maxWidth: "100%",
        flexDirection: "column",
        gap: 12,
        marginTop: 12,
        marginBottom: 24,
    },

    ratingCard: {
        flex: 0.85,
        minWidth: 250,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f0e7d9",
        backgroundColor: "#fffdf9",
        shadowColor: "#302313",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },

    deliveryCard: {
        flex: 1.15,
        minWidth: 300,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f2dfe0",
        backgroundColor: "#fff9f8",
        shadowColor: "#381a1b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },

    highlightCardMobile: {
        width: "100%",
        minWidth: 0,
        flex: 0,
        padding: 16,
    },

    highlightHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
    },

    highlightIcon: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
    },

    ratingIcon: { backgroundColor: "#fff2d9" },

    deliveryIcon: { backgroundColor: "#fce8e8" },

    highlightHeadingCopy: { flex: 1, minWidth: 0, gap: 3 },

    highlightTitle: { color: "#252525", fontSize: 15, fontWeight: "700" },

    highlightSubtitle: { color: "#77716c", fontSize: 12, lineHeight: 17 },

    ratingControls: {
        marginTop: 18,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#f1eadf",
        gap: 9,
    },

    ratingStars: { flexDirection: "row", alignItems: "center", gap: 7 },

    ratingStarButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: "#fff5e4",
    },

    ratingStarPressed: { transform: [{ scale: 0.92 }], backgroundColor: "#ffebc7" },

    ratingHint: { color: "#756b60", fontSize: 12, lineHeight: 18 },

    deliveryBenefits: { marginTop: 14, gap: 12 },

    deliveryBenefit: { flexDirection: "row", alignItems: "center", gap: 11 },

    deliveryBenefitCopy: { flex: 1, minWidth: 0, gap: 2 },

    deliveryBenefitTitle: { color: "#332729", fontSize: 13, fontWeight: "700" },

    deliveryBenefitDetail: { color: "#796c6c", fontSize: 11, lineHeight: 16 },

    /* ================================================= */
    /*                 PRODUCT IMAGES                    */
    /* ================================================= */

    productImages: {
        width: "49%",

        textAlign: "left" as any,
    },

    productImagesMobile: {
        width: "100%",
    },

    /* ================================================= */
    /*                    MAIN IMAGE                     */
    /* ================================================= */

    mainImage: {
        position: "relative",

        width: "100%",

        height: 440,

        backgroundColor: "#F7F7F7",

        borderRadius: 12,

        overflow: "hidden",

        borderWidth: 1,

        borderColor: "#EEEEEE",

        alignItems: "center",

        justifyContent: "center",
    },

    mainImageMobile: {
        height: 300,

        borderRadius: 10,
    },

    mainProductImage: {
        width: "80%",

        height: "80%",

        resizeMode: "contain",
    },

    mainProductImageMobile: {
        width: "85%",

        height: "85%",
    },

    /* ================================================= */
    /*                 THUMBNAILS                        */
    /* ================================================= */

    thumbnailList: {
        flexDirection: "row",

        gap: 8,

        marginTop: 8,

        flexWrap: "wrap",
    },

    thumbnailListMobile: {
        gap: 8,

        marginTop: 10,

        justifyContent: "center",
    },

    thumbnail: {
        width: 56,

        height: 56,

        borderWidth: 1,

        borderColor: "#DDDDDD",

        borderRadius: 10,

        backgroundColor: "white",

        overflow: "hidden",

        alignItems: "center",

        justifyContent: "center",
    },

    thumbnailMobile: {
        width: 55,

        height: 55,

        borderRadius: 8,
    },

    thumbnailActive: {
        borderWidth: 2,

        borderColor: "red",
    },

    thumbnailImage: {
        width: "100%",

        height: "100%",

        resizeMode: "contain",
    },

    /* ================================================= */
    /*              INFORMATION PRODUCT                  */
    /* ================================================= */

    informationProduct: {
        flex: 1,
        minWidth: 0,
        padding: 0,
    },

    informationProductMobile: {
        width: "100%",

        flex: 0,

        padding: 10,
    },

    tagline: {
        color: "#414141",
        fontSize: 15,
        marginTop: 1,
        marginBottom: 5,
    },

    managedProductImage: {
        backgroundColor: "#f7f8fb",
        borderColor: "#eceef3",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },

    voicePanel: {
        backgroundColor: "#f5f5f7",
        borderRadius: 9,
        paddingHorizontal: 8,
        paddingVertical: 7,
        marginBottom: 5,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },

    voicePanelHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 5,
    },

    voicePanelTitle: { flex: 1, color: "#282828", fontSize: 11, fontWeight: "700" },

    voiceActions: { flexDirection: "row", alignItems: "center", gap: 4 },

    voiceAction: {
        flex: 1,
        minHeight: 23,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingHorizontal: 3,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },

    voiceActionText: { color: "#333333", fontSize: 10, fontWeight: "500" },

    optionLabel: { color: "#333333", fontSize: 13, fontWeight: "600", marginTop: 8 },

    productName: {
        fontSize: 38,

        fontWeight: "bold",

        color: "#a85655",

        margin: 0,
    },

    productNameMobile: {
        fontSize: 27,

        lineHeight: 34,
    },

    productPrice: {
        fontSize: 32,

        color: "red",

        fontWeight: "bold",

        marginTop: 8,

        marginBottom: 6,
    },

    productPriceMobile: {
        fontSize: 26,

        marginTop: 12,

        marginBottom: 8,
    },

    /* ================================================= */
    /*                   INFORMATION                     */
    /* ================================================= */

    infoProduct: {
        gap: 5,
    },

    infoProductMobile: {
        gap: 5,
    },

    specificationsCard: {
        marginTop: 10,
        padding: 16,
        backgroundColor: "#fafafa",
        borderWidth: 1,
        borderColor: "#ededed",
        borderRadius: 12,
    },

    specificationsTitle: {
        color: "#292929",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
    },

    specificationsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: 14,
        rowGap: 8,
    },

    specificationItem: {
        width: "48%",
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#e9e9e9",
    },

    specificationItemMobile: {
        width: "100%",
    },

    specificationIcon: {
        width: 32,
        height: 32,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff0f1",
        borderRadius: 9,
    },

    specificationText: {
        flex: 1,
        color: "#383838",
        fontSize: 14,
        lineHeight: 20,
    },

    productMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },

    productMetaText: {
        color: "#666666",
        backgroundColor: "#f1f1f1",
        borderRadius: 14,
        overflow: "hidden",
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontSize: 12,
    },

    infoRow: { flexDirection: "row", alignItems: "center", gap: 5 },

    infoLabel: { fontWeight: "600" },

    infoText: {
        fontSize: 14,

        color: "#333333",
    },

    infoTextMobile: {
        fontSize: 14,
    },

    /* ================================================= */
    /*                    COLOR                          */
    /* ================================================= */

    colorContainer: {
        flexDirection: "row",

        gap: 6,

        marginTop: 6,

        flexWrap: "wrap",
    },

    colorContainerMobile: {
        gap: 8,

        marginTop: 5,
    },

    colorItem: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        gap: 5,

        paddingVertical: 4,

        paddingHorizontal: 8,

        backgroundColor: "white",

        borderWidth: 1,

        borderColor: "#DDDDDD",

        borderRadius: 10,
    },

    colorItemMobile: {
        paddingVertical: 8,

        paddingHorizontal: 11,

        gap: 7,

        borderRadius: 8,
    },

    colorItemActive: {
        borderWidth: 2,

        borderColor: "red",
    },

    colorCircle: {
        width: 12,

        height: 12,

        borderRadius: 50,

        borderWidth: 1,

        borderColor: "#CCCCCC",
    },

    colorCircleMobile: {
        width: 16,

        height: 16,

        borderRadius: 8,
    },

    colorCircleActive: {
        borderWidth: 3,

        borderColor: "#E51B23",

        shadowColor: "#000000",

        shadowOffset: {
            width: 0,

            height: 0,
        },

        shadowOpacity: 0.15,

        shadowRadius: 2,

        elevation: 2,
    },

    colorText: {
        fontSize: 13,

        color: "#000000",
    },

    colorTextMobile: {
        fontSize: 14,
    },

    /* ================================================= */
    /*                  CAPACITY                         */
    /* ================================================= */

    capacityContainer: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "flex-start",

        gap: 6,

        marginTop: 3,
    },

    capacityContainerMobile: {
        gap: 8,

        marginTop: 12,
    },

    capacityItem: {
        minWidth: 52,

        paddingVertical: 5,
        paddingHorizontal: 8,

        alignItems: "center",

        justifyContent: "center",

        borderWidth: 1,

        borderColor: "#d4d4d4",

        borderRadius: 5,

        backgroundColor: "white",
    },

    capacityItemMobile: {
        width: 80,

        paddingVertical: 7,

        borderRadius: 5,
    },

    capacityItemActive: {
        borderColor: "red",
    },

    capacityText: {
        fontSize: 13,

        color: "black",
    },

    capacityTextMobile: {
        fontSize: 14,
    },

    capacityTextActive: {
        color: "red",

        fontWeight: "bold",
    },

    /* ================================================= */
    /*                 BUY CONTAINER                     */
    /* ================================================= */

    buyContainer: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "flex-start",

        gap: 6,

        marginTop: 9,
    },

    buyContainerMobile: {
        flexDirection: "row",

        flexWrap: "wrap",

        gap: 8,

        marginTop: 18,
    },

    buyButton: {
        flex: 1,

        paddingVertical: 9,

        borderRadius: 5,

        backgroundColor: "red",

        alignItems: "center",

        justifyContent: "center",
    },

    buyButtonMobile: {
        flex: 1,

        minWidth: 125,

        paddingVertical: 13,

        borderRadius: 5,
    },

    cartButton: {
        flex: 1,

        paddingVertical: 9,

        borderRadius: 5,

        backgroundColor: "red",

        alignItems: "center",

        justifyContent: "center",
    },

    cartButtonMobile: {
        flex: 1,

        minWidth: 155,

        paddingVertical: 13,

        borderRadius: 5,
    },

    favoriteButton: {
        width: 32,

        height: 34,

        borderRadius: 5,

        backgroundColor: "red",

        alignItems: "center",

        justifyContent: "center",
    },

    favoriteButtonMobile: {
        width: 48,

        height: 48,

        borderRadius: 5,
    },

    /* ================================================= */
    /*                 BUTTON TEXT                       */
    /* ================================================= */

    buttonText: {
        color: "white",

        fontFamily: "Times New Roman",

        fontWeight: "bold",

        fontSize: 11,
    },

    buttonTextMobile: {
        fontSize: 13,
    },

    favoriteText: {
        color: "white",

        fontSize: 30,

        fontWeight: "bold",
    },

    favoriteTextMobile: {
        fontSize: 26,
    },

    /* ================================================= */
    /*                 PRESS EFFECT                      */
    /* ================================================= */

    actionButtonPressed: {
        transform: [{ scale: 0.95 }],

        opacity: 0.85,
    },
});
