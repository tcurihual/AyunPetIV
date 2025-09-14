import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import React from "react"

type Props = {
    onTabPress?: (tab: string) => void
    activeTab?: string
}

export default function BottomNavbar({ onTabPress, activeTab }: Props) {
    const { height } = useWindowDimensions()
    return (
        <View style={[styles.navbar, { height: height * 0.06 }]}>
            <Pressable style={styles.tab} onPress={() => onTabPress?.("home")}>
                <Ionicons name="home" size={26} color={activeTab === "home" ? "#000" : "#555"} />
            </Pressable>

            <Pressable style={styles.tab} onPress={() => onTabPress?.("search")}>
                <Ionicons
                    name="search"
                    size={26}
                    color={activeTab === "search" ? "#000" : "#555"}
                />
            </Pressable>

            <Pressable style={styles.addBtn} onPress={() => onTabPress?.("add")}>
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>

            <Pressable style={styles.tab} onPress={() => onTabPress?.("chat")}>
                <Ionicons
                    name="chatbubble"
                    size={26}
                    color={activeTab === "chat" ? "#000" : "#555"}
                />
            </Pressable>

            <Pressable style={styles.tab} onPress={() => onTabPress?.("notifications")}>
                <Ionicons
                    name="notifications"
                    size={26}
                    color={activeTab === "notifications" ? "#000" : "#555"}
                />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navbar: {
        flexDirection: "row",
        backgroundColor: "#F9C80E",
        alignItems: "flex-end",
        justifyContent: "space-around",
        paddingHorizontal: 12,
        borderTopColor: "#ddd",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
    },
})
