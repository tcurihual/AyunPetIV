import React, { useState } from "react"
import { StyleSheet, useColorScheme } from "react-native"
import { Slot } from "expo-router"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import DropdownMenu from "@common/DropdownMenu"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "@/constants/Colors"

export default function ShelterLayout() {
    const [menuVisible, setMenuVisible] = useState(false)
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.navBackground }]}>
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
        opacity: 1,
    },
})
