import React from "react"
import { View, StyleSheet, Modal } from "react-native"
import LottieView from "lottie-react-native"

type Props = {
    visible: boolean
}

export default function Loading({ visible }: Props) {
    if (!visible) return null

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <LottieView
                    source={require("@animations/Dog-walking.json")}
                    autoPlay
                    loop
                    style={{ width: 150, height: 150 }}
                />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
})
