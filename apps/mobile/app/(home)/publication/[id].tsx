import React, { useEffect, useMemo, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import Animated from "react-native-reanimated"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CommentCard, type Comment } from "@common/CommentCard"
import { MessageFormSchema } from "@/utils/schemas"
import { z } from "zod"
import Input from "@ui/Input"
import ReportModal from "@common/modals/ReportModal"
import { getLocalPets } from "@/services/petStorage"
import { Pet } from "@/interfaces/pet"
import { toMediaUrl } from "@/utils/mediaUrl"
import { usePublicationContext } from "@/context/PublicationContext"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"
import type { PublicationItem } from "@/context/PublicationContext"
import { translateSpeciesToSpanish, translateGenderToSpanish } from "@/utils/petTranslations"

type MessageFormData = z.infer<typeof MessageFormSchema>

const { width, height } = Dimensions.get("window")

const isLocalId = (id: string) => id.startsWith("local-")

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
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const [comments, setComments] = useState<Comment[]>(mockComments)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)
    const [reportType, setReportType] = useState<"comment" | "publication">("comment")
    const [loading, setLoading] = useState(true)
    const [pet, setPet] = useState<Pet | null>(null)
    const { publications, getPublicationByPostId } = usePublicationContext()
    const { createAdoptionRequest } = useAdoptionRequestContext()

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<MessageFormData>({
        resolver: zodResolver(MessageFormSchema),
        defaultValues: {
            creatorId: 1, // Mock user ID
            postId: Number(String(id).replace("local-", "")) || 0,
            description: "",
        },
    })

    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestMessage, setRequestMessage] = useState("")
    const [submittingRequest, setSubmittingRequest] = useState(false)
    const [requestError, setRequestError] = useState<string | null>(null)

    const publicationFromContext = useMemo(() => {
        if (!id || isLocalId(id)) return null
        const numericId = Number(id)
        if (!Number.isFinite(numericId)) return null
        return (
            publications.find(
                (pub) => Number(pub.postId ?? pub.id) === numericId || String(pub.id) === String(id)
            ) ?? null
        )
    }, [id, publications])

    const formatAge = (age?: string | number | null) => {
        // Si viene vacío o indefinido
        if (!age || age === "undefined" || age === "null") return "Desconocida"

        // Si viene como cadena no numérica
        if (typeof age === "string") {
            const numericAge = Number(age)
            if (isNaN(numericAge)) {
                // si la cadena no es número (ej: "Cachorro"), devuélvela tal cual
                return age.trim().length > 0 ? age : "Desconocida"
            }
            age = numericAge
        }

        // A esta altura, age es número
        if (typeof age === "number") {
            if (age <= 0) return "Cachorro"
            if (age === 1) return "1 año"
            if (age > 1) return `${age} años`
        }

        return "Desconocida"
    }

    const mapPublicationToPet = React.useCallback((pub: PublicationItem): Pet => {
        const imageSource =
            typeof pub.image === "string"
                ? { uri: pub.image }
                : pub.image && (pub.image as any).uri
                ? { uri: (pub.image as any).uri }
                : pub.image || { uri: "https://placehold.co/800x600?text=Mascota" }

        // 🔹 Extraer años y meses si existen (ya sea en PublicationItem o si vienen del backend)
        const years =
            Number((pub as any).age_years ?? 0) ||
            (typeof pub.age === "string" && pub.age.includes("año") ? parseInt(pub.age) : 0)
        const months =
            Number((pub as any).age_months ?? 0) ||
            (typeof pub.age === "string" && pub.age.includes("mes") ? parseInt(pub.age) : 0)

        // 🔹 Construir texto de edad consistente
        const totalAge =
            years > 0 && months > 0
                ? `${years} ${years === 1 ? "año" : "años"} y ${months} ${
                      months === 1 ? "mes" : "meses"
                  }`
                : years > 0
                ? `${years} ${years === 1 ? "año" : "años"}`
                : months > 0
                ? `${months} ${months === 1 ? "mes" : "meses"}`
                : "Desconocida"

        return {
            id: String(pub.postId ?? pub.id),
            name: pub.name ?? "Sin nombre",
            gender: pub.gender ?? "",
            age: totalAge,
            publisher: pub.publisher ?? "Usuario",
            description: pub.description ?? "",
            image: imageSource,
            type: pub.type ?? pub.species ?? "",
        }
    }, [])

    useEffect(() => {
        let alive = true
        ;(async () => {
            try {
                setLoading(true)

                if (!id) return

                if (isLocalId(id)) {
                    const locals = await getLocalPets()
                    const raw = locals.find((p) => `local-${p.id}` === id)
                    if (raw) {
                        const url =
                            toMediaUrl(raw.imageUrls?.[0]) ||
                            "https://placehold.co/800x600?text=Mascota"
                        const petObj: Pet = {
                            id,
                            name: raw.name,
                            gender: raw.gender,
                            age: raw.ageYears ? `${raw.ageYears} años` : "Desconocida", // 👈 corregido
                            publisher: raw.ownerName || "Yo",
                            description: raw.description ?? "",
                            image: { uri: url },
                            type: raw.type || raw.species || "",
                        }
                        if (alive) setPet(petObj)
                    } else if (alive) {
                        setPet(null)
                    }
                } else {
                    const numericId = Number(id)
                    if (!Number.isFinite(numericId)) {
                        if (alive) setPet(null)
                        return
                    }

                    const source =
                        publicationFromContext || (await getPublicationByPostId(numericId))
                    if (!alive) return

                    if (source) {
                        setPet(mapPublicationToPet(source))
                    } else {
                        setPet(null)
                    }
                }
            } catch (e) {
                console.error("Error loading publication detail:", e)
                if (alive) setPet(null)
            } finally {
                if (alive) setLoading(false)
            }
        })()
        return () => {
            alive = false
        }
    }, [id, getPublicationByPostId, mapPublicationToPet, publicationFromContext])

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

    const canSendRequest = pet ? Number.isFinite(Number(pet.id)) : false

    const handleOpenRequestModal = () => {
        if (!canSendRequest) {
            Alert.alert(
                "No disponible",
                "Esta publicación es local, no se puede enviar solicitud de adopción."
            )
            return
        }

        router.push({
            pathname: "/adoption-request-form" as any,
            params: {
                postId: String(pet?.id || id),
                petName: pet?.name || "esta mascota",
            },
        })
    }

    const handleSubmitAdoptionRequest = async () => {
        if (!pet) return
        const postId = Number(pet.id)
        if (!Number.isFinite(postId)) return

        setSubmittingRequest(true)
        setRequestError(null)
        try {
            await createAdoptionRequest({
                postid: postId,
                message: requestMessage.trim() ? requestMessage.trim() : undefined,
            })
            Alert.alert("Solicitud enviada", "Tu solicitud de adopción fue enviada correctamente.")
            setShowRequestModal(false)
            setRequestMessage("")
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || "No se pudo enviar la solicitud"
            setRequestError(msg)
        } finally {
            setSubmittingRequest(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.gray}>Cargando publicación…</Text>
            </View>
        )
    }

    if (!pet) {
        return (
            <View style={styles.center}>
                <Text style={styles.empty}>Publicación no encontrada</Text>
            </View>
        )
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
                                        Especie:{" "}
                                        <Text style={styles.infoValue}>
                                            {translateSpeciesToSpanish((pet as any).type || "")}
                                        </Text>
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Género:{" "}
                                        <Text style={styles.infoValue}>
                                            {translateGenderToSpanish(pet.gender || "")}
                                        </Text>
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Edad:{" "}
                                        <Text style={styles.infoValue}>{formatAge(pet.age)}</Text>
                                    </Text>
                                </View>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.infoLabel}>Publicado por:</Text>
                                    <Text style={styles.publisherName}>{pet.publisher}</Text>
                                </View>
                            </View>

                            {pet.description ? (
                                <View style={styles.descriptionContainer}>
                                    <Text style={styles.descriptionLabel}>Descripción: </Text>
                                    <Text style={styles.descriptionText}>{pet.description}</Text>
                                </View>
                            ) : null}

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
                                <TouchableOpacity
                                    style={[
                                        styles.sendRequestButton,
                                        !canSendRequest && styles.sendRequestButtonDisabled,
                                    ]}
                                    onPress={handleOpenRequestModal}
                                    disabled={!canSendRequest}
                                >
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
                onClose={() => {
                    setShowReportModal(false)
                    setReportingCommentId(null)
                }}
                onSubmit={handleSubmitReport}
                title={reportType === "comment" ? "Reportar Comentario" : "Reportar Publicación"}
            />

            <Modal
                visible={showRequestModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (!submittingRequest) {
                        setShowRequestModal(false)
                        setRequestError(null)
                    }
                }}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enviar Solicitud de Adopción</Text>
                        <Text style={styles.modalSubtitle}>
                            Agrega un mensaje para el cuidador si lo deseas.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Escribe tu mensaje..."
                            multiline
                            numberOfLines={4}
                            value={requestMessage}
                            onChangeText={setRequestMessage}
                            editable={!submittingRequest}
                        />
                        {requestError ? (
                            <Text style={styles.modalError}>{requestError}</Text>
                        ) : null}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    if (!submittingRequest) {
                                        setShowRequestModal(false)
                                        setRequestError(null)
                                    }
                                }}
                                disabled={submittingRequest}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalConfirmButton,
                                    submittingRequest && styles.modalConfirmButtonDisabled,
                                ]}
                                onPress={handleSubmitAdoptionRequest}
                                disabled={submittingRequest}
                            >
                                <Text style={styles.modalConfirmText}>
                                    {submittingRequest ? "Enviando..." : "Enviar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

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
    commentButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    commentsList: { gap: 12 },
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
    sendRequestButtonDisabled: { opacity: 0.6 },
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
    gray: { color: "#6b7280", marginTop: 8 },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#222" },
    modalSubtitle: { fontSize: 14, color: "#555", marginTop: 8, marginBottom: 12 },
    modalInput: {
        backgroundColor: "#F8F8F8",
        borderRadius: 8,
        padding: 12,
        textAlignVertical: "top",
        minHeight: 100,
        fontSize: 14,
        color: "#333",
    },
    modalError: { color: "#C0392B", marginTop: 8 },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
    modalCancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#E5E7EB",
        marginRight: 12,
    },
    modalCancelText: { color: "#333", fontWeight: "600" },
    modalConfirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        backgroundColor: "#7c3aed",
    },
    modalConfirmButtonDisabled: { opacity: 0.7 },
    modalConfirmText: { color: "#fff", fontWeight: "700" },
})
