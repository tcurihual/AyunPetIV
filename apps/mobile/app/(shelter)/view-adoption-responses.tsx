import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { usePostResponsesContext } from "@/context/PostResponsesContext"
import { usePostFormContext } from "@/context/PostFormContext"
import { useAuthContext } from "@/context/AuthContext"
import { Colors } from "@/constants/Colors"
import { useThemeColor } from "@/hooks/useThemeColor"

interface GroupedResponse {
    questionContent: string
    questionType: string
    answer: string
    respondedBy?: number
}

export default function ViewAdoptionResponses() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const postId = Number(params.postId)
    const petName = String(params.petName || "la mascota")
    const requesterId = params.requesterId ? Number(params.requesterId) : null

    const [groupedResponses, setGroupedResponses] = useState<GroupedResponse[]>([])

    // Colores dinámicos
    const bgColor = useThemeColor({}, "background")
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const tintColor = useThemeColor({}, "tint")
    const dangerColor = useThemeColor({}, "danger")
    const borderColor = useThemeColor({}, "border")

    const { user } = useAuthContext()
    const { responses, loading, listByPublication } = usePostResponsesContext()
    const { items: postFormItems, listByPost } = usePostFormContext()

    useEffect(() => {
        if (postId && !isNaN(postId)) {
            Promise.all([listByPublication(postId), listByPost({ post_id: postId })]).catch(
                (error) => {
                    console.error("Error cargando datos:", error)
                }
            )
        }
    }, [postId])

    useEffect(() => {
        //console.log("📊 ViewAdoptionResponses - Datos recibidos:")
        //console.log("  - Total responses:", responses.length)
        //console.log("  - RequesterId:", requesterId)
        //console.log("  - Responses:", JSON.stringify(responses, null, 2))

        if (responses.length > 0 && postFormItems.length > 0) {
            const filteredResponses = requesterId
                ? responses.filter((response) => {
                      console.log(
                          `  - Comparando response.id_user (${response.id_user}) === requesterId (${requesterId}):`,
                          response.id_user === requesterId
                      )
                      return response.id_user === requesterId
                  })
                : responses

            console.log("  - Filtered responses:", filteredResponses.length)

            const grouped = filteredResponses.map((response) => {
                const postFormItem = postFormItems.find((item) => item.id === response.id_post_form)

                return {
                    questionContent: postFormItem?.question.content || "Pregunta desconocida",
                    questionType: postFormItem?.question.type || "text",
                    answer: response.answer,
                    respondedBy: response.id_user,
                }
            })

            setGroupedResponses(grouped)
        } else {
            setGroupedResponses([])
        }
    }, [responses, postFormItems, requesterId])

    const getAnswerDisplay = (answer: string, type: string) => {
        if (type === "boolean") {
            return answer === "true" ? "✓ Sí" : "✗ No"
        }
        return answer
    }

    const getTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            text: "text-outline",
            number: "keypad-outline",
            boolean: "toggle-outline",
            select: "radio-button-on-outline",
            multiselect: "checkbox-outline",
        }
        return icons[type] || "help-outline"
    }

    if (isNaN(postId)) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: bgColor }]}>
                <Ionicons name="alert-circle-outline" size={48} color={dangerColor} />
                <Text style={[styles.errorText, { color: textColor }]}>
                    ID de publicación inválido
                </Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: tintColor }]}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.backButtonText, { color: textColor }]}>Volver</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (user?.role !== 21 && user?.role !== 22) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: bgColor }]}>
                <Ionicons name="lock-closed-outline" size={48} color={dangerColor} />
                <Text style={[styles.errorText, { color: textColor }]}>
                    Solo los dadores pueden ver las respuestas
                </Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: tintColor }]}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.backButtonText, { color: textColor }]}>Volver</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (loading && groupedResponses.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={tintColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                    Cargando respuestas...
                </Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: tintColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Respuestas del formulario</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.petInfoCard, { backgroundColor: cardColor }]}>
                    <Ionicons name="paw-outline" size={32} color={tintColor} />
                    <View style={styles.petInfoText}>
                        <Text style={[styles.petName, { color: textColor }]}>{petName}</Text>
                        <Text style={[styles.petSubtext, { color: textSecondaryColor }]}>
                            {groupedResponses.length} respuesta
                            {groupedResponses.length === 1 ? "" : "s"} recibida
                            {groupedResponses.length === 1 ? "" : "s"}
                        </Text>
                    </View>
                </View>

                {loading && (
                    <View style={[styles.loadingCard, { backgroundColor: cardColor }]}>
                        <ActivityIndicator size="small" color={tintColor} />
                        <Text style={[styles.loadingCardText, { color: textColor }]}>
                            Cargando datos...
                        </Text>
                    </View>
                )}

                {postFormItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={textMutedColor} />
                        <Text style={[styles.emptyTitle, { color: textColor }]}>
                            No hay formulario configurado
                        </Text>
                        <Text style={[styles.emptyText, { color: textSecondaryColor }]}>
                            Esta publicación no tiene preguntas asociadas
                        </Text>
                    </View>
                ) : groupedResponses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={textMutedColor} />
                        <Text style={[styles.emptyTitle, { color: textColor }]}>
                            Sin respuestas
                        </Text>
                        <Text style={[styles.emptyText, { color: textSecondaryColor }]}>
                            {requesterId
                                ? "Este solicitante aún no ha respondido el formulario"
                                : "Cuando alguien solicite adopción y responda el formulario, las respuestas aparecerán aquí"}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.responsesContainer}>
                        {groupedResponses.map((item, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.responseCard,
                                    { backgroundColor: cardColor, borderColor: borderColor },
                                ]}
                            >
                                <View style={styles.questionHeader}>
                                    <View
                                        style={[
                                            styles.questionIconContainer,
                                            { backgroundColor: tintColor },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getTypeIcon(item.questionType)}
                                            size={20}
                                            color="#000"
                                        />
                                    </View>
                                    <Text style={[styles.questionText, { color: textColor }]}>
                                        {item.questionContent}
                                    </Text>
                                </View>

                                <View style={styles.answerContainer}>
                                    <Text
                                        style={[styles.answerLabel, { color: textSecondaryColor }]}
                                    >
                                        Respuesta:
                                    </Text>
                                    <Text style={[styles.answerText, { color: textColor }]}>
                                        {getAnswerDisplay(item.answer, item.questionType)}
                                    </Text>
                                </View>

                                {item.respondedBy && (
                                    <View style={styles.metaInfo}>
                                        <Ionicons
                                            name="person-outline"
                                            size={14}
                                            color={textMutedColor}
                                        />
                                        <Text style={[styles.metaText, { color: textMutedColor }]}>
                                            Usuario ID: {item.respondedBy}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <View
                    style={[
                        styles.infoBox,
                        { backgroundColor: cardColor, borderColor: borderColor },
                    ]}
                >
                    <Ionicons name="information-circle-outline" size={20} color={textColor} />
                    <Text style={[styles.infoText, { color: textSecondaryColor }]}>
                        {requesterId
                            ? "Estas son las respuestas de este solicitante específico al formulario que configuraste."
                            : "Estas son todas las respuestas al formulario que configuraste para esta publicación."}
                    </Text>
                </View>
            </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary,
    },
    backIconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
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
    loadingCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderColor: Colors.yellow,
    },
    loadingCardText: {
        marginLeft: 12,
        fontSize: 14,
        fontWeight: "500",
    },
    responsesContainer: {
        paddingHorizontal: 16,
    },
    responseCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    questionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    questionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    questionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 20,
    },
    answerContainer: {
        paddingLeft: 44,
        paddingTop: 8,
        paddingBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: Colors.yellow,
    },
    answerLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    answerText: {
        fontSize: 16,
        lineHeight: 22,
    },
    metaInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    metaText: {
        fontSize: 12,
        marginLeft: 4,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
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
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
})
