import React, { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native"
import * as authService from "@/services/auth"
import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "expo-router"

export default function Settings() {
    const { signOut } = useAuthContext()
    const router = useRouter()

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
    const [password, setPassword] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        if (!password) {
            Alert.alert("Error", "Debes ingresar tu contraseña.")
            return
        }

        setIsDeleting(true)
        try {
            await authService.deleteAccount(password)

            setIsDeleting(false)
            setIsDeleteModalVisible(false)

            Alert.alert("Cuenta Eliminada", "Tu cuenta ha sido eliminada exitosamente.")

            await signOut()
            router.replace("/(auth)/welcome")
        } catch (error: any) {
            setIsDeleting(false)
            console.error("Error al eliminar cuenta:", error)
            const errorMessage =
                error.response?.data?.message === "Invalid password"
                    ? "Contraseña incorrecta."
                    : "No se pudo eliminar la cuenta. Intenta nuevamente."
            Alert.alert("Error", errorMessage)
        }
    }

    const openDeleteModal = () => {
        setPassword("")
        setIsDeleteModalVisible(true)
    }

    const closeDeleteModal = () => {
        if (isDeleting) return
        setIsDeleteModalVisible(false)
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View>
                <Text style={styles.text}>Vista de Configuración</Text>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.deleteButton} onPress={openDeleteModal}>
                    <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={isDeleteModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeDeleteModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Eliminar Cuenta</Text>
                        <Text style={styles.modalWarningText}>
                            Esta acción es irreversible. Se eliminarán permanentemente todos tus
                            datos.
                            {"\n\n"}
                            Para confirmar, por favor ingresa tu contraseña.
                        </Text>

                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Tu contraseña"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#888"
                        />

                        <View style={styles.modalButtonSection}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={closeDeleteModal}
                                disabled={isDeleting}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmDeleteButton]}
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.confirmDeleteButtonText}>Eliminar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
    },
    buttonSection: {
        width: "100%",
        marginTop: 20,
    },
    deleteButton: {
        backgroundColor: "#c0392b",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "#333",
    },
    modalWarningText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        color: "#666",
        lineHeight: 22,
    },
    passwordInput: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    modalButtonSection: {
        flexDirection: "row",
        gap: 15,
        width: "100%",
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f1f3f4",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    confirmDeleteButton: {
        backgroundColor: "#c0392b",
    },
    confirmDeleteButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
})
