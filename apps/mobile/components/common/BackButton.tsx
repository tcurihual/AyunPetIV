import React from "react"
import { StyleSheet, TouchableOpacity, Dimensions, StyleProp, ViewStyle, useColorScheme } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"

const { width } = Dimensions.get("window")

type BackButtonProps = {
    style?: StyleProp<ViewStyle>
    floating?: boolean
}

export default function BackButton({ style, floating = true }: BackButtonProps) {
    const router = useRouter()
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    return (
        <TouchableOpacity
            style={[
                floating ? styles.button : styles.inlineButton,
                { backgroundColor: themeColors.card },
                style
            ]}
            onPress={() => {
                if (router.canGoBack()) router.back()
                else router.replace("/(home)")
            }}
        >
            <Ionicons name="arrow-back" size={width * 0.07} color={themeColors.text} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        top: 135,
        left: 10,
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
        borderRadius: width * 0.06,
        padding: width * 0.02,
        elevation: 3,
    },
})
