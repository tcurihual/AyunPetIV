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
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>ID de publicación inválido</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (user?.role !== 21) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="lock-closed-outline" size={48} color="#DC2626" />
                <Text style={styles.errorText}>Solo los dadores pueden ver las respuestas</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (loading && groupedResponses.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.yellow} />
                <Text style={styles.loadingText}>Cargando respuestas...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1C1C1C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Respuestas del formulario</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.petInfoCard}>
                    <Ionicons name="paw-outline" size={32} color={Colors.yellow} />
                    <View style={styles.petInfoText}>
                        <Text style={styles.petName}>{petName}</Text>
                        <Text style={styles.petSubtext}>
                            {groupedResponses.length} respuesta
                            {groupedResponses.length === 1 ? "" : "s"} recibida
                            {groupedResponses.length === 1 ? "" : "s"}
                        </Text>
                    </View>
                </View>

                {loading && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="small" color={Colors.yellow} />
                        <Text style={styles.loadingCardText}>Cargando datos...</Text>
                    </View>
                )}

                {postFormItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>No hay formulario configurado</Text>
                        <Text style={styles.emptyText}>
                            Esta publicación no tiene preguntas asociadas
                        </Text>
                    </View>
                ) : groupedResponses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>Sin respuestas</Text>
                        <Text style={styles.emptyText}>
                            {requesterId
                                ? "Este solicitante aún no ha respondido el formulario"
                                : "Cuando alguien solicite adopción y responda el formulario, las respuestas aparecerán aquí"}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.responsesContainer}>
                        {groupedResponses.map((item, index) => (
                            <View key={index} style={styles.responseCard}>
                                <View style={styles.questionHeader}>
                                    <View style={styles.questionIconContainer}>
                                        <Ionicons
                                            name={getTypeIcon(item.questionType)}
                                            size={20}
                                            color="#1C1C1C"
                                        />
                                    </View>
                                    <Text style={styles.questionText}>{item.questionContent}</Text>
                                </View>

                                <View style={styles.answerContainer}>
                                    <Text style={styles.answerLabel}>Respuesta:</Text>
                                    <Text style={styles.answerText}>
                                        {getAnswerDisplay(item.answer, item.questionType)}
                                    </Text>
                                </View>

                                {item.respondedBy && (
                                    <View style={styles.metaInfo}>
                                        <Ionicons name="person-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            Usuario ID: {item.respondedBy}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#1C1C1C" />
                    <Text style={styles.infoText}>
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
        backgroundColor: "#FFFEF7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.yellow,
        borderBottomWidth: 1,
        borderBottomColor: "#E0D0A0",
    },
    backIconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1C1C1C",
    },
    content: {
        flex: 1,
    },
    petInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    petInfoText: {
        marginLeft: 16,
        flex: 1,
    },
    petName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1C1C1C",
        marginBottom: 4,
    },
    petSubtext: {
        fontSize: 14,
        color: "#6B7280",
    },
    loadingCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF9E6",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.yellow,
    },
    loadingCardText: {
        marginLeft: 12,
        fontSize: 14,
        color: "#1C1C1C",
        fontWeight: "500",
    },
    responsesContainer: {
        paddingHorizontal: 16,
    },
    responseCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F0F0F0",
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
        backgroundColor: "#FFF9E6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.yellow,
    },
    questionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#1C1C1C",
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
        color: "#6B7280",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    answerText: {
        fontSize: 16,
        color: "#1C1C1C",
        lineHeight: 22,
    },
    metaInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F5F5F5",
    },
    metaText: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 4,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFF9E6",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.yellow,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#1C1C1C",
        marginLeft: 12,
        lineHeight: 18,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#6B7280",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFEF7",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6B7280",
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFEF7",
        padding: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "600",
        color: "#DC2626",
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
        color: "#1C1C1C",
        fontSize: 16,
        fontWeight: "600",
    },
})
