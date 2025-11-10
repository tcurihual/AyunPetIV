import React, { useEffect, useRef } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Animated,
    Image,
    Switch,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { Colors } from "@/constants/Colors"
import { useTheme } from "@/context/ThemeContext"

const { width } = Dimensions.get("window")

type DropdownMenuProps = {
    onClose: () => void
}

export default function DropdownMenu({ onClose }: DropdownMenuProps) {
    const router = useRouter()
    const { user, signOut } = useAuthContext()
    const slideAnim = useRef(new Animated.Value(-width * 0.7)).current

    // 4. Usar el hook de Tema y obtener los colores
    const { theme, setTheme } = useTheme()
    const themeColors = Colors[theme]

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }, [])

    const handleClose = (callback?: () => void) => {
        Animated.timing(slideAnim, {
            toValue: -width * 0.7,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            onClose()
            if (callback) callback()
        })
    }

    const handleProfileRedirect = () => {
        handleClose(() => {
            requestAnimationFrame(() => {
                if (user?.role === 21 || user?.role === 22) {
                    router.navigate("/(shelter)/my-profile")
                } else {
                    router.navigate("/(home)/my-profile")
                }
            })
        })
    }

    const handleNavigate = (path: string) => {
        handleClose(() => {
            requestAnimationFrame(() => {
                // Para vistas comunes (settings, about, help), redirigir según el rol
                const commonViews = ["/settings", "/about", "/help"]
                const pathSegment = path.split("/").pop() || ""

                if (commonViews.some((view) => pathSegment === view.slice(1))) {
                    if (user?.role === 21 || user?.role === 22) {
                        router.navigate(`/(shelter)/${pathSegment}` as any)
                    } else {
                        router.navigate(path as any)
                    }
                } else {
                    router.navigate(path as any)
                }
            })
        })
    }

    return (
        <TouchableWithoutFeedback onPress={() => handleClose()}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            styles.menu,
                            {
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: themeColors.card, // 5. Aplicar color de fondo
                            },
                        ]}
                    >
                        {/* 6. Aplicar color de 'tint' (mostaza) */}
                        <View style={[styles.headerBar, { backgroundColor: themeColors.tint }]}>
                            <Image
                                source={require("@/assets/images/Ayun-pet-Logo.png")}
                                style={styles.logo}
                            />
                        </View>

                        {/* 7. Aplicar colores de texto dinámicos */}
                        <View style={styles.profileSection}>
                            <Ionicons
                                name="person-circle-outline"
                                size={64}
                                color={themeColors.text} // Color de texto
                            />
                            <Text style={[styles.name, { color: themeColors.text }]}>
                                {user?.name || "Usuario"}
                            </Text>
                            <Text style={[styles.email, { color: themeColors.navIconInactive }]}>
                                {user?.email || "usuario@email.com"}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.item} onPress={handleProfileRedirect}>
                            <Ionicons
                                name="person-outline"
                                size={22}
                                color={themeColors.text} // Color de texto
                            />
                            <Text style={[styles.text, { color: themeColors.text }]}>
                                Mi Perfil
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/(home)/settings")}
                        >
                            <Ionicons
                                name="settings-outline"
                                size={22}
                                color={themeColors.text} // Color de texto
                            />
                            <Text style={[styles.text, { color: themeColors.text }]}>
                                Configuración
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/(home)/about")}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={22}
                                color={themeColors.text} // Color de texto
                            />
                            <Text style={[styles.text, { color: themeColors.text }]}>
                                Sobre Ayün Pet
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/(home)/help")}
                        >
                            <Ionicons
                                name="help-circle-outline"
                                size={22}
                                color={themeColors.text} // Color de texto
                            />
                            <Text style={[styles.text, { color: themeColors.text }]}>
                                Preguntas Frecuentes
                            </Text>
                        </TouchableOpacity>

                        {/* --- 8. EL NUEVO BOTÓN DE MODO OSCURO --- */}
                        <View style={[styles.item, styles.switchItem]}>
                            <Ionicons
                                name="contrast-outline"
                                size={22}
                                color={themeColors.text} // Color de texto
                            />
                            <Text style={[styles.text, { color: themeColors.text }]}>
                                Modo Oscuro
                            </Text>
                            <Switch
                                value={theme === "dark"}
                                onValueChange={(isDark) => setTheme(isDark ? "dark" : "light")}
                                trackColor={{
                                    false: themeColors.tabIconDefault,
                                    true: themeColors.tint,
                                }}
                                thumbColor={themeColors.card}
                            />
                        </View>
                        {/* --- FIN DEL CAMBIO --- */}

                        <TouchableOpacity
                            style={[
                                styles.item,
                                styles.logout,
                                { borderTopColor: themeColors.background }, // 9. Borde dinámico
                            ]}
                            onPress={async () => {
                                await signOut()
                            }}
                        >
                            <Ionicons name="log-out-outline" size={22} color="red" />
                            <Text style={[styles.text, { color: "red" }]}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    )
}

// 10. Quitar colores fijos del StyleSheet
const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        flexDirection: "row",
    },
    menu: {
        width: width * 0.7,
        // backgroundColor: "#fff", // <-- Quitado
        height: "100%",
    },
    headerBar: {
        width: "100%",
        height: 120,
        // backgroundColor: "#FFD24C", // <-- Quitado
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 120,
        height: 40,
        resizeMode: "contain",
    },
    profileSection: {
        alignItems: "center",
        marginVertical: 20,
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 10,
    },
    email: {
        fontSize: 12,
        // color: "#666", // <-- Quitado
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    // Estilo nuevo para el item del Switch
    switchItem: {
        justifyContent: "space-between",
    },
    text: {
        marginLeft: 15,
        fontSize: 15,
        flex: 1, // Para que el Switch se vaya al final
    },
    logout: {
        marginTop: 20,
        borderTopWidth: 1,
        // borderTopColor: "#eee", // <-- Quitado
    },
})
