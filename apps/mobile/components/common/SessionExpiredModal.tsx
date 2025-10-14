import React from "react"
import { Modal, View, Text, Button, StyleSheet } from "react-native"

interface SessionExpiredModalProps {
    visible: boolean
    onAccept: () => void
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ visible, onAccept }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Sesión expirada</Text>
                    <Text style={styles.message}>
                        Tu sesión ya no es válida. Por favor, inicia sesión nuevamente.
                    </Text>
                    <Button title="Ir a inicio de sesión" onPress={onAccept} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 24,
        width: "80%",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
})

export default SessionExpiredModal
