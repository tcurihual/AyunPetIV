import React from "react"
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const { width, height } = Dimensions.get("window")

export default function BackButton() {
    const router = useRouter()

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => {
                if (router.canGoBack()) {
                    router.back()
                } else {
                    router.replace("/(home)")
                }
            }}
        >
            <Ionicons name="arrow-back" size={width * 0.07} color="#000" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        top: height * 0.03,
        left: width * 0.05,
        backgroundColor: "#fff",
        borderRadius: width * 0.08,
        padding: width * 0.03,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
        zIndex: 10,
    },
})
