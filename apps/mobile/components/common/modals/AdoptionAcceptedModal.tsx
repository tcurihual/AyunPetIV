import React, { useState, useEffect } from "react"
import {
    Modal,
    View,
    Text,
    Button,
    StyleSheet,
    Animated,
    Image,
    TextInput,
    Pressable,
} from "react-native"
import { useAuthContext } from "@/context/AuthContext"

type AdoptionAcceptedModalProps = {
    petName: string
    visible: boolean
    onClose: () => void
    onConfirmCode?: (code: string) => void
    adoptionCode?: string
}

const AdoptionAcceptedModal = ({
    petName,
    visible,
    onClose,
    onConfirmCode,
    adoptionCode = "9F27C",
}: AdoptionAcceptedModalProps) => {
    const fadeAnim = new Animated.Value(0)
    const [code, setCode] = useState("")
    const { user } = useAuthContext()
    const role = user?.role
    const showVerification = role === 20
    const showInput = role === 21 || role === 22

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [visible])

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
                <View style={styles.modalContainer}>
                    <Image
                        source={require("../../../assets/images/perro-gato.png")}
                        style={styles.image}
                    />
                    <Text style={styles.title}>¡Solicitud Aceptada!</Text>
                    <Text style={styles.message}>
                        Tu solicitud para adoptar a <Text style={styles.boldText}>{petName}</Text>{" "}
                        ha sido aceptada.
                    </Text>

                    {showVerification && (
                        <View style={{ marginTop: 10, alignItems: "center" }}>
                            <Text style={{ fontWeight: "700", color: "#333" }}>
                                Tu código de adopción es:
                            </Text>
                            <Text
                                style={{
                                    fontSize: 24,
                                    fontWeight: "900",
                                    color: "#2563EB",
                                    marginTop: 6,
                                }}
                            >
                                {adoptionCode}
                            </Text>
                            <Text style={{ color: "#666", marginTop: 4, textAlign: "center" }}>
                                Entrégaselo al dador o refugio para completar la adopción.
                            </Text>
                        </View>
                    )}

                    {showInput && (
                        <View style={{ marginTop: 10, width: "100%" }}>
                            <Text style={{ fontWeight: "700", color: "#333", marginBottom: 6 }}>
                                Ingresa el código del adoptante:
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: 9F27C"
                                value={code}
                                onChangeText={setCode}
                            />
                            <Pressable
                                style={[styles.button, styles.confirmButton]}
                                onPress={() => onConfirmCode?.(code)}
                            >
                                <Text style={styles.buttonText}>Confirmar Código</Text>
                            </Pressable>
                        </View>
                    )}

                    <View style={{ marginTop: 15 }}>
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
        height: 450,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
    image: { width: 160, height: 160, borderRadius: 80, marginBottom: 20, resizeMode: "cover" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#4CAF50" },
    message: { fontSize: 16, marginBottom: 20, color: "#333", textAlign: "center" },
    boldText: { fontWeight: "bold" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        color: "#333",
        width: "100%",
    },
    button: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    confirmButton: { backgroundColor: "#1976D2" },
    buttonText: { color: "#fff", fontWeight: "bold" },
})

export default AdoptionAcceptedModal
