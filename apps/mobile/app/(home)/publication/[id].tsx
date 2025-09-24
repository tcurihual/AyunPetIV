import React, { useMemo, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    TextInput,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import Animated from "react-native-reanimated"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ayunData from "@/data/mockData"
import { CommentCard, type Comment } from "@common/CommentCard"
import { MessageFormSchema } from "@/utils/schemas"
import { z } from "zod"
import Input from "@ui/Input"
import ReportModal from "@common/modals/ReportModal"

type MessageFormData = z.infer<typeof MessageFormSchema>

// Mock comments data
const mockComments: Comment[] = [
    {
        id: "1",
        ownerName: "María González",
        ownerAvatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
        createdAt: "2024-01-15T10:30:00Z",
        text: "¡Qué hermoso! Me encantaría adoptarlo. ¿Está disponible aún?",
    },
    {
        id: "2",
        ownerName: "Carlos Ruiz",
        createdAt: "2024-01-14T15:45:00Z",
        text: "Se ve muy tierno. ¿Es bueno con otros perros?",
    },
]

export default function PublicationDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const [comments, setComments] = useState<Comment[]>(mockComments)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)
    const [reportType, setReportType] = useState<"comment" | "publication">("comment")

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<MessageFormData>({
        resolver: zodResolver(MessageFormSchema),
        defaultValues: {
            creatorId: 1, // Mock user ID
            postId: Number(id) || 1,
            description: "",
        },
    })

    const onSubmitComment = async (data: MessageFormData) => {
        try {
            const newComment: Comment = {
                id: String(comments.length + 1),
                ownerName: "Usuario Actual",
                createdAt: new Date().toISOString(),
                text: data.description,
            }
            setComments((prev) => [...prev, newComment])
            reset()
        } catch (error) {
            console.error("Error adding comment:", error)
        }
    }

    const handleReport = (commentId: string) => {
        setReportingCommentId(commentId)
        setReportType("comment")
        setShowReportModal(true)
    }

    const handleReportPublication = () => {
        setReportType("publication")
        setShowReportModal(true)
    }

    const handleSubmitReport = async (description: string) => {
        try {
            if (reportType === "comment") {
                console.log("Reporting comment:", reportingCommentId, "Reason:", description)
            } else {
                console.log("Reporting publication:", id, "Reason:", description)
            }

            alert(
                `Reporte de ${
                    reportType === "comment" ? "comentario" : "publicación"
                } enviado correctamente`
            )
        } catch (error) {
            console.error("Error sending report:", error)
            alert("Error al enviar el reporte")
        } finally {
            setShowReportModal(false)
            setReportingCommentId(null)
        }
    }

    const handleCloseReport = () => {
        setShowReportModal(false)
        setReportingCommentId(null)
    }

    const raw = useMemo(() => {
        return (ayunData.pet ?? []).find((p) => String(p.id) === String(id))
    }, [id])

    const publisherName = useMemo(() => {
        if (!raw) return "Fundación Demo"
        const u = (ayunData.users ?? []).find((x) => x.id === raw.ownerid)
        return u?.name ?? u?.email ?? "Fundación Demo"
    }, [raw])

    if (!raw) {
        return (
            <View style={styles.center}>
                <Text style={styles.empty}>Publicación no encontrada</Text>
            </View>
        )
    }

    const pet = {
        id: String(raw.id),
        name: raw.name,
        gender: raw.gender,
        age: `${raw.age} años`,
        publisher: publisherName,
        description: raw.description,
        image: raw.image,
        species: raw.species,
    }

    return (
        <View style={styles.screenContainer}>
            <Animated.View style={styles.container} sharedTransitionTag={`pet-card-${pet.id}`}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.infoContainer}>
                        <View style={styles.imageContainer}>
                            <Animated.Image
                                source={
                                    typeof pet.image === "string" ? { uri: pet.image } : pet.image
                                }
                                style={styles.mainImage}
                                resizeMode="cover"
                                sharedTransitionTag={`pet-image-${pet.id}`}
                            />
                        </View>

                        <View style={styles.infoContainer}>
                            <Animated.Text
                                style={styles.petName}
                                sharedTransitionTag={`pet-name-${pet.id}`}
                            >
                                Nombre: {pet.name}
                            </Animated.Text>

                            <View style={styles.infoRow}>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.infoLabel}>
                                        Género: <Text style={styles.infoValue}>{pet.gender}</Text>
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Raza/Tipo:{" "}
                                        <Text style={styles.infoValue}>{pet.species}</Text>
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Edad: <Text style={styles.infoValue}>{pet.age}</Text>
                                    </Text>
                                </View>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.infoLabel}>Publicado por:</Text>
                                    <Text style={styles.publisherName}>{pet.publisher}</Text>
                                </View>
                            </View>

                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionLabel}>Descripción: </Text>
                                <Text style={styles.descriptionText}>{pet.description}</Text>
                            </View>

                            <View style={styles.commentsContainer}>
                                <Text style={styles.commentsTitle}>
                                    Comentarios ({comments.length})
                                </Text>

                                <View style={styles.commentForm}>
                                    <Input
                                        name="description"
                                        control={control}
                                        label="Agregar comentario"
                                        placeholder="Escribe tu comentario..."
                                        inputProps={{
                                            multiline: true,
                                            numberOfLines: 3,
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={styles.commentButton}
                                        onPress={handleSubmit(onSubmitComment)}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.commentButtonText}>
                                            {isSubmitting ? "Enviando..." : "Comentar"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {comments.length > 0 ? (
                                    <View style={styles.commentsList}>
                                        {comments.map((comment) => (
                                            <CommentCard
                                                key={comment.id}
                                                comment={comment}
                                                onReport={handleReport}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.commentsPlaceholder}>
                                        <Text style={styles.commentsPlaceholderText}>
                                            Sé el primero en comentar...
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.sendRequestButton}>
                                    <Text style={styles.sendRequestButtonText}>
                                        Enviar Solicitud
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={handleReportPublication}
                                >
                                    <Text style={styles.reportButtonText}>
                                        Reportar Publicación
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>

            <ReportModal
                visible={showReportModal}
                onClose={handleCloseReport}
                onSubmit={handleSubmitReport}
                title={reportType === "comment" ? "Reportar Comentario" : "Reportar Publicación"}
            />
        </View>
    )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: "#fff", padding: 16 },
    container: {
        flex: 1,
        backgroundColor: "#EFEFEF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    imageContainer: {
        marginTop: "-10%",
        marginLeft: "-10%",
        width: width * 1,
        height: height * 0.4,
    },
    mainImage: { width: "100%", height: "100%" },
    infoContainer: { padding: 20, flex: 1 },
    petName: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 16 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    infoColumn: { flex: 1 },
    infoLabel: { fontSize: 14, color: "#222", marginBottom: 8, fontWeight: "500" },
    infoValue: { fontWeight: "normal", color: "#666" },
    publisherName: { fontSize: 14, color: "#666", fontWeight: "400" },
    descriptionContainer: { marginTop: 12, marginBottom: 24 },
    descriptionLabel: { fontSize: 14, fontWeight: "500", color: "#222", marginBottom: 4 },
    descriptionText: { fontSize: 14, color: "#666", lineHeight: 20, textAlign: "justify" },
    commentsContainer: { marginTop: 8 },
    commentsTitle: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 12 },
    commentForm: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: "#F9F9F9",
        borderRadius: 8,
    },
    commentButton: {
        backgroundColor: "#7c3aed",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: "center",
        marginTop: 8,
    },
    commentButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    commentsList: {
        gap: 12,
    },
    commentsPlaceholder: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
    },
    commentsPlaceholderText: { fontSize: 14, color: "#999", fontStyle: "italic" },
    buttonContainer: { marginTop: 30, marginBottom: 20, paddingHorizontal: 20 },
    sendRequestButton: {
        backgroundColor: "#FFD700",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    sendRequestButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
    reportButton: {
        backgroundColor: "transparent",
        borderColor: "#ff4444",
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    reportButtonText: { fontSize: 14, fontWeight: "500", color: "#ff4444" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
    empty: { color: "#333" },
})
