import React, { useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { Slot, usePathname } from "expo-router"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import DropdownMenu from "@common/DropdownMenu"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "@/constants/Colors"
import { useLoading } from "@/context/LoadingContext"

export default function HomeLayout() {
    const [menuVisible, setMenuVisible] = useState(false)
    const pathname = usePathname()
    const { showLoading, hideLoading } = useLoading()

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null

        const isHomePath =
            pathname === "/(home)" ||
            pathname === "/" ||
            pathname === "/home" ||
            pathname === "/(home)/index"

        if (isHomePath) {
            showLoading()
            timeout = setTimeout(() => hideLoading(), 600)
        }

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [pathname])

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="inverted" />
            <Header onMenuPress={() => setMenuVisible(true)} />
            <Slot />
            <BottomNavbar />
            {menuVisible && <DropdownMenu onClose={() => setMenuVisible(false)} />}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.yellow,
    },
})
