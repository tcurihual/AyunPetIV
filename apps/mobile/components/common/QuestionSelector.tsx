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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.yellow} />
                <Text style={styles.loadingText}>Cargando preguntas...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )
    }

    if (questions.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="help-circle-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay preguntas disponibles</Text>
                <Text style={styles.emptySubtext}>
                    Contacta al administrador para crear preguntas
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                disabled={disabled}
            >
                <View style={styles.headerLeft}>
                    <Ionicons name="list-outline" size={24} color="#1C1C1C" />
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
                    color="#6B7280"
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
                                    isSelected && styles.questionItemSelected,
                                    disabled && styles.questionItemDisabled,
                                ]}
                                onPress={() => toggleQuestion(question.id)}
                                disabled={disabled}
                            >
                                <View style={styles.questionItemLeft}>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxSelected,
                                        ]}
                                    >
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                        )}
                                    </View>
                                    <View style={styles.questionContent}>
                                        <Text
                                            style={[
                                                styles.questionText,
                                                isSelected && styles.questionTextSelected,
                                            ]}
                                        >
                                            {question.content}
                                        </Text>
                                        <View style={styles.questionMeta}>
                                            <Ionicons
                                                name={getQuestionTypeIcon(question.type)}
                                                size={14}
                                                color="#6B7280"
                                            />
                                            <Text style={styles.questionType}>
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
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Los adoptantes responderán estas preguntas al solicitar adopción
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFEF7",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0D0A0",
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
        color: "#1C1C1C",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    questionsList: {
        maxHeight: 300,
    },
    questionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#FFF9E6",
    },
    questionItemSelected: {
        backgroundColor: "#FFF9E6",
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
        borderColor: "#E0D0A0",
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
        color: "#1C1C1C",
        lineHeight: 20,
    },
    questionTextSelected: {
        fontWeight: "600",
        color: "#1C1C1C",
    },
    questionMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    questionType: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 4,
    },
    footer: {
        padding: 12,
        backgroundColor: "#FFF9E6",
        borderTopWidth: 1,
        borderTopColor: "#E0D0A0",
    },
    footerText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        fontStyle: "italic",
    },
    loadingContainer: {
        padding: 24,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: "#6B7280",
    },
    errorContainer: {
        padding: 24,
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FCA5A5",
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
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },
    emptySubtext: {
        marginTop: 4,
        fontSize: 13,
        color: "#9CA3AF",
        textAlign: "center",
    },
})
