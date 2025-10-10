import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { Slot, usePathname, router } from "expo-router"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import BackButton from "@common/BackButton"
import DropdownMenu from "@common/DropdownMenu"
import StatusBar from "@common/StatusBar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "@/constants/Colors"

export default function HomeLayout() {
    const pathname = usePathname()
    const [menuVisible, setMenuVisible] = useState(false)

    // Detectar pestaña activa según la ruta actual
    let activeTab = "home"
    if (pathname.includes("/my-profile")) activeTab = "perfil"
    if (pathname.includes("/camera")) activeTab = "camara"
    if (pathname.includes("/(requests)/requestList")) activeTab = "requests"

    const showBackButton = pathname !== "/"

    // Ajusta estilo del BackButton en las vistas a especificar
    let backButtonStyle = {}
    if (pathname.includes("/my-profile")) {
        backButtonStyle = { top: 135, left: 10 }
    }

    return (
        <>
            <StatusBar variant="yellow" />
            <SafeAreaView style={styles.container}>
                <Header onMenuPress={() => setMenuVisible(true)} />

                <Slot />

                {showBackButton && <BackButton style={backButtonStyle} />}

                <BottomNavbar
                    activeTab={activeTab}
                    onTabPress={(tab) => {
                        if (tab === "home") return router.replace("/")
                        if (tab === "camera") return router.push("/camera")
                        if (tab === "requests") return router.push("/(requests)/requestList")
                        if (tab === "perfil") return router.push("/my-profile")
                        if (tab === "add") return router.push("/AddPetScreen")
                    }}
                />
                {menuVisible && <DropdownMenu onClose={() => setMenuVisible(false)} />}
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: `${Colors.yellow}`,
        opacity: 1,
    },
})
