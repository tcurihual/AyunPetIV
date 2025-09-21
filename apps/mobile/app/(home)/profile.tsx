import React from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

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
    imageUrl: string
}

export default function GiverProfileScreen() {
    const { giverId } = useLocalSearchParams<{ giverId: string }>()
    const router = useRouter()
    const { signOut } = useAuthContext() 

    const giver: Giver = {
        id: giverId ?? "1",
        displayName: "Fundación Amigos de los Animales",
        isFoundation: true,
        city: "Temuco",
        region: "Araucanía",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        bio: "Rescatamos y damos en adopción perros y gatos. Promovemos la tenencia responsable.",
        metrics: { activePosts: 4, adoptions: 18, rating: 4.8 },
    }

    const activePosts: Post[] = [
        {
            id: "p1",
            name: "Firulais",
            ageGender: "Macho adulto",
            imageUrl: "https://place-puppy.com/300x300",
        },
        {
            id: "p2",
            name: "Pelusa",
            ageGender: "Hembra adulta",
            imageUrl: "https://placekitten.com/300/300",
        },
        {
            id: "p3",
            name: "Bola de Nieve",
            ageGender: "Hembra cachorro",
            imageUrl: "https://placekitten.com/301/301",
        },
        {
            id: "p4",
            name: "Ayudante de Santa",
            ageGender: "Macho joven",
            imageUrl: "https://place-puppy.com/301x301",
        },
    ]

    const handleLogout = async () => {
        try {
            await signOut()
            router.replace("/(auth)/login")
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
                <TouchableOpacity style={styles.logoutPill} onPress={handleLogout}>
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
                <TouchableOpacity style={styles.buttonPrimary}>
                    <Text style={styles.buttonText}>Contactar</Text>
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
                            <Image source={{ uri: p.imageUrl }} style={styles.petImage} />
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

const YELLOW = "#F9C80E"
const BLACK = "#000000"
const TEXT_MUTED = "#555"

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
    name: { fontSize: 18, fontWeight: "bold", color: BLACK },
    location: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
    badge: {
        alignSelf: "flex-start",
        marginTop: 6,
        backgroundColor: YELLOW,
        color: BLACK,
        fontWeight: "bold",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: "hidden",
    },
    logoutPill: {
        marginLeft: 8,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#f00",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    logoutPillText: { color: "#f00", fontWeight: "bold", fontSize: 12 },

    statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    statCard: {
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
        elevation: 2,
        shadowColor: BLACK,
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    statNum: { fontSize: 16, fontWeight: "bold", color: BLACK },
    statLabel: { fontSize: 12, color: TEXT_MUTED },
    bio: { fontSize: 14, color: "#333", marginBottom: 16, lineHeight: 20 },
    actions: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    buttonPrimary: {
        backgroundColor: YELLOW,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flex: 1,
        alignItems: "center",
        marginHorizontal: 4,
    },
    buttonText: { color: BLACK, fontWeight: "bold" },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: BLACK, marginBottom: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        padding: 10,
        elevation: 2,
        shadowColor: BLACK,
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    petImage: { width: "100%", height: 110, borderRadius: 10, marginBottom: 8 },
    petName: { fontWeight: "bold", color: BLACK },
    petMeta: { color: TEXT_MUTED, fontSize: 12, marginBottom: 8 },
    infoButton: {
        backgroundColor: YELLOW,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    infoButtonText: { fontSize: 12, fontWeight: "bold", color: BLACK },
    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        elevation: 2,
        shadowColor: BLACK,
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    emptyTitle: { fontWeight: "bold", color: BLACK, marginBottom: 6 },
    emptyText: { fontSize: 13, color: TEXT_MUTED, textAlign: "center" },
})
