import React from "react"
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Text,
    useColorScheme, // 1. Importar hook
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { Colors } from "@/constants/Colors" // 2. Importar { Colors }
import BackButton from "@common/BackButton"

const { width } = Dimensions.get("window")

type HeaderProps = {
    onMenuPress?: () => void
}

export default function Header({ onMenuPress }: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname().toLowerCase()
    const { user } = useAuthContext()

    // 3. Obtener el tema actual
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    const defaultAvatar = "https://randomuser.me/api/portraits/women/44.jpg"
    const userAvatar = user?.avatar || defaultAvatar

    const handleProfilePress = () => {
        const target =
            user?.role === 21 || user?.role === 22 ? "/(shelter)/my-profile" : "/(home)/my-profile"

        if (pathname === target) return

        router.push(target)
    }

    const showBack =
        pathname.includes("my-profile") ||
        pathname.includes("request") ||
        pathname.includes("detail") ||
        pathname.includes("message")

    return (
        // 4. Aplicar el color de fondo 'tint' (mostaza)
        <View style={[styles.container, { backgroundColor: themeColors.tint }]}>
            {/* Izquierda: menú o back */}
            <View style={styles.leftContainer}>
                {showBack ? (
                    <BackButton
                        floating={false}
                        style={{
                            // 5. Aplicar el color 'card' para el fondo del botón
                            backgroundColor: themeColors.card,
                            borderRadius: width * 0.06,
                            padding: width * 0.02,
                            elevation: 3,
                            marginLeft: -4,
                        }}
                    />
                ) : (
                    <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                        {/* 6. Color de icono fijo (negro) para contrastar con fondo 'tint' */}
                        <Ionicons name="menu" size={width * 0.07} color="#000" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Centro: logo */}
            <View style={styles.centerContainer}>
                <Image source={require("@/assets/images/Ayun-pet-Logo.png")} style={styles.logo} />
            </View>

            {/* Derecha: perfil */}
            <View style={styles.rightContainer}>
                {/* 7. Aplicar color de fallback 'tabIconDefault' (gris) */}
                <TouchableOpacity
                    style={[styles.profileCircle, { backgroundColor: themeColors.tabIconDefault }]}
                    onPress={handleProfilePress}
                >
                    <Image source={{ uri: userAvatar }} style={styles.profileImage} />
                    {!user && (
                        <View style={styles.noUserIndicator}>
                            <Text style={styles.noUserText}>?</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

// 8. Quitar colores fijos del StyleSheet
const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // backgroundColor: Colors.yellow, // <-- Quitado (se aplica inline)
        paddingHorizontal: width * 0.05,
        paddingVertical: width * 0.02,
    },
    leftContainer: {
        flex: 0.4,
        alignItems: "flex-start",
    },
    centerContainer: {
        flex: 1.2,
        alignItems: "center",
        justifyContent: "center",
    },
    rightContainer: {
        flex: 0.4,
        alignItems: "flex-end",
    },
    iconButton: { padding: 5 },
    logo: {
        width: width * 0.35,
        height: width * 0.15,
        resizeMode: "contain",
    },
    profileCircle: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: (width * 0.12) / 2,
        overflow: "hidden",
        // backgroundColor: "#e60000ff", // <-- Quitado (fallback rojo)
        alignItems: "center",
        justifyContent: "center",
    },
    profileImage: { width: "100%", height: "100%", resizeMode: "cover" },
    noUserIndicator: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Overlay oscuro se mantiene
        justifyContent: "center",
        alignItems: "center",
    },
    noUserText: {
        color: "#fff", // Texto blanco sobre overlay oscuro se mantiene
        fontSize: width * 0.04,
        fontWeight: "bold",
    },
})
