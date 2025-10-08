import React from "react"
import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native"
import { useRouter, usePathname } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

export default function BottomNavbar() {
    const { height } = useWindowDimensions()
    const router = useRouter()
    const pathname = usePathname()

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "home") {
            return (
                pathname === "/" ||
                (pathname.includes("/(home)") &&
                    !pathname.includes("/my-") &&
                    !pathname.includes("/(requests)") &&
                    !pathname.includes("/AddPetScreen"))
            )
        }
        if (tabPath === "requests") {
            return pathname.includes("/(requests)")
        }
        if (tabPath === "publications") {
            return pathname.includes("/my-publications")
        }
        if (tabPath === "profile") {
            return pathname.includes("/my-profile")
        }
        return false
    }

    const getTabStyle = (tabPath: string) => [styles.tab, isActiveTab(tabPath) && styles.tabActive]

    const getIconColor = (tabPath: string) => (isActiveTab(tabPath) ? "#F59E0B" : "#666")
    const getIconName = (baseName: string, tabPath: string): any =>
        isActiveTab(tabPath) ? baseName : `${baseName}-outline`

    return (
        <View style={[styles.navbar, { height: height * 0.08 }]}>
            <Pressable style={getTabStyle("home")} onPress={() => router.push("/(home)")}>
                <Ionicons
                    name={getIconName("home", "home")}
                    size={26}
                    color={getIconColor("home")}
                />
            </Pressable>

            <Pressable
                style={getTabStyle("requests")}
                onPress={() => router.push("/(home)/(requests)/requestList")}
            >
                <Ionicons
                    name={getIconName("search", "requests")}
                    size={26}
                    color={getIconColor("requests")}
                />
            </Pressable>

            <Pressable style={styles.addBtn} onPress={() => router.push("/(home)/AddPetScreen")}>
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>

            <Pressable
                style={getTabStyle("publications")}
                onPress={() => router.push("/(home)/my-publications")}
            >
                <Ionicons
                    name={getIconName("list", "publications")}
                    size={26}
                    color={getIconColor("publications")}
                />
            </Pressable>

            <Pressable
                style={getTabStyle("profile")}
                onPress={() => router.push("/(home)/my-profile")}
            >
                <Ionicons
                    name={getIconName("person", "profile")}
                    size={26}
                    color={getIconColor("profile")}
                />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row",
        backgroundColor: `${Colors.yellow}`,
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 12,
        borderTopColor: "#ddd",
        borderTopWidth: 1,
        zIndex: 1000,
        elevation: 1000,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    tabActive: {
        backgroundColor: "#FEF3C7",
        transform: [{ scale: 1.05 }],
    },
    addBtn: {
        width: 56,
        height: 56,
        borderRadius: 100,
        backgroundColor: "#9C27B0",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        marginHorizontal: 6,
    },
})
