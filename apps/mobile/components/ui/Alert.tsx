import React, { useEffect, useRef, useState } from "react"
import { Text, StyleSheet, Animated, Dimensions } from "react-native"
import { useAlert } from "@/context/AlertContext"

const alertColors = {
    success: "#4CAF50",
    error: "#F44336",
    info: "#2196F3",
    warning: "#FFC107",
}

const { width, height } = Dimensions.get("window")

export const Alert = () => {
    const { alert } = useAlert()
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(30)).current
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (alert.visible) {
            setVisible(true)
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 30,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setVisible(false)
            })
        }
    }, [alert.visible, opacity, translateY])

    if (!visible) return null

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: alertColors[alert.type],
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Text style={styles.text}>{alert.message}</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: height / 2 - 60,
        left: width * 0.1,
        right: width * 0.1,
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        zIndex: 1000,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
})
