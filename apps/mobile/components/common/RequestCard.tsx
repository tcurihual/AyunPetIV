import React from "react"
import { View, Text, Image, Pressable, StyleSheet } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"
import { Colors } from "@/constants/Colors"

export type RequestStatus = "Pendiente" | "Aprobada" | "Rechazada" | "Completada"

export interface RequestCardProps {
    petPhoto: string
    petName: string
    requester: string
    date: string
    status: RequestStatus | "Aceptada"
    onPress?: () => void
    isOwnRequest?: boolean // true si el usuario actual es el solicitante
}

export default function RequestCard({
    petPhoto,
    petName,
    requester,
    date,
    status,
    onPress,
    isOwnRequest = false,
}: RequestCardProps) {
    const cardBgColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const tintColor = useThemeColor({}, "tint")

    // Obtener estilos de estado según el tema
    const statusPending = Colors.light.statusPending
    const statusApproved = Colors.light.statusApproved
    const statusCompleted = Colors.light.statusCompleted
    const statusRejected = Colors.light.statusRejected

    const statusStyles: Record<RequestStatus, { bg: string; fg: string }> = {
        Pendiente: statusPending,
        Aprobada: statusApproved,
        Completada: statusCompleted,
        Rechazada: statusRejected,
    }

    const normalizedKey =
        status === "Aceptada" ? ("Aprobada" as RequestStatus) : (status as RequestStatus)
    const st = statusStyles[normalizedKey] ?? statusStyles.Pendiente
    const displayStatus = status

    const requesterText = isOwnRequest ? "ti" : requester

    return (
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
            <Image source={{ uri: petPhoto }} style={styles.photo} />
            <View style={styles.body}>
                <View style={styles.headerRow}>
                    <Text style={[styles.petName, { color: textColor }]}>{petName}</Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.badgeText, { color: st.fg }]}>{displayStatus}</Text>
                    </View>
                </View>

                <View style={{ gap: 2, marginTop: 2 }}>
                    <Text style={[styles.meta, { color: textSecondaryColor }]}>
                        Solicitado por <Text style={[styles.metaBold, { color: textColor }]}>{requesterText}</Text>
                    </Text>
                    <Text style={[styles.meta, { color: textSecondaryColor }]}>{date}</Text>
                </View>

                <Pressable onPress={onPress} style={[styles.cta, { backgroundColor: tintColor }]}>
                    <Text style={[styles.ctaText, { color: "#000" }]}>Ver Solicitud</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        borderRadius: 14,
        padding: 12,
        gap: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    photo: { width: 86, height: 86, borderRadius: 12 },
    body: { flex: 1 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    petName: { fontSize: 16, fontWeight: "700" },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "700" },
    meta: { fontSize: 12 },
    metaBold: { fontWeight: "700" },
    cta: {
        marginTop: 8,
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    ctaText: { fontWeight: "700" },
})
