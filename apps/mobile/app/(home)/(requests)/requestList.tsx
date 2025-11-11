import React from "react"
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "expo-router"
import RequestCard, { RequestStatus } from "@/components/common/RequestCard"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"
import { usePublicationContext } from "@/context/PublicationContext"

function mapStatus(serverStatus: string | undefined): RequestStatus {
    switch (serverStatus) {
        case "approved":
            return "Aprobada"
        case "completed":
            return "Completada"
        case "rejected":
            return "Rechazada"
        default:
            return "Pendiente"
    }
}

export default function Requests() {
    const router = useRouter()
    const { adoptionRequests, loading, error, refreshRequests, getAdoptionRequests } =
        useAdoptionRequestContext()
    const { getPublicationByPostId } = usePublicationContext()
    const { user } = useAuthContext()
    const [lastLoaded, setLastLoaded] = React.useState<number | null>(null)
    const [refreshing, setRefreshing] = React.useState(false)

    // cache local para publicaciones resueltas por postId => { name, imageUri }
    const [resolved, setResolved] = React.useState<
        Record<number, { name?: string; imageUri?: string }>
    >({})

    // Al cambiar las solicitudes, intentamos resolver los postId que faltan
    React.useEffect(() => {
        let mounted = true

        async function resolveMissing() {
            if (!adoptionRequests || adoptionRequests.length === 0) return

            for (const raw of adoptionRequests) {
                const it: any = raw
                const postId = Number(it.post_id || it.post?.id || it.postid || it.postId)
                if (!postId) continue

                const hasName = !!(
                    it.post?.pet?.name ||
                    it.post?.title ||
                    it.post_title ||
                    it.title ||
                    it.pet?.name
                )
                const hasImage = !!(
                    (it.postImages && it.postImages[0]) ||
                    (it.petImages && it.petImages[0])
                )

                if ((hasName && hasImage) || resolved[postId]) continue

                try {
                    const pub = await getPublicationByPostId(postId)
                    if (!mounted) return
                    if (pub) {
                        setResolved((prev) => ({
                            ...prev,
                            [postId]: { name: pub.name, imageUri: (pub.image as any)?.uri },
                        }))
                    }
                } catch (e) {
                    // ignore per-item errors
                }
            }
        }

        resolveMissing()

        return () => {
            mounted = false
        }
    }, [adoptionRequests])

    const renderEmpty = () => (
        <View style={{ padding: 16 }}>
            <Text style={{ color: "#6B6B6B" }}>No tienes solicitudes de adopción aún.</Text>
        </View>
    )

    const handleManualRefresh = async () => {
        setRefreshing(true)
        try {
            await refreshRequests()
            setLastLoaded(Date.now())
        } catch (e: any) {
            // Error silencioso o puedes mostrar un Alert si prefieres
        } finally {
            setRefreshing(false)
        }
    }

    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
            >
                <ActivityIndicator size="large" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
                ListHeaderComponent={
                    <View style={{ gap: 6, marginBottom: 8 }}>
                        <Text style={styles.h1}>Mis Solicitudes</Text>
                        <Text style={styles.sub}>Revisa tus solicitudes de adopción</Text>
                        <Text style={{ color: "#6B6B6B", fontSize: 12 }}>
                            Total: {adoptionRequests?.length ?? 0}
                        </Text>
                        <Text style={{ color: "#6B6B6B", fontSize: 12 }}>
                            Última carga:{" "}
                            {lastLoaded ? new Date(lastLoaded).toLocaleTimeString() : "-"}
                        </Text>
                    </View>
                }
                data={adoptionRequests}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleManualRefresh} />
                }
                keyExtractor={(i) => String(i.id)}
                ListEmptyComponent={renderEmpty}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item }) => {
                    const it = item as any

                    const postId = Number(it.post_id || it.post?.id)

                    const petNameFromItem =
                        it.post?.pet?.name ||
                        it.post?.title ||
                        it.post_title ||
                        it.title ||
                        it.pet?.name
                    const postImages =
                        (it.postImages as string[]) || (it.post_images as string[]) || []
                    const petImages =
                        (it.petImages as string[]) || (it.pet_images as string[]) || []

                    const resolvedPub = postId ? resolved[postId] : undefined

                    const petName = petNameFromItem || resolvedPub?.name || "Mascota"
                    const petPhoto =
                        postImages[0] ||
                        petImages[0] ||
                        resolvedPub?.imageUri ||
                        "https://placehold.co/400x400?text=Mascota"

                    const requester =
                        it.requester_name ||
                        it.user?.name ||
                        (user && it.requester_id && Number(it.requester_id) === Number(user.id)
                            ? user.name
                            : "--")

                    // Dates in the API may arrive as createdat / created_at or createdAt
                    const rawDate = it.createdAt || it.createdat || it.created_at || it.createdAt
                    const date = rawDate ? new Date(rawDate).toLocaleDateString() : "--"

                    const status = mapStatus(it.status as string)

                    return (
                        <RequestCard
                            petPhoto={petPhoto}
                            petName={petName}
                            requester={requester}
                            date={date}
                            status={status}
                            isOwnRequest={true}
                            onPress={() =>
                                router.push({
                                    pathname: "/(home)/(requests)/[id]",
                                    params: { id: String(it.id) },
                                })
                            }
                        />
                    )
                }}
            />

            {error && (
                <View style={{ padding: 12 }}>
                    <Text style={{ color: "#C0392B" }}>{error}</Text>
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F2" },
    h1: { fontSize: 22, fontWeight: "900", color: "#1C1C1C" },
    sub: { color: "#6B6B6B" },
})
