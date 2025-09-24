import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { Slot, usePathname, router } from "expo-router"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import BackButton from "@common/BackButton"
import DropdownMenu from "@common/DropdownMenu"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeLayout() {
    const pathname = usePathname()
    const [menuVisible, setMenuVisible] = useState(false)

    // Detectar pestaña activa según la ruta actual
    let activeTab = "home"
    if (pathname.includes("/profile")) activeTab = "perfil"
    if (pathname.includes("/camera")) activeTab = "camara"
    if (pathname.includes("/(requests)/requestList")) activeTab = "requests"

    const showBackButton = pathname !== "/"

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="inverted" />


            <Header onMenuPress={() => setMenuVisible(true)} />

            <Slot />

            {showBackButton && <BackButton />}

            <BottomNavbar
                activeTab={activeTab}
                onTabPress={(tab) => {
                    if (tab === "home") return router.replace("/")
                    if (tab === "camera") return router.push("/camera")
                    if (tab === "requests") return router.push("/(requests)/requestList")
                    if (tab === "perfil") return router.push("/profile")
                    if (tab === "add") return router.push("/AddPetScreen")
                }}
            />
            {menuVisible && <DropdownMenu onClose={() => setMenuVisible(false)} />}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9C80E",
        opacity: 1,
    },
})
