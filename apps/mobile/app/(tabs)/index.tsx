import { Text, View, StyleSheet } from "react-native"
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
            <Text style={styles.text}>Bienvenido a Ayün Pet</Text>
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
