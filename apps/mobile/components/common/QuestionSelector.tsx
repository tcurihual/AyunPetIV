import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native"
import { useQuestionContext } from "@/context/QuestionContext"
import { useAuthContext } from "@/context/AuthContext"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useThemeColor } from "@/hooks/useThemeColor"

interface QuestionSelectorProps {
    selectedIds: number[]
    onSelectionChange: (ids: number[]) => void
    disabled?: boolean
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
    selectedIds,
    onSelectionChange,
    disabled = false,
}) => {
    const { questions, loading, error, getQuestions } = useQuestionContext()
    const { user } = useAuthContext()
    const [expanded, setExpanded] = useState(false)

    // Theme colors
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const borderColor = useThemeColor({}, "border")
    const bgSecondaryColor = useThemeColor({}, "backgroundSecondary")

    useEffect(() => {
        // Cargar todas las preguntas solo cuando el usuario esté disponible
        console.log(
            "🎯 QuestionSelector: useEffect triggered, user:",
            user ? `ID ${user.id}, role ${user.role}` : "null"
        )

        if (!user) {
            console.log("🎯 QuestionSelector: Waiting for user to be authenticated...")
            return
        }

        console.log("🎯 QuestionSelector: User authenticated, loading questions...")
        const loadQuestions = async () => {
            try {
                await getQuestions()
                console.log("🎯 QuestionSelector: getQuestions() completed")
            } catch (error) {
                console.error("🎯 QuestionSelector: Error loading questions:", error)
            }
        }
        loadQuestions()
    }, [user])

    useEffect(() => {
        console.log("🎯 QuestionSelector: State updated -", {
            loading,
            error,
            questionsCount: questions.length,
            questions,
        })
    }, [loading, error, questions])

    const toggleQuestion = (id: number) => {
        if (disabled) return

        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((qId) => qId !== id))
        } else {
            onSelectionChange([...selectedIds, id])
        }
    }

    const getQuestionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            text: "Texto",
            number: "Número",
            boolean: "Sí/No",
            select: "Selección única",
            multiselect: "Selección múltiple",
        }
        return types[type] || type
    }

    const getQuestionTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            text: "text-outline",
            number: "keypad-outline",
            boolean: "toggle-outline",
            select: "radio-button-on-outline",
            multiselect: "checkbox-outline",
        }
        return icons[type] || "help-outline"
    }

    if (loading && questions.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: cardColor }]}>
                <ActivityIndicator size="small" color={Colors.yellow} />
                <Text style={[styles.loadingText, { color: textSecondaryColor }]}>Cargando preguntas...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: cardColor, borderColor }]}>
                <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )
    }

    if (questions.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: cardColor }]}>
                <Ionicons name="help-circle-outline" size={48} color={textMutedColor} />
                <Text style={[styles.emptyText, { color: textSecondaryColor }]}>No hay preguntas disponibles</Text>
                <Text style={[styles.emptySubtext, { color: textMutedColor }]}>
                    Contacta al administrador para crear preguntas
                </Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: cardColor, borderColor }]}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                disabled={disabled}
            >
                <View style={styles.headerLeft}>
                    <Ionicons name="list-outline" size={24} color="#000" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Formulario de adopción</Text>
                        <Text style={styles.headerSubtitle}>
                            {selectedIds.length}{" "}
                            {selectedIds.length === 1 ? "pregunta" : "preguntas"} seleccionada
                            {selectedIds.length === 1 ? "" : "s"}
                        </Text>
                    </View>
                </View>
                <Ionicons
                    name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
                    size={24}
                    color="#000"
                />
            </TouchableOpacity>

            {expanded && (
                <ScrollView style={styles.questionsList} nestedScrollEnabled>
                    {questions.map((question) => {
                        const isSelected = selectedIds.includes(question.id)
                        return (
                            <TouchableOpacity
                                key={question.id}
                                style={[
                                    styles.questionItem,
                                    { borderBottomColor: borderColor },
                                    isSelected && [styles.questionItemSelected, { backgroundColor: bgSecondaryColor }],
                                    disabled && styles.questionItemDisabled,
                                ]}
                                onPress={() => toggleQuestion(question.id)}
                                disabled={disabled}
                            >
                                <View style={styles.questionItemLeft}>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            { borderColor },
                                            isSelected && styles.checkboxSelected,
                                        ]}
                                    >
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={16} color="#000" />
                                        )}
                                    </View>
                                    <View style={styles.questionContent}>
                                        <Text
                                            style={[
                                                styles.questionText,
                                                { color: textColor },
                                                isSelected && styles.questionTextSelected,
                                            ]}
                                        >
                                            {question.content}
                                        </Text>
                                        <View style={styles.questionMeta}>
                                            <Ionicons
                                                name={getQuestionTypeIcon(question.type)}
                                                size={14}
                                                color={textMutedColor}
                                            />
                                            <Text style={[styles.questionType, { color: textMutedColor }]}>
                                                {getQuestionTypeLabel(question.type)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            )}

            {expanded && selectedIds.length > 0 && (
                <View style={[styles.footer, { backgroundColor: bgSecondaryColor, borderTopColor: borderColor }]}>
                    <Text style={[styles.footerText, { color: textSecondaryColor }]}>
                        Los adoptantes responderán estas preguntas al solicitar adopción
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 8,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: Colors.yellow,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
        color: "#000",
        opacity: 0.7,
    },
    questionsList: {
        maxHeight: 300,
    },
    questionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 12,
        borderBottomWidth: 1,
    },
    questionItemSelected: {
        // backgroundColor aplicado inline
    },
    questionItemDisabled: {
        opacity: 0.5,
    },
    questionItemLeft: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        marginTop: 2,
    },
    checkboxSelected: {
        backgroundColor: Colors.yellow,
        borderColor: Colors.yellow,
    },
    questionContent: {
        flex: 1,
    },
    questionText: {
        fontSize: 15,
        lineHeight: 20,
    },
    questionTextSelected: {
        fontWeight: "600",
    },
    questionMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    questionType: {
        fontSize: 12,
        marginLeft: 4,
    },
    footer: {
        padding: 12,
        borderTopWidth: 1,
    },
    footerText: {
        fontSize: 12,
        textAlign: "center",
        fontStyle: "italic",
    },
    loadingContainer: {
        padding: 24,
        alignItems: "center",
        borderRadius: 12,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
    },
    errorContainer: {
        padding: 24,
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: "#DC2626",
        textAlign: "center",
    },
    emptyContainer: {
        padding: 32,
        alignItems: "center",
        borderRadius: 12,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "600",
    },
    emptySubtext: {
        marginTop: 4,
        fontSize: 13,
        textAlign: "center",
    },
})
