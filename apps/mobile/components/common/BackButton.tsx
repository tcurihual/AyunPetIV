import React from "react"
import { StyleSheet, TouchableOpacity, Dimensions, StyleProp, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

type BackButtonProps = {
    style?: StyleProp<ViewStyle>
    floating?: boolean
}

export default function BackButton({ style, floating = true }: BackButtonProps) {
    const router = useRouter()

    return (
        <TouchableOpacity
            style={[floating ? styles.button : styles.inlineButton, style]}
            onPress={() => {
                if (router.canGoBack()) router.back()
                else router.replace("/(home)")
            }}
        >
            <Ionicons name="arrow-back" size={width * 0.07} color="#000" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        top: 135,
        left: 10,
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
    inlineButton: {
        backgroundColor: "#fff",
        borderRadius: width * 0.06,
        padding: width * 0.02,
        elevation: 3,
    },
})
