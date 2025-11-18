import React from "react"
import { Modal, View, Text, Button, StyleSheet } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"

interface SessionExpiredModalProps {
    visible: boolean
    onAccept: () => void
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ visible, onAccept }) => {
    const cardBgColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: cardBgColor }]}>
                    <Text style={[styles.title, { color: textColor }]}>Sesión expirada</Text>
                    <Text style={[styles.message, { color: textColor }]}>
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
