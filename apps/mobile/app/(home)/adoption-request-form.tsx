import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { usePostFormContext } from "@/context/PostFormContext"
import { usePostResponsesContext } from "@/context/PostResponsesContext"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"
import { DynamicQuestionForm, QuestionAnswer } from "@/components/common/DynamicQuestionForm"
import { useAlert } from "@/context/AlertContext"
import { useAuthContext } from "@/context/AuthContext"
import { Colors } from "@/constants/Colors"

export default function AdoptionRequestForm() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const postId = Number(params.postId)
    const petName = String(params.petName || "esta mascota")

    const [adoptionMessage, setAdoptionMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const { items: postFormItems, loading: loadingQuestions, listByPost } = usePostFormContext()
    const { create: createResponse } = usePostResponsesContext()
    const { createAdoptionRequest } = useAdoptionRequestContext()
    const { showAlert } = useAlert()
    const { user } = useAuthContext()

    useEffect(() => {
        console.log("🔍 AdoptionRequestForm - Usuario actual:", JSON.stringify(user, null, 2))
        if (postId && !isNaN(postId)) {
            listByPost({ post_id: postId })
        }
    }, [postId])

    const handleSubmitForm = async (answers: QuestionAnswer[]) => {
        if (!adoptionMessage.trim() && answers.length === 0) {
            showAlert("Por favor, escribe un mensaje o responde las preguntas", "warning")
            return
        }

        setSubmitting(true)
        try {
            const adoptionRequest = await createAdoptionRequest({
                postid: postId,
                message: adoptionMessage.trim() || "Solicitud de adopción",
            })

            console.log("✅ Solicitud de adopción creada:", adoptionRequest.id)

            if (answers.length > 0) {
                for (const answer of answers) {
                    try {
                        await createResponse({
                            id_post_form: answer.id_post_form,
                            answer: answer.answer,
                        })
                    } catch (error) {
                        console.error(
                            `⚠️ Error al guardar respuesta para pregunta ${answer.id_post_form}:`,
                            error
                        )
                    }
                }
                console.log(`✅ ${answers.length} respuestas guardadas`)
            }

            showAlert(
                "¡Solicitud enviada correctamente! El dador recibirá tu mensaje y respuestas.",
                "success"
            )

            router.replace("/(home)")
        } catch (error: any) {
            console.error("❌ Error al enviar solicitud:", error)
            showAlert(
                error?.response?.data?.message || error?.message || "Error al enviar la solicitud",
                "error"
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (isNaN(postId)) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
                <Text style={styles.errorText}>ID de publicación inválido</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (loadingQuestions && postFormItems.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.yellow} />
                <Text style={styles.loadingText}>Cargando formulario...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solicitar adopción</Text>
                <View style={{ width: 24 }} />
            </View>

            {postFormItems.length > 0 ? (
                <DynamicQuestionForm
                    postFormItems={postFormItems}
                    onSubmit={handleSubmitForm}
                    submitButtonText="Enviar solicitud de adopción"
                    disabled={submitting}
                    headerComponent={
                        <>
                            <View style={styles.petInfoCard}>
                                <Ionicons name="paw-outline" size={32} color={Colors.yellow} />
                                <View style={styles.petInfoText}>
                                    <Text style={styles.petName}>{petName}</Text>
                                    <Text style={styles.petSubtext}>
                                        Completa el formulario para solicitar la adopción
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    <Ionicons name="chatbubble-outline" size={16} /> Mensaje para el
                                    dador
                                </Text>
                                <Text style={styles.sectionDescription}>
                                    Cuéntale al dador por qué quieres adoptar a {petName}
                                </Text>
                                <TextInput
                                    style={styles.messageInput}
                                    value={adoptionMessage}
                                    onChangeText={setAdoptionMessage}
                                    placeholder={`Ejemplo: Me gustaría adoptar a ${petName} porque...`}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    editable={!submitting}
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    <Ionicons name="clipboard-outline" size={16} /> Formulario
                                    adicional
                                </Text>
                                <Text style={styles.sectionDescription}>
                                    El dador ha solicitado que respondas estas preguntas
                                </Text>
                            </View>
                        </>
                    }
                />
            ) : (
                <>
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.petInfoCard}>
                            <Ionicons name="paw-outline" size={32} color={Colors.yellow} />
                            <View style={styles.petInfoText}>
                                <Text style={styles.petName}>{petName}</Text>
                                <Text style={styles.petSubtext}>
                                    Completa el formulario para solicitar la adopción
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="chatbubble-outline" size={16} /> Mensaje para el
                                dador
                            </Text>
                            <Text style={styles.sectionDescription}>
                                Cuéntale al dador por qué quieres adoptar a {petName}
                            </Text>
                            <TextInput
                                style={styles.messageInput}
                                value={adoptionMessage}
                                onChangeText={setAdoptionMessage}
                                placeholder={`Ejemplo: Me gustaría adoptar a ${petName} porque...`}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                editable={!submitting}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={() => handleSubmitForm([])}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <ActivityIndicator
                                        size="small"
                                        color={Colors.light.textSecondary}
                                    />
                                    <Text style={styles.submitButtonText}>Enviando...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="send-outline"
                                        size={20}
                                        color={Colors.light.textSecondary}
                                    />
                                    <Text style={styles.submitButtonText}>
                                        Enviar solicitud de adopción
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.yellow,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary,
    },
    backIconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.light.text,
    },
    content: {
        flex: 1,
    },
    petInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.card,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    petInfoText: {
        marginLeft: 16,
        flex: 1,
    },
    petName: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.light.text,
        marginBottom: 4,
    },
    petSubtext: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.light.text,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 12,
    },
    messageInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        padding: 16,
        fontSize: 15,
        color: Colors.light.text,
        minHeight: 120,
    },
    footer: {
        padding: 16,
        backgroundColor: Colors.light.background,
        borderTopWidth: 1,
        borderTopColor: Colors.primary,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.yellow,
        padding: 16,
        borderRadius: 12,
        shadowColor: Colors.yellow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.primary,
        shadowOpacity: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.light.text,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.light.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.light.background,
        padding: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "600",
        color: Colors.danger,
        textAlign: "center",
    },
    backButton: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: Colors.yellow,
        borderRadius: 8,
    },
    backButtonText: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: "600",
    },
})
