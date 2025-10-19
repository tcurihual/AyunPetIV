import React, { useEffect, useState } from "react"
import { View, Alert, ActivityIndicator, Text, Pressable } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import RequestDetailCard, { Status } from "@/components/common/RequestDetailCard"
import { http } from "@/services/http"
import { useAuthContext } from "@/context/AuthContext"
import { usePublicationContext } from "@/context/PublicationContext"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"

export default function RequestDetail() {

    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    // single hook call for auth user
    const { user: authUser } = useAuthContext()
    const { deleteAdoptionRequest, refreshRequests } = useAdoptionRequestContext()
    const { getPublicationByPostId } = usePublicationContext()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [request, setRequest] = useState<any | null>(null)

    // If request doesn't include post/pet info, try to resolve it via PublicationContext
    const [resolvedPetPhoto, setResolvedPetPhoto] = useState<string | null>(
        null
    )
    const [resolvedPetName, setResolvedPetName] = useState<string | null>(
        null
    )

    useEffect(() => {
        async function load() {
            if (!id) return
            setLoading(true)
            setError(null)
            try {
                const resp = await http.get(`/v1/adoptions/adoption-requests/${id}`)
                // Normalize many possible response shapes from the backend:
                // - { data: { ... }, message: '...' }
                // - { values: { adoption_request: { ... } } }
                // - { adoption_request: { ... } }
                // - { ...request... }
                const raw = resp.data

                let reqObj: any = null
                if (!raw) {
                    reqObj = null
                } else if (raw.values && raw.values.adoption_request) {
                    reqObj = raw.values.adoption_request
                } else if (raw.adoption_request) {
                    reqObj = raw.adoption_request
                } else if (raw.data) {
                    // data might be an array (list response) or an object (single)
                    if (Array.isArray(raw.data)) {
                        // if accidentally returned an array, pick the first item
                        reqObj = raw.data[0] ?? null
                    } else {
                        reqObj = raw.data.adoption_request ?? raw.data
                    }
                } else {
                    // assume the raw payload is the request
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

    // If we don't have pet name/photo, try to fetch publication info by post_id
    useEffect(() => {
        let mounted = true
        async function resolvePublication() {
            if (!request) return
            // prefer values already present in the request
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
                // swallow
            }
        }

        resolvePublication()

        return () => {
            mounted = false
        }
    }, [request, resolvedPetName, resolvedPetPhoto])

    if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></View>
    if (error) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />
    if (!request) return <View style={{ flex: 1 }} />

    // If backend doesn't include requester name but requester_id matches current user, use authUser
    const requesterName =
        request.user?.name ||
        request.requester_name ||
        (authUser && request.requester_id && Number(request.requester_id) === Number(authUser.id) ? authUser.name : "--")
    const rawDate = request.createdAt || request.createdat || request.created_at
    const date = rawDate ? new Date(rawDate).toLocaleString() : "--"
    // Normalize message: the backend may return the requester message in different shapes
    const message =
        request.message ||
        request.adoption_request?.message ||
        request.values?.adoption_request?.message ||
        request.values?.message ||
        request.data?.message ||
        ""

    const isRequester = authUser && request.requester_id && Number(authUser.id) === Number(request.requester_id)
    const isPostOwner = authUser && request.post_owner_id && Number(authUser.id) === Number(request.post_owner_id)


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
            // Use confirm-accept endpoint which is protected and will only allow post owner
            const resp = await http.post(`/v1/adoptions/adoption-requests/${request.id}/confirm-accept`)
            // prefer server-sent message if present, otherwise show confirmation code
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

            {/* If the requester is viewing, show a single Delete CTA */}
            {isRequester && (
                <View style={{ padding: 12 }}>
                    <Pressable
                        onPress={handleDelete}
                        style={{ backgroundColor: "#C0392B", padding: 12, borderRadius: 8, alignItems: "center" }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "800" }}>Eliminar solicitud</Text>
                    </Pressable>
                </View>
            )}
        </View>
    )
}
