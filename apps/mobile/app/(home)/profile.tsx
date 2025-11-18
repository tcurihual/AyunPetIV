import React, { useMemo } from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import ayunData from "@/data/mockData"
import { useThemeColor } from "@/hooks/useThemeColor"
import { Colors } from "@/constants/Colors"

type Giver = {
    id: string
    displayName: string
    avatarUrl?: string
    isFoundation?: boolean
    foundationName?: string
    city?: string
    region?: string
    bio?: string
    metrics?: { activePosts: number; adoptions: number; rating?: number }
}

type Post = {
    id: string
    name: string
    ageGender: string
    imageUrl: string | any
}

export default function GiverProfileScreen() {
    const { giverId } = useLocalSearchParams<{ giverId: string }>()
    const router = useRouter()
    const { signOut, status, user } = useAuthContext()

    const backgroundColor = useThemeColor({}, "background")
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const dangerColor = useThemeColor({}, "danger")
    const borderColor = useThemeColor({}, "border")
    const shadowColor = useThemeColor({}, "shadow")

    const brandYellow = Colors.yellow

    const styles = useMemo(
        () =>
            createStyles({
                background: backgroundColor,
                card: cardColor,
                text: textColor,
                textSecondary: textSecondaryColor,
                danger: dangerColor,
                border: borderColor,
                shadow: shadowColor,
                brandYellow: brandYellow,
            }),
        [
            backgroundColor,
            cardColor,
            textColor,
            textSecondaryColor,
            dangerColor,
            borderColor,
            shadowColor,
        ]
    )

    const giver: Giver = {
        id: user?.id || "1",
        displayName: user?.name || "Usuario",
        isFoundation: user?.role === "fundacion",
        city: user?.city || "",
        region: user?.region || "",
        avatarUrl: user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg",
        bio: user?.description || "Sin descripción",
        metrics: {
            activePosts: ayunData.post.filter(
                (p) =>
                    p.creatorid.toString() === (user?.id || "").toString() && p.status === "active"
            ).length,
            adoptions: ayunData.post.filter(
                (p) =>
                    p.creatorid.toString() === (user?.id || "").toString() && p.status === "closed"
            ).length,
            rating: undefined,
        },
    }

    const activePosts: Post[] = (() => {
        if (!user?.id) return []

        const userPosts = ayunData.post.filter(
            (post) => post.creatorid.toString() === user.id.toString() && post.status === "active"
        )

        return userPosts.map((post) => {
            const pet = ayunData.pet.find((p) => p.id === post.petid)
            return {
                id: post.id.toString(),
                name: pet?.name || "Mascota",
                ageGender: pet
                    ? `${pet.gender} ${pet.age} año${pet.age !== 1 ? "s" : ""}`
                    : "Info no disponible",
                imageUrl: pet?.image || "https://place-puppy.com/300x300",
            }
        })
    })()

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (e) {
            console.warn("Error al cerrar sesión", e)
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.header}>
                <Image source={{ uri: giver.avatarUrl }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        {giver.isFoundation && giver.foundationName
                            ? giver.foundationName
                            : giver.displayName}
                    </Text>
                    <Text style={styles.location}>
                        {giver.city}
                        {giver.city && giver.region ? ", " : ""}
                        {giver.region}
                    </Text>
                    {giver.isFoundation ? (
                        <Text style={styles.badge}>Fundación</Text>
                    ) : (
                        <Text style={styles.badge}>Dador</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.logoutPill}
                    onPress={handleLogout}
                    disabled={status === "loading"}
                >
                    <Text style={styles.logoutPillText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNum}>{giver.metrics?.activePosts ?? 0}</Text>
                    <Text style={styles.statLabel}>Publicaciones</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNum}>{giver.metrics?.adoptions ?? 0}</Text>
                    <Text style={styles.statLabel}>Adopciones</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNum}>
                        {giver.metrics?.rating ? `⭐ ${giver.metrics.rating}` : "⭐ -"}
                    </Text>
                    <Text style={styles.statLabel}>Valoración</Text>
                </View>
            </View>

            {giver.bio ? <Text style={styles.bio}>{giver.bio}</Text> : null}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => router.push("/(home)/my-profile")}
                >
                    <Text style={styles.buttonText}>Ver Datos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonPrimary}>
                    <Text style={styles.buttonText}>Ver todas</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Publicaciones activas</Text>
            {activePosts.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Sin publicaciones por ahora</Text>
                    <Text style={styles.emptyText}>
                        Este dador no tiene mascotas en adopción actualmente.
                    </Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {activePosts.map((p) => (
                        <View key={p.id} style={styles.card}>
                            <Image
                                source={
                                    typeof p.imageUrl === "string"
                                        ? { uri: p.imageUrl }
                                        : p.imageUrl
                                }
                                style={styles.petImage}
                            />
                            <Text style={styles.petName}>{p.name}</Text>
                            <Text style={styles.petMeta}>{p.ageGender}</Text>
                            <TouchableOpacity style={styles.infoButton}>
                                <Text style={styles.infoButtonText}>Ver información</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

function createStyles(colors: {
    background: string
    card: string
    text: string
    textSecondary: string
    danger: string
    border: string
    shadow: string
    brandYellow: string
}) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, padding: 16 },
        header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
        avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
        name: { fontSize: 18, fontWeight: "bold", color: colors.text },
        location: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
        badge: {
            alignSelf: "flex-start",
            marginTop: 6,
            backgroundColor: colors.brandYellow,
            color: colors.text,
            fontWeight: "bold",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            overflow: "hidden",
        },
        logoutPill: {
            marginLeft: 8,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.danger,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
        },
        logoutPillText: { color: colors.danger, fontWeight: "bold", fontSize: 12 },
        statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
        statCard: {
            flex: 1,
            marginHorizontal: 4,
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 10,
            alignItems: "center",
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOpacity: 0.08,
            shadowRadius: 4,
        },
        statNum: { fontSize: 16, fontWeight: "bold", color: colors.text },
        statLabel: { fontSize: 12, color: colors.textSecondary },
        bio: { fontSize: 14, color: colors.text, marginBottom: 16, lineHeight: 20 },
        actions: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 8,
        },
        buttonPrimary: {
            backgroundColor: colors.brandYellow,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 16,
            alignItems: "center",
            flex: 1,
        },
        buttonText: { color: "#000", fontWeight: "bold" },
        sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 12 },
        grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
        card: {
            width: "48%",
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 16,
            padding: 10,
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOpacity: 0.08,
            shadowRadius: 4,
        },
        petImage: { width: "100%", height: 110, borderRadius: 10, marginBottom: 8 },
        petName: { fontWeight: "bold", color: colors.text },
        petMeta: { color: colors.textSecondary, fontSize: 12, marginBottom: 8 },
        infoButton: {
            backgroundColor: colors.brandYellow,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: "center",
        },
        infoButtonText: { fontSize: 12, fontWeight: "bold", color: "#000" },
        emptyCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOpacity: 0.08,
            shadowRadius: 4,
        },
        emptyTitle: { fontWeight: "bold", color: colors.text, marginBottom: 6 },
        emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: "center" },
    })
}
