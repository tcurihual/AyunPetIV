import React, { useState, useEffect } from "react"
import { Modal, View, Text, Button, StyleSheet, Animated } from "react-native"

type SuccessModalProps = {
    successMessage: string
}

const SuccessModal = ({ successMessage }: SuccessModalProps) => {
    const [visible, setVisible] = useState(false)
    const fadeAnim = new Animated.Value(0)

    const close = () => setVisible(false)

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [visible])

    return (
        <>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
                <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>¡Éxito!</Text>
                        <Text style={styles.message}>{successMessage}</Text>
                        <View style={styles.buttonsContainer}>
                            <Button title="Cerrar" onPress={close} color="#4CAF50" />
                        </View>
                    </View>
                </Animated.View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    testButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        alignSelf: "center",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
        width: 320,
        height: 250,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#4CAF50" },
    message: { fontSize: 16, color: "#333", textAlign: "center", marginBottom: 20 },
    buttonsContainer: { width: "100%", gap: 10 },
})

export default SuccessModal
