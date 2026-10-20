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
import { useRouter } from "expo-router";
import { LanguageSelector } from "@/Core/components/language-selector";

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

/* ================================================= */
/*                     APP                           */
/* ================================================= */

export default function ProductDetail() {
    const router = useRouter();

    const { width } = useWindowDimensions();

    // Dùng cùng ngưỡng 600px để chuyển bố cục và style sang phiên bản điện thoại.
    const isMobile = width < 600;

    /* ================================================= */
    /*                     STATE                         */
    /* ================================================= */

    // Lưu lựa chọn hiện tại để cập nhật ảnh chính và trạng thái được chọn trong giao diện.
    const [selectedColor, setSelectedColor] = useState(1);
    const [selectedCapacity, setSelectedCapacity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

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
            name: "Trắng",
            color: "#FFFFFF",
        },
        {
            id: 2,
            name: "Đen",
            color: "#000000",
        },
        {
            id: 3,
            name: "Xanh",
            color: "#0000FF",
        },
        {
            id: 4,
            name: "Tím",
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

                {/* ================================================= */}
                {/*                      SEARCH                       */}
                {/* ================================================= */}

                <View
                    style={[
                        styles.searchBar,
                        isMobile &&
                        styles.searchBarMobile,
                    ]}
                >
                    <TextInput
                        placeholder="Tìm kiếm sản phẩm"
                        placeholderTextColor="#888"
                        style={[
                            styles.searchInput,
                            isMobile &&
                            styles.searchInputMobile,
                        ]}
                    />

                    <HoverButton
                        style={[
                            styles.searchButton,
                            isMobile &&
                            styles.searchButtonMobile,
                        ]}
                        hoverStyle={styles.buttonHover}
                    >
                        <FontAwesome6
                            name="magnifying-glass"
                            size={isMobile ? 16 : 18}
                            color="#ffffff"
                        />
                    </HoverButton>
                </View>

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
                        text="Giỏ hàng"
                        onPress={() => router.push("/cart")}
                        isMobile={isMobile}
                    />

                    {/* Đơn hàng */}

                    <HeaderButton
                        icon="box"
                        text="Đơn hàng"
                        onPress={() => router.push("/orders")}
                        isMobile={isMobile}
                    />

                    {/* Tài khoản */}

                    <HeaderButton
                        icon="user"
                        text="Tài khoản"
                        onPress={() => router.push("/account")}
                        isMobile={isMobile}
                    />
                </View>
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

                        <View
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
                        </View>

                        {/* THUMBNAIL */}

                        <View
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
                        </View>
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
                            iPhone 16e 128GB
                        </Text>

                        {/* GIÁ */}

                        <Text
                            style={[
                                styles.productPrice,
                                isMobile &&
                                styles.productPriceMobile,
                            ]}
                        >
                            16.990.000 ₫
                        </Text>

                        {/* THÔNG TIN */}

                        <View
                            style={[
                                styles.infoProduct,
                                isMobile &&
                                styles.infoProductMobile,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.infoText,
                                    isMobile &&
                                    styles.infoTextMobile,
                                ]}
                            >
                                Màn hình 6.1{'"'}
                            </Text>

                            <Text
                                style={[
                                    styles.infoText,
                                    isMobile &&
                                    styles.infoTextMobile,
                                ]}
                            >
                                Chip A18
                            </Text>

                            <Text
                                style={[
                                    styles.infoText,
                                    isMobile &&
                                    styles.infoTextMobile,
                                ]}
                            >
                                Camera 48MP
                            </Text>

                            <Text
                                style={[
                                    styles.infoText,
                                    isMobile &&
                                    styles.infoTextMobile,
                                ]}
                            >
                                Pin 4820 mAh
                            </Text>
                        </View>

                        {/* ================================================= */}
                        {/*                     CHỌN MÀU                     */}
                        {/* ================================================= */}

                        {/* Cập nhật màu đang chọn để làm nổi bật lựa chọn trong danh sách. */}
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
                        </View>

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
                                    MUA NGAY
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
                                    🛒 THÊM VÀO GIỎ
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
            </ScrollView>
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

    /* ================================================= */
    /*                  CONTENT SCROLL                   */
    /* ================================================= */

    contentScroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 40,
    },

    scrollContentMobile: {
        paddingBottom: 25,
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

        gap: 60,

        width: 1300,

        maxWidth: "95%",

        alignSelf: "center",

        marginTop: 50,

        padding: 20,

        borderWidth: 1,

        borderColor: "black",

        borderRadius: 15,

        alignItems: "center",

        justifyContent: "center",
    },

    productDetailMobile: {
        flexDirection: "column",

        gap: 10,

        width: "94%",

        maxWidth: "100%",

        alignSelf: "center",

        marginTop: 15,

        padding: 10,

        borderWidth: 1,

        borderColor: "black",

        borderRadius: 12,

        alignItems: "stretch",

        justifyContent: "center",
    },

    /* ================================================= */
    /*                 PRODUCT IMAGES                    */
    /* ================================================= */

    productImages: {
        width: 550,

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

        height: 500,

        backgroundColor: "#F7F7F7",

        borderRadius: 12,

        overflow: "hidden",

        borderWidth: 1,

        borderColor: "#EEEEEE",

        alignItems: "center",

        justifyContent: "center",
    },

    mainImageMobile: {
        height: 320,

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

        gap: 15,

        marginTop: 15,

        flexWrap: "wrap",
    },

    thumbnailListMobile: {
        gap: 8,

        marginTop: 10,

        justifyContent: "center",
    },

    thumbnail: {
        width: 90,

        height: 90,

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
        width: 550,

        padding: 20,
    },

    informationProductMobile: {
        width: "100%",

        flex: 0,

        padding: 10,
    },

    productName: {
        fontSize: 42,

        fontWeight: "bold",

        color: "#000000",

        margin: 0,
    },

    productNameMobile: {
        fontSize: 28,

        lineHeight: 34,
    },

    productPrice: {
        fontSize: 45,

        color: "red",

        fontWeight: "bold",

        marginTop: 20,

        marginBottom: 20,
    },

    productPriceMobile: {
        fontSize: 28,

        marginTop: 12,

        marginBottom: 15,
    },

    /* ================================================= */
    /*                   INFORMATION                     */
    /* ================================================= */

    infoProduct: {
        gap: 10,
    },

    infoProductMobile: {
        gap: 7,
    },

    infoText: {
        fontSize: 18,

        color: "#333333",
    },

    infoTextMobile: {
        fontSize: 15,
    },

    /* ================================================= */
    /*                    COLOR                          */
    /* ================================================= */

    colorContainer: {
        flexDirection: "row",

        gap: 15,

        marginTop: 20,

        flexWrap: "wrap",
    },

    colorContainerMobile: {
        gap: 8,

        marginTop: 18,
    },

    colorItem: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        gap: 10,

        paddingVertical: 10,

        paddingHorizontal: 15,

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
        width: 18,

        height: 18,

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
        fontSize: 15,

        color: "#000000",
    },

    colorTextMobile: {
        fontSize: 13,
    },

    /* ================================================= */
    /*                  CAPACITY                         */
    /* ================================================= */

    capacityContainer: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "flex-start",

        gap: 10,

        marginTop: 10,
    },

    capacityContainerMobile: {
        gap: 8,

        marginTop: 12,
    },

    capacityItem: {
        width: 90,

        paddingVertical: 7,

        alignItems: "center",

        justifyContent: "center",

        borderWidth: 2,

        borderColor: "black",

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
        fontSize: 15,

        color: "black",
    },

    capacityTextMobile: {
        fontSize: 13,
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

        gap: 10,

        marginTop: 10,
    },

    buyContainerMobile: {
        flexDirection: "row",

        flexWrap: "wrap",

        gap: 8,

        marginTop: 18,
    },

    buyButton: {
        width: 250,

        paddingVertical: 15,

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
        width: 250,

        paddingVertical: 15,

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
        width: 60,

        height: 52,

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

        fontSize: 16,
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