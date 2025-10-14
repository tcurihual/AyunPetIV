import React from "react"
import { View, StyleSheet, Modal, StatusBar, Platform, Dimensions } from "react-native"
import LottieView from "lottie-react-native"

type Props = {
    visible: boolean
}

export default function Loading({ visible }: Props) {
    if (!visible) return null

    return (
        <View style={styles.overlay}>
            <View style={styles.backdrop}>
                <View style={styles.container}>
                    <LottieView
                        source={require("@animations/Dog-walking.json")}
                        autoPlay
                        loop
                        style={{ width: 150, height: 150 }}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 9999,
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
})
