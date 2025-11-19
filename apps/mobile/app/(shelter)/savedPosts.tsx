import React, { useEffect, useMemo, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    useColorScheme,
} from "react-native"
import PublicationCard from "@/components/common/PublicationCard"
import { useSavedPostsContext } from "@/context/SavedPostsContext"
import { PublicationItem } from "@/context/PublicationContext"
import { Colors } from "@/constants/Colors"

const { width } = Dimensions.get("window")

// Si tienes un placeholder global, puedes mover esto a otro archivo
const PLACEHOLDER_IMAGE = "https://placehold.co/400x400?text=Mascota"

export default function SavedPostsScreen() {
    const { savedPosts, loading, error, fetchSavedPosts } = useSavedPostsContext()

    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchSavedPosts()
    }, [fetchSavedPosts])

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            await fetchSavedPosts(1, 20)
        } finally {
            setRefreshing(false)
        }
    }

    // Mapeo SavedPostItem -> PublicationItem para reutilizar PublicationCard
    const mappedPublications: PublicationItem[] = useMemo(() => {
        return savedPosts.map((saved) => {
            const post = saved.post
            const pet = post?.pet

            const postImages: string[] = Array.isArray(post?.images) ? post!.images : []
            const petImages: string[] = Array.isArray(pet?.images) ? pet!.images : []
            const imageUri = postImages[0] || petImages[0] || PLACEHOLDER_IMAGE

            const years = Number(pet?.age_years ?? 0)
            const months = Number(pet?.age_months ?? 0)
            const ageText =
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
                id: String(post?.id ?? saved.post_id ?? ""),
                name: pet?.name || "Sin nombre",
                gender: (pet?.gender ?? "").toLowerCase(),
                type: (pet?.species ?? "").toLowerCase(),
                age: ageText,
                publisher: "Guardado por ti",
                publisherPhoto: null,
                description: post?.description ?? "",
                image: { uri: imageUri },
                species: pet?.species,
                size: pet?.size,
                sterilized: pet?.sterilized,
                status: post?.status,
                postId: post?.id,
                petId: pet?.id,
                creatorId: post?.creator_id,
            } as PublicationItem
        })
    }, [savedPosts])

    const renderItem = ({ item }: { item: PublicationItem }) => (
        <View style={[styles.cardContainer, { backgroundColor: themeColors.card }]}>
            <PublicationCard pet={item} />
        </View>
    )

    if (loading && !refreshing && savedPosts.length === 0) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size="large" color={themeColors.tint} />
                <Text style={[styles.loadingText, { color: themeColors.text }]}>
                    Cargando publicaciones guardadas...
                </Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Publicaciones guardadas</Text>

            {error ? (
                <Text style={[styles.errorText, { color: themeColors.danger }]}>{error}</Text>
            ) : null}

            <FlatList
                data={mappedPublications}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.postId ?? item.id)}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.tint]}
                        tintColor={themeColors.tint}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>💾</Text>
                        <Text style={[styles.emptyText, { color: themeColors.text, opacity: 0.8 }]}>
                            Aún no tienes publicaciones guardadas
                        </Text>
                        <Text
                            style={[styles.emptySubtext, { color: themeColors.text, opacity: 0.6 }]}
                        >
                            Toca el corazón en una publicación para guardarla aquí.
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    row: {
        justifyContent: "space-between",
    },
    cardContainer: {
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 1,
        flex: 1,
        maxWidth: (width - 48) / 2,
        marginBottom: 16,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: "center",
    },
    errorText: {
        paddingHorizontal: 16,
        marginBottom: 8,
        fontSize: 14,
    },
})
