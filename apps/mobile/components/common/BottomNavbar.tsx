import React from "react"
import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native"
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

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "home") return pathname === "/" || pathname.includes("/(home)")
        if (tabPath === "search") return pathname.includes("/search")
        if (tabPath === "requests") return pathname.includes("/(requests)")
        if (tabPath === "profile") return pathname.includes("/my-profile")
        if (tabPath === "dashboard") return pathname.includes("/(dashboard)")
        if (tabPath === "users") return pathname.includes("/(users)")
        return false
    }

    const getTabStyle = (tabPath: string) => [styles.tab, isActiveTab(tabPath) && styles.tabActive]
    const getIconColor = (tabPath: string) => (isActiveTab(tabPath) ? "#9C27B0" : "#666")
    const getIconName = (baseName: string, tabPath: string): any =>
        isActiveTab(tabPath) ? baseName : `${baseName}-outline`

    const renderTabsByRole = () => {
        switch (role) {
            // 🐾 Usuario normal
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
                            onPress={() => navigate("/(home)/(requests)/requestList")}
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

            // 🏠 Refugios / Dadores
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
                            style={styles.addBtn}
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

            // 👨‍💻 Admin
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

    return <View style={[styles.navbar, { height: height * 0.08 }]}>{renderTabsByRole()}</View>
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row",
        backgroundColor: Colors.yellow,
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
