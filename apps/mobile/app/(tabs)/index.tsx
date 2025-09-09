import React from "react"
import { useEffect } from "react"
import { View, Text } from "react-native"
import { http } from "../../src/services/http"

export default function Home() {
    useEffect(() => {
        http.get("/ping")
            .then((r) => console.log("✅ PING:", r.data))
            .catch((err) => console.warn("❌ PING:", err?.response?.status, err?.message))
    }, [])

    return (
        <View style={{ padding: 24 }}>
            <Text>Home — revisa la consola de Metro</Text>
        </View>
    )
}
