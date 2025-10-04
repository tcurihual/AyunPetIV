import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { useRouter } from "expo-router"

export default function BottomNavbar() {
    const { height } = useWindowDimensions()
    const router = useRouter()

    return (
        <View style={[styles.navbar, { height: height * 0.06 }]}>
            <Pressable style={styles.tab} onPress={() => router.push("/(home)")}>
                <Ionicons name="home" size={26} color="#000" />
            </Pressable>

            <Pressable
                style={styles.tab}
                onPress={() => router.push("/(home)/(requests)/requestList")}
            >
                <Ionicons name="search" size={26} color="#000" />
            </Pressable>

            <Pressable style={styles.addBtn} onPress={() => router.push("/(home)/AddPetScreen")}>
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>

            <Pressable style={styles.tab} onPress={() => router.push("/(home)/my-publications")}>
                <Ionicons name="list" size={26} color="#000" />
            </Pressable>

            <Pressable style={styles.tab} onPress={() => router.push("/(home)/my-profile")}>
                <Ionicons name="person" size={26} color="#000" />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row",
        backgroundColor: "#F9C80E",
        alignItems: "center",
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
        marginHorizontal: 6,
    },
})
