// app/(home)/_layout.tsx
import React from "react"
import { View, StyleSheet } from "react-native"
import { Slot, usePathname, router } from "expo-router"
import BottomNavbar from "@/components/BottomNavbar"

export default function HomeLayout() {
    const pathname = usePathname()

    // Detectar pestaña activa según la ruta actual
    let activeTab = "home"
    if (pathname.includes("perfil")) activeTab = "perfil"
    if (pathname.includes("camara")) activeTab = "camara"

    return (
        <View style={styles.container}>
            {/* Aquí se renderiza la pantalla correspondiente (index, perfil, camara, etc.) */}
            <Slot />

            {/* Barra inferior global */}
            <BottomNavbar
                activeTab={activeTab}
                onTabPress={(tab) => {
                    if (tab === "home") router.replace("/(home)")
                    if (tab === "perfil") router.push("/(home)/perfil")
                    if (tab === "camara") router.push("../camara")
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
