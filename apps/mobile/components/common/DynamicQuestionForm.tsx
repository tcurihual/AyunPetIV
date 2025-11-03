import React, { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { PostFormItem } from "@/context/PostFormContext"
import { Colors } from "@/constants/Colors"

export interface QuestionAnswer {
    id_post_form: number
    answer: string
}

interface DynamicQuestionFormProps {
    postFormItems: PostFormItem[]
    onSubmit: (answers: QuestionAnswer[]) => Promise<void>
    submitButtonText?: string
    disabled?: boolean
    headerComponent?: React.ReactNode
}

export const DynamicQuestionForm: React.FC<DynamicQuestionFormProps> = ({
    postFormItems,
    onSubmit,
    submitButtonText = "Enviar respuestas",
    disabled = false,
    headerComponent,
}) => {
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [errors, setErrors] = useState<Record<number, string>>({})
    const [submitting, setSubmitting] = useState(false)

    const updateAnswer = (postFormId: number, value: string) => {
        setAnswers((prev) => ({ ...prev, [postFormId]: value }))
        if (errors[postFormId]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[postFormId]
                return newErrors
            })
        }
    }

    const validateAnswers = (): boolean => {
        const newErrors: Record<number, string> = {}

        postFormItems.forEach((item) => {
            const answer = answers[item.id]?.trim()

            if (!answer) {
                newErrors[item.id] = "Esta pregunta es obligatoria"
                return
            }

            if (item.question.type === "number") {
                if (isNaN(Number(answer))) {
                    newErrors[item.id] = "Debe ser un número válido"
                }
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateAnswers()) {
            return
        }

        setSubmitting(true)
        try {
            const formattedAnswers: QuestionAnswer[] = postFormItems.map((item) => ({
                id_post_form: item.id,
                answer: answers[item.id]?.trim() || "",
            }))

            await onSubmit(formattedAnswers)
        } catch (error) {
            console.error("Error al enviar respuestas:", error)
        } finally {
            setSubmitting(false)
        }
    }

    const renderQuestionInput = (item: PostFormItem) => {
        const answer = answers[item.id] || ""
        const error = errors[item.id]

        switch (item.question.type) {
            case "text":
                return (
                    <TextInput
                        style={[styles.textInput, error && styles.inputError]}
                        value={answer}
                        onChangeText={(value) => updateAnswer(item.id, value)}
                        placeholder="Escribe tu respuesta..."
                        multiline
                        numberOfLines={3}
                        editable={!disabled && !submitting}
                    />
                )

            case "number":
                return (
                    <TextInput
                        style={[styles.textInput, error && styles.inputError]}
                        value={answer}
                        onChangeText={(value) => updateAnswer(item.id, value)}
                        placeholder="Ingresa un número..."
                        keyboardType="numeric"
                        editable={!disabled && !submitting}
                    />
                )

            case "boolean":
                return (
                    <View style={styles.booleanContainer}>
                        <TouchableOpacity
                            style={[
                                styles.booleanOption,
                                answer === "true" && styles.booleanOptionSelected,
                            ]}
                            onPress={() => updateAnswer(item.id, "true")}
                            disabled={disabled || submitting}
                        >
                            <Ionicons
                                name={answer === "true" ? "checkmark-circle" : "ellipse-outline"}
                                size={24}
                                color={answer === "true" ? "#34C759" : "#9CA3AF"}
                            />
                            <Text
                                style={[
                                    styles.booleanText,
                                    answer === "true" && styles.booleanTextSelected,
                                ]}
                            >
                                Sí
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.booleanOption,
                                answer === "false" && styles.booleanOptionSelected,
                            ]}
                            onPress={() => updateAnswer(item.id, "false")}
                            disabled={disabled || submitting}
                        >
                            <Ionicons
                                name={answer === "false" ? "close-circle" : "ellipse-outline"}
                                size={24}
                                color={answer === "false" ? "#DC2626" : "#9CA3AF"}
                            />
                            <Text
                                style={[
                                    styles.booleanText,
                                    answer === "false" && styles.booleanTextSelected,
                                ]}
                            >
                                No
                            </Text>
                        </TouchableOpacity>
                    </View>
                )

            case "select":
            case "multiselect":
                return (
                    <TextInput
                        style={[styles.textInput, error && styles.inputError]}
                        value={answer}
                        onChangeText={(value) => updateAnswer(item.id, value)}
                        placeholder="Escribe tu respuesta..."
                        editable={!disabled && !submitting}
                    />
                )

            default:
                return (
                    <TextInput
                        style={[styles.textInput, error && styles.inputError]}
                        value={answer}
                        onChangeText={(value) => updateAnswer(item.id, value)}
                        placeholder="Escribe tu respuesta..."
                        editable={!disabled && !submitting}
                    />
                )
        }
    }

    const getQuestionIcon = (type: string) => {
        const icons: Record<string, any> = {
            text: "text-outline",
            number: "keypad-outline",
            boolean: "toggle-outline",
            select: "radio-button-on-outline",
            multiselect: "checkbox-outline",
        }
        return icons[type] || "help-outline"
    }

    if (postFormItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay preguntas para responder</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.questionsContainer}>
                {headerComponent && <>{headerComponent}</>}

                <View style={styles.formHeader}>
                    <Ionicons name="clipboard-outline" size={24} color="#1C1C1C" />
                    <Text style={styles.headerTitle}>Formulario de adopción</Text>
                </View>

                {postFormItems.map((item, index) => (
                    <View key={item.id} style={styles.questionCard}>
                        <View style={styles.questionHeader}>
                            <View style={styles.questionNumberContainer}>
                                <Text style={styles.questionNumber}>{index + 1}</Text>
                            </View>
                            <View style={styles.questionTitleContainer}>
                                <Text style={styles.questionText}>{item.question.content}</Text>
                                <View style={styles.questionMeta}>
                                    <Ionicons
                                        name={getQuestionIcon(item.question.type)}
                                        size={14}
                                        color="#6B7280"
                                    />
                                    <Text style={styles.requiredBadge}>Obligatoria</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.answerContainer}>
                            {renderQuestionInput(item)}
                            {errors[item.id] && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                    <Text style={styles.errorText}>{errors[item.id]}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={[
                    styles.submitButton,
                    (disabled || submitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={disabled || submitting}
            >
                {submitting ? (
                    <>
                        <Ionicons name="sync-outline" size={20} color="#1C1C1C" />
                        <Text style={styles.submitButtonText}>Enviando...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="send-outline" size={20} color="#1C1C1C" />
                        <Text style={styles.submitButtonText}>{submitButtonText}</Text>
                    </>
                )}
            </TouchableOpacity>
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
        padding: 16,
        backgroundColor: "#FFF9E6",
        borderBottomWidth: 1,
        borderBottomColor: "#E0D0A0",
    },
    formHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFF9E6",
        borderBottomWidth: 1,
        borderBottomColor: "#E0D0A0",
        marginBottom: 16,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1C1C1C",
        marginLeft: 12,
    },
    questionsContainer: {
        flex: 1,
        padding: 16,
    },
    questionCard: {
        backgroundColor: "#FFF9E6",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0D0A0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    questionHeader: {
        flexDirection: "row",
        marginBottom: 12,
    },
    questionNumberContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.yellow,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1C1C1C",
    },
    questionTitleContainer: {
        flex: 1,
    },
    questionText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1C1C1C",
        lineHeight: 22,
        marginBottom: 6,
    },
    questionMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    requiredBadge: {
        fontSize: 12,
        color: "#DC2626",
        marginLeft: 6,
        fontWeight: "500",
    },
    answerContainer: {
        marginTop: 8,
    },
    textInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0D0A0",
        padding: 12,
        fontSize: 15,
        color: "#1C1C1C",
        minHeight: 44,
    },
    inputError: {
        borderColor: "#DC2626",
        backgroundColor: "#FEF2F2",
    },
    booleanContainer: {
        flexDirection: "row",
        gap: 12,
    },
    booleanOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#E0D0A0",
        backgroundColor: "#FFFFFF",
    },
    booleanOptionSelected: {
        borderColor: Colors.yellow,
        backgroundColor: "#FFF9E6",
    },
    booleanText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#6B7280",
        marginLeft: 8,
    },
    booleanTextSelected: {
        color: "#1C1C1C",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    errorText: {
        fontSize: 13,
        color: "#DC2626",
        marginLeft: 4,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.yellow,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: Colors.yellow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#E0D0A0",
        shadowOpacity: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1C1C1C",
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
})
