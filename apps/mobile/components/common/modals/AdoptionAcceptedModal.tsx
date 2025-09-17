import React, { useState, useEffect } from "react"
import { Modal, View, Text, Button, StyleSheet, Animated, Image } from "react-native"
import { AdoptionRequestProps } from "../../../context/ModalContext"

type AdoptionAcceptedModalProps = {
    petDetails: Pick<AdoptionRequestProps, "petName">
}

const AdoptionAcceptedModal = ({ petDetails }: AdoptionAcceptedModalProps) => {
    const [visible, setVisible] = useState(false)
    const fadeAnim = new Animated.Value(0)

    const close = () => setVisible(false)

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start()
        }
    }, [visible])

    return (
        <>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
                <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
                    <View style={styles.modalContainer}>
                        <Image
                            source={require("../../../assets/images/perro-gato.png")}
                            style={styles.image}
                        />
                        <Text style={styles.title}>¡Solicitud Aceptada!</Text>
                        <Text style={styles.message}>
                            Tu solicitud para adoptar a{" "}
                            <Text style={styles.boldText}>{petDetails.petName}</Text> ha sido
                            aceptada.
                        </Text>
                        <View style={styles.buttonsContainer}>
                            <Button
                                title="Ver detalles"
                                onPress={() => {
                                    /* Acción */
                                }}
                                color="#4CAF50"
                            />
                            <Button title="Cerrar" onPress={close} color="#FF5733" />
                        </View>
                    </View>
                </Animated.View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    testButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        paddingHorizontal: 20,
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
        height: 400,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
    image: {
        width: 160,
        height: 160,
        borderRadius: 80,
        marginBottom: 20,
        resizeMode: "cover",
    },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#4CAF50" },
    message: { fontSize: 16, marginBottom: 20, color: "#333", textAlign: "center" },
    boldText: { fontWeight: "bold" },
    buttonsContainer: { width: "100%", gap: 10 },
})

export default AdoptionAcceptedModal
