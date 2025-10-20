import React, { useEffect, useState } from "react"
import { View, Alert, ActivityIndicator, Text, Pressable, TextInput } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import RequestDetailCard, { Status } from "@/components/common/RequestDetailCard"
import { http } from "@/services/http"
import { useAuthContext } from "@/context/AuthContext"
import { usePublicationContext } from "@/context/PublicationContext"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"

export default function RequestDetail() {

    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const { user: authUser } = useAuthContext()
    const { deleteAdoptionRequest, refreshRequests, updateAdoptionRequest } = useAdoptionRequestContext()
    const { getPublicationByPostId } = usePublicationContext()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [request, setRequest] = useState<any | null>(null)

    const [resolvedPetPhoto, setResolvedPetPhoto] = useState<string | null>(
        null
    )
    const [resolvedPetName, setResolvedPetName] = useState<string | null>(
        null
    )
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
                const img = (request.postImages && request.postImages[0]) || (request.petImages && request.petImages[0]) || null
                if (img) setResolvedPetPhoto(img)
            }
            if (!resolvedPetName) {
                const n = request.post?.pet?.name || request.post?.title || request.post_title || request.title || request.pet?.name || null
                if (n) setResolvedPetName(n)
            }
            if (resolvedPetName && resolvedPetPhoto) return
            const postId = request.post_id || request.post?.id || request.post_id
            if (!postId) return
            try {
                const pub = await getPublicationByPostId(Number(postId))
                if (!mounted) return
                if (pub) {
                    if (!resolvedPetName && pub.name) setResolvedPetName(pub.name)
                    if (!resolvedPetPhoto && pub.image && (pub.image as any).uri) setResolvedPetPhoto((pub.image as any).uri)
                }
            } catch (e) {
            }
        }

        resolvePublication()

        return () => {
            mounted = false
        }
    }, [request, resolvedPetName, resolvedPetPhoto])

    const requesterName =
        request?.user?.name ||
        request?.requester_name ||
        (authUser && request?.requester_id && Number(request.requester_id) === Number(authUser.id) ? authUser.name : "--")
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

    const messageChanged = editableMessage !== message

    const isRequester =
        authUser && request?.requester_id && Number(authUser.id) === Number(request.requester_id)
    const isPostOwner =
        authUser && request?.post_owner_id && Number(authUser.id) === Number(request.post_owner_id)

    const handleSaveMessage = async () => {
        if (!request) return
        if (editableMessage === message) return

        setSavingMessage(true)
        setMessageError(null)

        try {
            await updateAdoptionRequest(request.id, { message: editableMessage })

            setRequest((prev: any) => {
                if (!prev) return prev

                const next: any = { ...prev, message: editableMessage }

                if (prev.adoption_request && typeof prev.adoption_request === "object") {
                    next.adoption_request = {
                        ...prev.adoption_request,
                        message: editableMessage,
                    }
                }

                if (prev.values?.adoption_request) {
                    next.values = {
                        ...prev.values,
                        adoption_request: {
                            ...prev.values.adoption_request,
                            message: editableMessage,
                        },
                    }
                }

                if (prev.data?.adoption_request) {
                    next.data = {
                        ...prev.data,
                        adoption_request: {
                            ...prev.data.adoption_request,
                            message: editableMessage,
                        },
                    }
                } else if (prev.data && typeof prev.data === "object" && !Array.isArray(prev.data)) {
                    next.data = {
                        ...prev.data,
                        message: editableMessage,
                    }
                }

                return next
            })

            await refreshRequests()
            Alert.alert("Mensaje actualizado", "Tu mensaje fue guardado correctamente.")
        } catch (e: any) {
            setMessageError(
                e?.response?.data?.message || e?.message || "No se pudo actualizar el mensaje"
            )
        } finally {
            setSavingMessage(false)
        }
    }

    const handleDelete = async () => {
        try {
            const resp = await deleteAdoptionRequest(request.id)
            // prefer server-sent message when available
            const serverMessage = resp?.data?.values?.message || resp?.data?.message
            await refreshRequests()
            router.replace("/(home)/(requests)")
            if (serverMessage) {
                Alert.alert("Operación completada", serverMessage)
            }
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || e?.message || "No se pudo eliminar la solicitud")
        }
    }

    const handleAccept = async () => {
        try {
            const resp = await http.post(`/v1/adoptions/adoption-requests/${request.id}/confirm-accept`)
            const serverMessage = resp?.data?.values?.message || resp?.data?.message
            const confirmationCode = resp?.data?.values?.confirmationCode || resp?.data?.confirmationCode
            if (serverMessage) {
                Alert.alert("Solicitud aceptada", serverMessage)
            } else {
                Alert.alert("Solicitud aceptada", `Código: ${confirmationCode || "(no code)"}`)
            }
            await refreshRequests()
            router.replace("/(home)/(requests)")
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || e?.message || "No se pudo aceptar la solicitud")
        }
    }

    if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></View>
    if (error) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />
    if (!request) return <View style={{ flex: 1 }} />

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
            <RequestDetailCard
                petPhoto={resolvedPetPhoto || "https://placehold.co/400x400?text=Mascota"}
                petName={resolvedPetName || "Mascota"}
                requester={requesterName}
                date={date}
                status={request.status ? (request.status === "approved" || request.status === "accepted" ? "Aceptada" : request.status === "rejected" ? "Rechazada" : "Pendiente") : "Pendiente"}
                message={message}
                onAccept={isPostOwner ? handleAccept : undefined}
                onReject={isRequester ? undefined : isPostOwner ? handleDelete : undefined}
            />

            {isRequester && (
                <View style={{ padding: 12, gap: 16 }}>
                    <View style={{ gap: 8 }}>
                        <Text style={{ fontWeight: "700", color: "#1C1C1C" }}>
                            Mensaje para el cuidador
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
                                borderColor: "#E5E7EB",
                                padding: 12,
                                minHeight: 110,
                                textAlignVertical: "top",
                                color: "#1F2933",
                            }}
                            placeholder="Agrega un mensaje para el cuidador..."
                            placeholderTextColor="#9CA3AF"
                        />
                        {messageError ? (
                            <Text style={{ color: "#C0392B" }}>{messageError}</Text>
                        ) : null}
                        <Pressable
                            onPress={handleSaveMessage}
                            disabled={!messageChanged || savingMessage}
                            style={{
                                backgroundColor:
                                    !messageChanged || savingMessage ? "#D1D5DB" : "#2563EB",
                                padding: 12,
                                borderRadius: 8,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "700" }}>
                                {savingMessage ? "Guardando..." : "Guardar mensaje"}
                            </Text>
                        </Pressable>
                    </View>
                    <Pressable
                        onPress={handleDelete}
                        style={{
                            backgroundColor: "#C0392B",
                            padding: 12,
                            borderRadius: 8,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "800" }}>Eliminar solicitud</Text>
                    </Pressable>
                </View>
            )}
        </View>
    )
}
