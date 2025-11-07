import React, { useState } from "react"
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"
import { Colors } from "@/constants/Colors"
import { FileInfo } from "@/services/http"
import { userService } from "@/services/user"

export default function RequestGiverScreen() {
    const router = useRouter()
    const { user } = useAuthContext()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const [documents, setDocuments] = useState<FileInfo[]>([])

    // Verificar si ya tiene una solicitud pendiente
    const hasPendingRequest = user?.validated === false

    // Función para seleccionar documentos PDF
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
                multiple: false,
            })

            if (result.canceled) return

            const asset = result.assets?.[0]
            if (!asset) return

            const fileInfo: FileInfo = {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || "application/pdf",
            }

            setDocuments((prev) => [...prev, fileInfo])
            showAlert("Documento agregado", "success")
        } catch (error) {
            console.error("Error al seleccionar documento:", error)
            showAlert("Error al seleccionar el documento", "error")
        }
    }

    // Función para seleccionar imagen desde galería
    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            showAlert("Se necesitan permisos para acceder a la galería", "error")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.8,
        })

        if (result.canceled) return

        const asset = result.assets?.[0]
        if (!asset) return

        const fileInfo: FileInfo = {
            uri: asset.uri,
            name: `image_${Date.now()}.jpg`,
            type: "image/jpeg",
        }

        setDocuments((prev) => [...prev, fileInfo])
        showAlert("Imagen agregada", "success")
    }

    // Función para tomar foto con cámara
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
            showAlert("Se necesitan permisos para acceder a la cámara", "error")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        })

        if (result.canceled) return

        const asset = result.assets?.[0]
        if (!asset) return

        const fileInfo: FileInfo = {
            uri: asset.uri,
            name: `photo_${Date.now()}.jpg`,
            type: "image/jpeg",
        }

        setDocuments((prev) => [...prev, fileInfo])
        showAlert("Foto tomada", "success")
    }

    // Eliminar documento
    const removeDocument = (index: number) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index))
    }

    // Mostrar opciones de carga
    const showUploadOptions = () => {
        Alert.alert("Agregar documento", "Selecciona una opción", [
            {
                text: "Tomar Foto",
                onPress: takePhoto,
            },
            {
                text: "Galería",
                onPress: pickImageFromGallery,
            },
            {
                text: "Archivo PDF",
                onPress: pickDocument,
            },
            {
                text: "Cancelar",
                style: "cancel",
            },
        ])
    }

    // Enviar solicitud
    const handleSubmit = async () => {
        if (documents.length === 0) {
            showAlert("Debes agregar al menos un documento", "error")
            return
        }

        try {
            await withLoading(async () => {
                await userService.submitGiverRequest(documents)
            })

            // Mostrar alerta de éxito
            showAlert(
                "¡Solicitud enviada exitosamente! Recibirás un correo de confirmación y te notificaremos cuando sea validada.",
                "success"
            )

            // Esperar un momento para que el usuario vea la alerta antes de volver
            setTimeout(() => {
                router.back()
            }, 1500)
        } catch (error: any) {
            console.error("Error al enviar solicitud:", error)

            // Extraer el mensaje de error del servidor
            let message = "Error al enviar la solicitud"

            if (error?.response?.data?.message) {
                message = error.response.data.message
            } else if (error?.message) {
                message = error.message
            }

            showAlert(message, "error")
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Solicitud para Ser Dador</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {hasPendingRequest ? (
                    // Mostrar mensaje si ya tiene solicitud pendiente
                    <View style={styles.pendingContainer}>
                        <Ionicons name="hourglass-outline" size={64} color="#F9C80E" />
                        <Text style={styles.pendingTitle}>Solicitud en Revisión</Text>
                        <Text style={styles.pendingText}>
                            Ya tienes una solicitud pendiente de validación.
                        </Text>
                        <Text style={styles.pendingText}>
                            Nuestro equipo está revisando tus documentos y te notificaremos por
                            correo electrónico cuando sea validada.
                        </Text>
                        <View style={styles.pendingInfoBox}>
                            <Ionicons name="mail-outline" size={20} color="#666" />
                            <Text style={styles.pendingInfoText}>
                                Recibirás un correo de confirmación cuando tu cuenta sea validada
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>Volver</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={48} color={Colors.yellow} />
                            <Text style={styles.infoTitle}>¿Qué necesitas?</Text>
                            <Text style={styles.infoText}>
                                Para convertirte en dador de mascotas, necesitamos que subas
                                documentos que validen tu identidad y capacidad para dar mascotas en
                                adopción.
                            </Text>
                            <Text style={styles.infoText}>
                                Ejemplos: Certificado de antecedentes, cédula de identidad,
                                comprobante de domicilio, etc.
                            </Text>
                        </View>

                        <View style={styles.warningCard}>
                            <Ionicons name="warning-outline" size={24} color="#ff9800" />
                            <Text style={styles.warningText}>
                                ⚠️ Importante: Al enviar esta solicitud, no podrás acceder a la
                                aplicación hasta que tu cuenta sea validada o rechazada por nuestro
                                equipo.
                            </Text>
                        </View>

                        <Text style={styles.sectionTitle}>Documentos ({documents.length}/10)</Text>
                        <Text style={styles.sectionSubtitle}>
                            Puedes subir imágenes (JPG, PNG) o archivos PDF
                        </Text>

                        {/* Lista de documentos agregados */}
                        {documents.length > 0 && (
                            <View style={styles.documentsContainer}>
                                {documents.map((doc, index) => (
                                    <View key={index} style={styles.documentItem}>
                                        <View style={styles.documentInfo}>
                                            <Ionicons
                                                name={
                                                    doc.type?.includes("pdf")
                                                        ? "document-text"
                                                        : "image"
                                                }
                                                size={24}
                                                color={Colors.yellow}
                                            />
                                            <Text style={styles.documentName} numberOfLines={1}>
                                                {doc.name}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeDocument(index)}>
                                            <Ionicons name="trash-outline" size={20} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Botón para agregar documentos */}
                        <TouchableOpacity
                            style={[
                                styles.uploadButton,
                                documents.length >= 10 && styles.uploadButtonDisabled,
                            ]}
                            onPress={showUploadOptions}
                            disabled={documents.length >= 10}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#fff" />
                            <Text style={styles.uploadButtonText}>Agregar Documento</Text>
                        </TouchableOpacity>

                        {/* Botón para enviar solicitud */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                documents.length === 0 && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={documents.length === 0}
                        >
                            <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                        </TouchableOpacity>

                        <View style={styles.noteCard}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={styles.noteText}>
                                Una vez enviada tu solicitud, nuestro equipo la revisará en 24-48
                                horas hábiles. Recibirás un correo electrónico cuando sea validada.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#f7c316ff",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    infoCard: {
        backgroundColor: "#FFF9E6",
        padding: 20,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 8,
        color: "#333",
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
        paddingHorizontal: 20,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#666",
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    documentsContainer: {
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    documentItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    documentInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    documentName: {
        marginLeft: 12,
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    uploadButton: {
        backgroundColor: "#f7c316ff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 20,
    },
    uploadButtonDisabled: {
        backgroundColor: "#ccc",
    },
    uploadButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
        marginHorizontal: 20,
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
    },
    submitButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    noteCard: {
        flexDirection: "row",
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        marginHorizontal: 20,
    },
    noteText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    pendingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        marginTop: 40,
    },
    pendingTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginTop: 20,
        marginBottom: 16,
        textAlign: "center",
    },
    pendingText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 12,
        lineHeight: 24,
    },
    pendingInfoBox: {
        flexDirection: "row",
        backgroundColor: "#FFF9E6",
        padding: 16,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 30,
        alignItems: "center",
    },
    pendingInfoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    backButton: {
        backgroundColor: "#F9C80E",
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
    },
    backButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
    warningCard: {
        flexDirection: "row",
        backgroundColor: "#fff3e0",
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        marginHorizontal: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#ff9800",
    },
    warningText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: "#e65100",
        lineHeight: 20,
        fontWeight: "500",
    },
})
