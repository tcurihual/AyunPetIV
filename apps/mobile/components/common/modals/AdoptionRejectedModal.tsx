import React, { useState, useEffect } from "react"
import { Modal, View, Text, Button, StyleSheet, Animated, Image } from "react-native"
import { useAuthContext } from "@/context/AuthContext"

type AdoptionRejectedModalProps = {
    petName: string
    visible: boolean
    onClose: () => void
    reason?: string
}

const AdoptionRejectedModal = ({
    petName,
    visible,
    onClose,
    reason = "La razón no fue especificada.",
}: AdoptionRejectedModalProps) => {
    const fadeAnim = new Animated.Value(0)
    const { user } = useAuthContext()
    const role = user?.role

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [visible])
    
    const showMessage = role === 20 || role === 21 || role === 22

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
                <View style={styles.modalContainer}>
                    <Image
                        source={require("../../../assets/images/perro-gato.png")}
                        style={styles.image}
                    />
                    <Text style={styles.title}>Solicitud Rechazada</Text>

                    {showMessage && (
                        <>
                            <Text style={styles.message}>
                                Tu solicitud para <Text style={styles.boldText}>{petName}</Text> ha
                                sido rechazada.
                            </Text>
                            <Text style={styles.reason}>{reason}</Text>
                        </>
                    )}

                    <View style={styles.buttonsContainer}>
                        <Button title="Cerrar" onPress={onClose} color="#FF5733" />
                    </View>
                </View>
            </Animated.View>
        </Modal>
    )
}

const styles = StyleSheet.create({
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
        height: 400,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
    image: { width: 160, height: 160, borderRadius: 80, marginBottom: 20, resizeMode: "cover" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#FF5733" },
    message: { fontSize: 16, color: "#333", textAlign: "center", marginBottom: 5 },
    boldText: { fontWeight: "bold" },
    reason: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 },
    buttonsContainer: { width: "100%", gap: 10 },
})

export default AdoptionRejectedModal
