import { Text, View, StyleSheet } from "react-native"
import Navbar from "@/components/Navbar"
import BottomNavbar from "@/components/BottomNavbar"
import React from "react"
import { useEffect } from "react"
import { http } from "../../src/services/http"

export default function Home() {
    useEffect(() => {
        http.get("/ping")
            .then((r) => console.log("✅ PING:", r.data))
            .catch((err) => console.warn("❌ PING:", err?.response?.status, err?.message))
    }, [])

    return (
        <View style={styles.container}>
            <Navbar />
            <Text style={styles.text}>Bienvenido a Ayün Pet</Text>
            <BottomNavbar activeTab="home" onTabPress={(tab) => console.log(tab)} />
        <View style={{ padding: 24 }}>
            <Text>Home — revisa la consola de Metro</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 70,
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
        color: "#fff",
    },
})
