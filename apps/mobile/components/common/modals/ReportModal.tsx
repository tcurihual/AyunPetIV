import React, { useState } from "react"
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
} from "react-native"

interface ReportModalProps {
    visible: boolean
    onClose: () => void
    onSubmit: (description: string) => void
    title?: string
}

export default function ReportModal({
    visible,
    onClose,
    onSubmit,
    title = "Reportar Publicación",
}: ReportModalProps) {
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!description.trim()) {
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit(description.trim())
            setDescription("")
            onClose()
        } catch (error) {
            console.error("Error al enviar reporte:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setDescription("")
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.title}>
                                Describa a continuación el propósito de este reporte:
                            </Text>

                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Ingrese aquí..."
                                    placeholderTextColor="#999"
                                    multiline={true}
                                    numberOfLines={6}
                                    value={description}
                                    onChangeText={setDescription}
                                    textAlignVertical="top"
                                    maxLength={500}
                                />
                            </View>

                            <Text style={styles.characterCount}>{description.length}/500</Text>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (!description.trim() || isSubmitting) &&
                                        styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={!description.trim() || isSubmitting}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClose}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    modalContainer: {
        width: "100%",
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginBottom: 20,
        lineHeight: 22,
        textAlign: "left",
    },
    textAreaContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        marginBottom: 8,
        minHeight: 120,
    },
    textArea: {
        padding: 16,
        fontSize: 16,
        color: "#333",
        minHeight: 120,
        maxHeight: 200,
        textAlignVertical: "top",
    },
    characterCount: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
        marginBottom: 24,
    },
    submitButton: {
        backgroundColor: "#FF3B30",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        marginBottom: 12,
    },
    submitButtonDisabled: {
        backgroundColor: "#FFB3B0",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButton: {
        backgroundColor: "transparent",
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "500",
    },
})
