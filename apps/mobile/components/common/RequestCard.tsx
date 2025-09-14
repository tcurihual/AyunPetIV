import React from "react"
import { View, Text, Image, Pressable, StyleSheet } from "react-native"

export type RequestStatus = "Pendiente" | "Aceptada" | "Rechazada"

export interface RequestCardProps {
    petPhoto: string
    petName: string
    requester: string
    date: string
    status: RequestStatus
    onPress?: () => void
}

const statusStyles: Record<RequestStatus, { bg: string; fg: string }> = {
    Pendiente: { bg: "#FFE8A3", fg: "#6A4B00" }, // amarillo suave
    Aceptada: { bg: "#D1F3DA", fg: "#0E6B2B" }, // verde
    Rechazada: { bg: "#FAD2D2", fg: "#8B1A1A" }, // rojo
}

export default function RequestCard({
    petPhoto,
    petName,
    requester,
    date,
    status,
    onPress,
}: RequestCardProps) {
    const st = statusStyles[status]

    return (
        <View style={styles.card}>
            <Image source={{ uri: petPhoto }} style={styles.photo} />
            <View style={styles.body}>
                <View style={styles.headerRow}>
                    <Text style={styles.petName}>{petName}</Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.badgeText, { color: st.fg }]}>{status}</Text>
                    </View>
                </View>

                <View style={{ gap: 2, marginTop: 2 }}>
                    <Text style={styles.meta}>
                        Solicitado por <Text style={styles.metaBold}>{requester}</Text>
                    </Text>
                    <Text style={styles.meta}>{date}</Text>
                </View>

                <Pressable onPress={onPress} style={styles.cta}>
                    <Text style={styles.ctaText}>Ver Solicitud</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        gap: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    photo: {
        width: 86,
        height: 86,
        borderRadius: 12,
    },
    body: { flex: 1 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    petName: { fontSize: 16, fontWeight: "700", color: "#1C1C1C" },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "700" },
    meta: { fontSize: 12, color: "#6B6B6B" },
    metaBold: { fontWeight: "700", color: "#1C1C1C" },
    cta: {
        marginTop: 8,
        alignSelf: "flex-start",
        backgroundColor: "#F7C948",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    ctaText: { fontWeight: "700", color: "#1C1C1C" },
})
