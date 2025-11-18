import React, { useState, useEffect } from "react"
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
import { userService } from "@/services/user"

const { width } = Dimensions.get("window")

type HeaderProps = {
    onMenuPress?: () => void
}

export default function Header({ onMenuPress }: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname().toLowerCase()
    const { user } = useAuthContext()
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)

    // 3. Obtener el tema actual
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    // Placeholder local para foto de perfil
    const placeholderImage = require("@images/pp_placeholder.png")

    // Cargar foto de perfil cuando el usuario cambie
    useEffect(() => {
        let mounted = true

        const loadProfilePicture = async () => {
            if (!user?.id) return
            try {
                const url = await userService.getProfilePicture(user.id)

                // 🔒 Evitar actualizar si el valor no cambió o el componente ya se desmontó
                if (!mounted) return
                setProfilePictureUrl((prev) => (prev === url ? prev : url))
            } catch (error) {
                console.log(`No profile picture found for user ${user?.id}`)
                if (mounted) setProfilePictureUrl(null)
            }
        }

        loadProfilePicture()
        return () => {
            mounted = false
        }
    }, [user?.id])

    // Determinar qué imagen mostrar
    const getUserAvatarSource = () => {
        // Si hay foto de perfil del servidor, usar esa
        if (profilePictureUrl) {
            return { uri: profilePictureUrl }
        }
        // Si hay avatar en el contexto y no es la URL de randomuser, usar esa
        if (user?.avatar && !user.avatar.includes("randomuser.me")) {
            return { uri: user.avatar }
        }
        // Sino, usar el placeholder local
        return placeholderImage
    }

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
                        {/* Icono de menú siempre negro sobre fondo amarillo */}
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
                    <Image source={getUserAvatarSource()} style={styles.profileImage} />
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
