import React from "react"
import { View, StyleSheet, Modal } from "react-native"
import LottieView from "lottie-react-native"
import { useThemeColor } from "@/hooks/useThemeColor"

type Props = {
    visible: boolean
}

export default function Loading({ visible }: Props) {
    const bgColor = useThemeColor({}, "background")
    
    if (!visible) return null
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[styles.container, { backgroundColor: bgColor }]}>
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
        justifyContent: "center",
        alignItems: "center",
    },
})
