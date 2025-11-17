import React, { useState } from "react"
import { StyleSheet, useColorScheme } from "react-native"
import { Slot, usePathname, Redirect } from "expo-router"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import BackButton from "@common/BackButton"
import DropdownMenu from "@common/DropdownMenu"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "@/constants/Colors"
import { useAuthContext } from "@/context/AuthContext"

export default function ShelterLayout() {
    const pathname = usePathname()
    const [menuVisible, setMenuVisible] = useState(false)
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]
    // const { user } = useAuthContext()

    // if (!user) return <Redirect href="/(auth)/login" />

    const showBackButton =
        pathname !== "/(shelter)" &&
        pathname !== "/(shelter)/" &&
        pathname !== "/" &&
        !pathname.endsWith("/(shelter)") &&
        !pathname.includes("/publication-success")
    let backButtonStyle = {}

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.navBackground }]}>
            <StatusBar style="inverted" />

            <Header onMenuPress={() => setMenuVisible(true)} />
            <Slot />

            {showBackButton && <BackButton style={backButtonStyle} />}

            <BottomNavbar />

            {menuVisible && <DropdownMenu onClose={() => setMenuVisible(false)} />}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        opacity: 1,
    },
})
