import React from "react"
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from "react-native"

export type Status = "Pendiente" | "Aceptada" | "Rechazada"

export interface RequestDetailProps {
    petPhoto: string
    petName: string
    requester: string
    date: string
    status: Status
    message?: string
    onAccept?: () => void
    onReject?: () => void
}

const statusStyles: Record<Status, { bg: string; fg: string }> = {
    Pendiente: { bg: "#FFE8A3", fg: "#6A4B00" },
    Aceptada: { bg: "#D1F3DA", fg: "#0E6B2B" },
    Rechazada: { bg: "#FAD2D2", fg: "#8B1A1A" },
}

export default function RequestDetailCard({
    petPhoto,
    petName,
    requester,
    date,
    status,
    message,
    onAccept,
    onReject,
}: RequestDetailProps) {
    const st = statusStyles[status]

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <Image source={{ uri: petPhoto }} style={styles.photo} />

            <View style={styles.card}>
                <View style={styles.titleRow}>
                    <Text style={styles.petName}>{petName}</Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.badgeText, { color: st.fg }]}>{status}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Detalles de solicitud:</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Solicitante: </Text>
                    <Text style={styles.value}>{requester}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Fecha: </Text>
                    <Text style={styles.value}>{date}</Text>
                </View>

                {message && (
                    <View style={[styles.row, { alignItems: "flex-start" }]}>
                        <Text style={styles.label}>Mensaje: </Text>
                        <Text style={[styles.value, { flex: 1 }]}>{message}</Text>
                    </View>
                )}

                {onAccept && (
                    <Pressable style={[styles.btn, styles.btnAccept]} onPress={onAccept}>
                        <Text style={styles.btnText}>Aceptar Solicitud</Text>
                    </Pressable>
                )}

                {onReject && (
                    <Pressable style={[styles.btn, styles.btnReject]} onPress={onReject}>
                        <Text style={styles.btnText}>Rechazar Solicitud</Text>
                    </Pressable>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    photo: {
        width: "90%",
        height: 220,
        borderRadius: 2,
        marginVertical: 12,
        alignSelf: "center",
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#fff",
        width: "95%",
        alignSelf: "center",
        borderRadius: 14,
        padding: 14,
        gap: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    petName: { fontSize: 22, fontWeight: "900", color: "#1C1C1C" },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "800" },
    sectionTitle: { marginTop: 6, fontSize: 14, fontWeight: "800", color: "#1C1C1C" },
    row: { flexDirection: "row", alignItems: "center" },
    label: { fontWeight: "800", color: "#1C1C1C" },
    value: { color: "#444" },
    btn: {
        marginTop: 10,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    btnAccept: { backgroundColor: "#2E8B57" },
    btnReject: { backgroundColor: "#C0392B" },
    btnText: { fontWeight: "800", color: "#fff" },
})
