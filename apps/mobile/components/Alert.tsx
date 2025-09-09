import React from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { useAlert } from "../context/AlertContext"

const alertColors = {
    success: "#4CAF50",
    error: "#F44336",
    info: "#2196F3",
    warning: "#FFC107",
}

export const Alert = () => {
    const { alert } = useAlert()

    if (!alert.visible) return null

    return (
        <View style={[styles.container, { backgroundColor: alertColors[alert.type] }]}>
            <Text style={styles.text}>{alert.message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        zIndex: 1000,
    },
    text: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
})
