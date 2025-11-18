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
    useColorScheme,
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
import { useThemeColor } from "@/hooks/useThemeColor"

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

    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]
    const backgroundColor = useThemeColor({}, "background")
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const borderColor = useThemeColor({}, "border")

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
            <View style={[styles.errorContainer, { backgroundColor }]}>
                <Ionicons name="alert-circle-outline" size={48} color={themeColors.danger} />
                <Text style={[styles.errorText, { color: themeColors.danger }]}>ID de publicación inválido</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (loadingQuestions && postFormItems.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={Colors.yellow} />
                <Text style={[styles.loadingText, { color: textSecondaryColor }]}>Cargando formulario...</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
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
                            <View style={[styles.petInfoCard, { backgroundColor: cardColor, borderColor }]}>
                                <Ionicons name="paw-outline" size={32} color={Colors.yellow} />
                                <View style={styles.petInfoText}>
                                    <Text style={[styles.petName, { color: textColor }]}>{petName}</Text>
                                    <Text style={[styles.petSubtext, { color: textSecondaryColor }]}>
                                        Completa el formulario para solicitar la adopción
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>
                                    <Ionicons name="chatbubble-outline" size={16} /> Mensaje para el
                                    dador
                                </Text>
                                <Text style={[styles.sectionDescription, { color: textSecondaryColor }]}>
                                    Cuéntale al dador por qué quieres adoptar a {petName}
                                </Text>
                                <TextInput
                                    style={[styles.messageInput, { backgroundColor: cardColor, borderColor, color: textColor }]}
                                    value={adoptionMessage}
                                    onChangeText={setAdoptionMessage}
                                    placeholder={`Ejemplo: Me gustaría adoptar a ${petName} porque...`}
                                    placeholderTextColor={textSecondaryColor}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    editable={!submitting}
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>
                                    <Ionicons name="clipboard-outline" size={16} /> Formulario
                                    adicional
                                </Text>
                                <Text style={[styles.sectionDescription, { color: textSecondaryColor }]}>
                                    El dador ha solicitado que respondas estas preguntas
                                </Text>
                            </View>
                        </>
                    }
                />
            ) : (
                <>
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={[styles.petInfoCard, { backgroundColor: cardColor, borderColor }]}>
                            <Ionicons name="paw-outline" size={32} color={Colors.yellow} />
                            <View style={styles.petInfoText}>
                                <Text style={[styles.petName, { color: textColor }]}>{petName}</Text>
                                <Text style={[styles.petSubtext, { color: textSecondaryColor }]}>
                                    Completa el formulario para solicitar la adopción
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>
                                <Ionicons name="chatbubble-outline" size={16} /> Mensaje para el
                                dador
                            </Text>
                            <Text style={[styles.sectionDescription, { color: textSecondaryColor }]}>
                                Cuéntale al dador por qué quieres adoptar a {petName}
                            </Text>
                            <TextInput
                                style={[styles.messageInput, { backgroundColor: cardColor, borderColor, color: textColor }]}
                                value={adoptionMessage}
                                onChangeText={setAdoptionMessage}
                                placeholder={`Ejemplo: Me gustaría adoptar a ${petName} porque...`}
                                placeholderTextColor={textSecondaryColor}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                editable={!submitting}
                            />
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { backgroundColor, borderTopColor: borderColor }]}>
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && { backgroundColor: borderColor, shadowOpacity: 0 }]}
                            onPress={() => handleSubmitForm([])}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <ActivityIndicator
                                        size="small"
                                        color="#000"
                                    />
                                    <Text style={styles.submitButtonText}>Enviando...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="send-outline"
                                        size={20}
                                        color="#000"
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
        color: "#000",
    },
    content: {
        flex: 1,
    },
    petInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
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
        marginBottom: 4,
    },
    petSubtext: {
        fontSize: 14,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 12,
    },
    messageInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        fontSize: 15,
        minHeight: 120,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
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
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "600",
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
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
})
