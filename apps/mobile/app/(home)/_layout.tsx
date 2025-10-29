import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { Slot } from "expo-router"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import DropdownMenu from "@common/DropdownMenu"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "@/constants/Colors"

export default function HomeLayout() {
    const [menuVisible, setMenuVisible] = useState(false)

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
