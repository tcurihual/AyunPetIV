import React, { useEffect, useState } from "react"
import {
    View,
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import RequestDetailCard, { Status } from "@/components/common/RequestDetailCard"
import { http } from "@/services/http"
import { useAuthContext } from "@/context/AuthContext"
import { usePublicationContext } from "@/context/PublicationContext"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

export default function ShelterRequestDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const { user } = useAuthContext()
    const { refreshRequests, updateAdoptionRequest, acceptAdoptionRequest, validateAdoptionCode } =
        useAdoptionRequestContext()
    const { getPublicationByPostId } = usePublicationContext()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [request, setRequest] = useState<any | null>(null)
    const [resolvedPetPhoto, setResolvedPetPhoto] = useState<string | null>(null)
    const [resolvedPetName, setResolvedPetName] = useState<string | null>(null)
    const [editableMessage, setEditableMessage] = useState<string>("")
    const [savingMessage, setSavingMessage] = useState(false)
    const [messageError, setMessageError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            if (!id) return
            setLoading(true)
            setError(null)
            try {
                const resp = await http.get(`/v1/adoptions/adoption-requests/${id}`)
                const raw = resp.data

                let reqObj: any = null
                if (!raw) {
                    reqObj = null
                } else if (raw.values && raw.values.adoption_request) {
                    reqObj = raw.values.adoption_request
                } else if (raw.adoption_request) {
                    reqObj = raw.adoption_request
                } else if (raw.data) {
                    if (Array.isArray(raw.data)) {
                        reqObj = raw.data[0] ?? null
                    } else {
                        reqObj = raw.data.adoption_request ?? raw.data
                    }
                } else {
                    reqObj = raw
                }

                setRequest(reqObj)
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Error al obtener solicitud")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [id])

    useEffect(() => {
        let mounted = true
        async function resolvePublication() {
            if (!request) return
            if (!resolvedPetPhoto) {
                const img =
                    (request.postImages && request.postImages[0]) ||
                    (request.petImages && request.petImages[0]) ||
                    null
                if (img) setResolvedPetPhoto(img)
            }
            if (!resolvedPetName) {
                const n =
                    request.post?.pet?.name ||
                    request.post?.title ||
                    request.post_title ||
                    request.title ||
                    request.pet?.name ||
                    null
                if (n) setResolvedPetName(n)
            }
            if (resolvedPetName && resolvedPetPhoto) return
            const postId = request.post_id || request.post?.id
            if (!postId) return
            try {
                const pub = await getPublicationByPostId(Number(postId))
                if (!mounted) return
                if (pub) {
                    if (!resolvedPetName && pub.name) setResolvedPetName(pub.name)
                    if (!resolvedPetPhoto && pub.image && (pub.image as any).uri)
                        setResolvedPetPhoto((pub.image as any).uri)
                }
            } catch (e) {}
        }

        resolvePublication()

        return () => {
            mounted = false
        }
    }, [request, resolvedPetName, resolvedPetPhoto])

    const requesterName =
        request?.user?.name ||
        request?.requester_name ||
        request?.requester ||
        request?.requester_fullname ||
        (request?.requester_id ? `Usuario ${request.requester_id}` : "--")

    const rawDate = request?.createdAt || request?.createdat || request?.created_at
    const date = rawDate ? new Date(rawDate).toLocaleString() : "--"

    const message =
        request?.message ||
        request?.adoption_request?.message ||
        request?.values?.adoption_request?.message ||
        request?.values?.message ||
        request?.data?.message ||
        ""

    useEffect(() => {
        setEditableMessage(message ?? "")
    }, [message])

    const statusLabel = (() => {
        const status = request?.status
        if (!status) return "Pendiente"
        if (status === "approved" || status === "accepted") return "Aceptada"
        if (status === "completed") return "Completada"
        if (status === "rejected") return "Rechazada"
        return "Pendiente"
    })() as Status

    const handleAccept = async () => {
        if (!request) return
        try {
            const result = await acceptAdoptionRequest(Number(request.id))
            await refreshRequests()
            setRequest((prev: any) => (prev ? { ...prev, status: "approved" } : prev))

            const confirmationCode = result?.confirmationCode
            const serverMessage = result?.message

            if (serverMessage || confirmationCode) {
                const messageLines = [
                    serverMessage,
                    confirmationCode ? `Código: ${confirmationCode}` : null,
                ]
                    .filter(Boolean)
                    .join("\n")
                Alert.alert("Solicitud aceptada", messageLines || "Solicitud aceptada")
            } else {
                Alert.alert("Solicitud aceptada")
            }

            router.replace("/(shelter)/requests")
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || e?.message || "No se pudo aceptar")
        }
    }

    const handleReject = async () => {
        try {
            await updateAdoptionRequest(Number(request?.id), { status: "rejected" })
            await refreshRequests()
            Alert.alert("Solicitud rechazada")
            router.replace("/(shelter)/requests")
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || e?.message || "No se pudo rechazar")
        }
    }

    const handleSaveMessage = async () => {
        if (!request) return
        if (editableMessage === message) return

        setSavingMessage(true)
        setMessageError(null)

        try {
            await updateAdoptionRequest(request.id, { message: editableMessage })
            setRequest((prev: any) => (prev ? { ...prev, message: editableMessage } : prev))
            await refreshRequests()
            Alert.alert("Mensaje actualizado", "Mensaje guardado correctamente.")
        } catch (e: any) {
            setMessageError(
                e?.response?.data?.message || e?.message || "No se pudo actualizar el mensaje"
            )
        } finally {
            setSavingMessage(false)
        }
    }

    const handleConfirmCode = async (code: string) => {
        if (!request) return

        try {
            const result = await validateAdoptionCode({ requestId: Number(request.id), code })
            await refreshRequests()
            setRequest((prev: any) =>
                prev ? { ...prev, status: result.status || prev.status } : prev
            )

            Alert.alert(
                "Código validado",
                result.message || "La adopción fue confirmada correctamente."
            )
        } catch (e: any) {
            Alert.alert(
                "Error",
                e?.response?.data?.message || e?.message || "No se pudo validar el código"
            )
        }
    }

    if (loading)
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        )
    if (error)
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>{error}</Text>
            </View>
        )
    if (!request)
        return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />

    const postId = request.postid || request.post_id || request.post?.id

    const handleViewFormResponses = () => {
        if (!postId) {
            Alert.alert("Error", "No se pudo obtener el ID de la publicación")
            return
        }

        const requesterId = request?.requester_id || request?.requesterid
        //console.log(
        //    "🔍 handleViewFormResponses - Request object:",
        //    JSON.stringify(request, null, 2)
        //)
        //console.log("🔍 handleViewFormResponses - RequesterId:", requesterId)

        if (!requesterId) {
            Alert.alert("Error", "No se pudo obtener el ID del solicitante")
            return
        }

        router.push({
            pathname: "/(shelter)/view-adoption-responses" as any,
            params: {
                postId: String(postId),
                petName: resolvedPetName || "la mascota",
                requesterId: String(requesterId),
            },
        })
    }

    return (
        <ScrollView
            contentContainerStyle={{
                padding: 16,
                backgroundColor: Colors.light.background,
                flexGrow: 1,
            }}
        >
            <RequestDetailCard
                petPhoto={resolvedPetPhoto || "https://placehold.co/400x400?text=Mascota"}
                petName={resolvedPetName || "Mascota"}
                requester={requesterName}
                date={date}
                status={statusLabel}
                message={message}
                onAccept={handleAccept}
                onReject={handleReject}
                onConfirmCode={handleConfirmCode}
            />

            <View style={{ marginTop: 16, gap: 12 }}>
                <Text style={{ fontWeight: "700", color: Colors.light.text }}>
                    Notas sobre la solicitud
                </Text>
                <TextInput
                    multiline
                    numberOfLines={4}
                    value={editableMessage}
                    onChangeText={(txt) => {
                        setEditableMessage(txt)
                        setMessageError(null)
                    }}
                    editable={!savingMessage}
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.light.border,
                        padding: 12,
                        minHeight: 110,
                        textAlignVertical: "top",
                        color: "#1F2933",
                    }}
                    placeholder="Agrega notas internas sobre esta solicitud..."
                    placeholderTextColor={Colors.light.textSecondary}
                />
                {messageError ? <Text style={{ color: Colors.danger }}>{messageError}</Text> : null}
                <Pressable
                    onPress={handleSaveMessage}
                    disabled={savingMessage || editableMessage === message}
                    style={{
                        backgroundColor:
                            savingMessage || editableMessage === message
                                ? Colors.light.border
                                : Colors.secondary,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                        {savingMessage ? "Guardando..." : "Guardar notas"}
                    </Text>
                </Pressable>

                {/* Botón para ver respuestas del formulario */}
                <TouchableOpacity
                    onPress={handleViewFormResponses}
                    style={styles.viewResponsesButton}
                >
                    <Ionicons name="clipboard-outline" size={20} color={Colors.secondary} />
                    <Text style={styles.viewResponsesText}>Ver Respuestas del Formulario</Text>
                    <Ionicons name="chevron-forward-outline" size={20} color={Colors.secondary} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    viewResponsesButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F0F8FF",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.secondary,
        marginTop: 8,
    },
    viewResponsesText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: Colors.secondary,
        marginLeft: 12,
    },
})
