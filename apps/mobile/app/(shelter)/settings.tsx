import React, { useState } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"
import { userService } from "@/services/user"

export default function SettingsScreen() {
    const router = useRouter()
    const { signOut, user } = useAuthContext()
    const { theme, setTheme } = useTheme()
    const themeColors = Colors[theme]

    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = () => {
        Alert.alert(
            "Eliminar cuenta",
            "¿Estás seguro? Esta acción eliminará permanentemente tu cuenta y todos tus datos.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsDeleting(true)
                            await userService.deleteMe()
                            await signOut(true)
                            router.replace("/(auth)/(login)/")
                        } catch (error) {
                            console.error("Error al eliminar cuenta:", error)
                            Alert.alert(
                                "Error",
                                "No se pudo eliminar la cuenta. Intenta nuevamente más tarde."
                            )
                        } finally {
                            setIsDeleting(false)
                        }
                    },
                },
            ]
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={26} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Configuración</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* Opciones */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: themeColors.navIconInactive }]}>
                    Apariencia
                </Text>
                <View style={styles.item}>
                    <Ionicons name="contrast-outline" size={22} color={themeColors.text} />
                    <Text style={[styles.text, { color: themeColors.text }]}>Modo oscuro</Text>
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
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: themeColors.navIconInactive }]}>
                    Cuenta
                </Text>

                <TouchableOpacity style={styles.item} onPress={async () => await signOut(true)}>
                    <Ionicons name="log-out-outline" size={22} color="red" />
                    <Text style={[styles.text, { color: "red" }]}>Cerrar sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.item}
                    onPress={handleDeleteAccount}
                    disabled={isDeleting}
                >
                    <Ionicons
                        name="trash-outline"
                        size={22}
                        color={isDeleting ? themeColors.navIconInactive : "red"}
                    />
                    <Text
                        style={[
                            styles.text,
                            { color: isDeleting ? themeColors.navIconInactive : "red" },
                        ]}
                    >
                        {isDeleting ? "Eliminando cuenta..." : "Eliminar cuenta"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.footer, { color: themeColors.navIconInactive }]}>
                Sesión iniciada como {user?.email}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ccc",
    },
    text: {
        flex: 1,
        marginLeft: 15,
        fontSize: 15,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        fontSize: 12,
    },
})
