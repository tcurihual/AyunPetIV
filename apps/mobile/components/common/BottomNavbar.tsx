import React from "react"
import { View, StyleSheet, Pressable, useWindowDimensions, useColorScheme } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useAuthContext } from "@/context/AuthContext"
import { usePathname } from "expo-router"
import { useSafeNavigation } from "@/utils/navigation"

export default function BottomNavbar() {
    const { height } = useWindowDimensions()
    const pathname = usePathname()
    const { navigate } = useSafeNavigation()
    const { user } = useAuthContext()
    const role = user?.role

    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    // Debug: descomentar para ver el pathname actual
    console.log("Current pathname:", pathname)

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "home") {
            // Para shelter, el home es el index (mis publicaciones)
            if (role === 21 || role === 22) {
                return pathname === "/" || pathname === "/(shelter)" || pathname === "/(shelter)/"
            }
            // Para usuarios normales
            return pathname === "/" || pathname.startsWith("/(home)")
        }
        if (tabPath === "search") return pathname.includes("/search")
        if (tabPath === "requests") {
            return (
                pathname === "/requestList" ||
                pathname.includes("/requests") ||
                pathname.includes("requests") ||
                pathname.match(/^\/\d+$/) !== null || // Coincide con /[id] (ej: /123)
                pathname.includes("/view-adoption-responses")
            )
        }
        if (tabPath === "profile") return pathname.includes("/my-profile")
        if (tabPath === "dashboard")
            return pathname.includes("/(dashboard)") || pathname.includes("/dashboard")
        if (tabPath === "users") return pathname.includes("/(users)")
        return false
    }

    const getTabStyle = (tabPath: string) => [
        styles.tab,
        isActiveTab(tabPath) && [styles.tabActive, { backgroundColor: themeColors.navActiveTabBg }],
    ]

    const getIconColor = (tabPath: string) =>
        isActiveTab(tabPath) ? themeColors.navIconActive : themeColors.navIconInactive

    const getIconName = (baseName: string, tabPath: string): any =>
        isActiveTab(tabPath) ? baseName : `${baseName}-outline`

    const renderTabsByRole = () => {
        switch (role) {
            case 20:
                return (
                    <>
                        <Pressable style={getTabStyle("home")} onPress={() => navigate("/(home)")}>
                            <Ionicons
                                name={getIconName("paw", "home")}
                                size={26}
                                color={getIconColor("home")}
                            />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("requests")}
                            onPress={() => navigate("/requestList")}
                        >
                            <Ionicons
                                name={getIconName("mail", "requests")}
                                size={26}
                                color={getIconColor("requests")}
                            />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("profile")}
                            onPress={() => navigate("/(home)/my-profile")}
                        >
                            <Ionicons
                                name={getIconName("person", "profile")}
                                size={26}
                                color={getIconColor("profile")}
                            />
                        </Pressable>
                    </>
                )
            case 21:
            case 22:
                return (
                    <>
                        <Pressable
                            style={getTabStyle("home")}
                            onPress={() => navigate("/(shelter)")}
                        >
                            <Ionicons
                                name={getIconName("home", "home")}
                                size={26}
                                color={getIconColor("home")}
                            />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("dashboard")}
                            onPress={() => navigate("/(shelter)/dashboard")}
                        >
                            <Ionicons
                                name={getIconName("stats-chart", "dashboard")}
                                size={26}
                                color={getIconColor("dashboard")}
                            />
                        </Pressable>
                        <Pressable
                            style={[styles.addBtn, { backgroundColor: themeColors.navAddButton }]}
                            onPress={() => navigate("/(shelter)/AddPetScreen")}
                        >
                            <Ionicons name="add" size={28} color="#fff" />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("requests")}
                            onPress={() => navigate("/(shelter)/requests/requestList")}
                        >
                            <Ionicons
                                name={getIconName("mail", "requests")}
                                size={26}
                                color={getIconColor("requests")}
                            />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("profile")}
                            onPress={() => navigate("/(shelter)/my-profile")}
                        >
                            <Ionicons
                                name={getIconName("person", "profile")}
                                size={26}
                                color={getIconColor("profile")}
                            />
                        </Pressable>
                    </>
                )
            case 19:
                return (
                    <>
                        <Pressable
                            style={getTabStyle("dashboard")}
                            onPress={() => navigate("/(dashboard)")}
                        >
                            <Ionicons
                                name={getIconName("stats-chart", "dashboard")}
                                size={26}
                                color={getIconColor("dashboard")}
                            />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("users")}
                            onPress={() => navigate("/(users)")}
                        >
                            <Ionicons
                                name={getIconName("people", "users")}
                                size={26}
                                color={getIconColor("users")}
                            />
                        </Pressable>
                        <Pressable
                            style={getTabStyle("profile")}
                            onPress={() => navigate("/(home)/my-profile")}
                        >
                            <Ionicons
                                name={getIconName("person-circle", "profile")}
                                size={26}
                                color={getIconColor("profile")}
                            />
                        </Pressable>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <View
            style={[
                styles.navbar,
                {
                    height: height * 0.08,
                    backgroundColor: themeColors.navBackground,
                    borderTopColor: themeColors.navBackground,
                },
            ]}
        >
            {renderTabsByRole()}
        </View>
    )
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 12,
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
        transform: [{ scale: 1.05 }],
    },
    addBtn: {
        width: 56,
        height: 56,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        marginHorizontal: 6,
    },
})
