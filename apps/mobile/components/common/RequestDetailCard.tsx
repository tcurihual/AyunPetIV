import React, { useState } from "react"
import {
    View,
    Text,
    Image,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    StyleSheet,
} from "react-native"
import { useAuthContext } from "@/context/AuthContext"

export type Status = "Pendiente" | "Aceptada" | "Rechazada" | "Completada"

export interface RequestDetailProps {
    petPhoto: string
    petName: string
    requester: string
    date: string
    status: Status
    message?: string
    confirmationCode?: string | null
    onAccept?: () => void
    onReject?: () => void
    onConfirmCode?: (code: string) => void
}

export default function RequestDetailCard({
    petPhoto,
    petName,
    requester,
    date,
    status,
    message,
    confirmationCode,
    onAccept,
    onReject,
    onConfirmCode,
}: RequestDetailProps) {
    const { user } = useAuthContext()
    const role = user?.role
    const [code, setCode] = useState("")

    const statusStyles: Record<Status, { bg: string; fg: string }> = {
        Pendiente: { bg: "#FFE8A3", fg: "#6A4B00" },
        Aceptada: { bg: "#D1F3DA", fg: "#0E6B2B" },
        Completada: { bg: "#B4E1FA", fg: "#0F4C75" },
        Rechazada: { bg: "#FAD2D2", fg: "#8B1A1A" },
    }

    const st = statusStyles[status]

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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

                    {/* Mostrar código de adopción si es usuario adoptante */}
                    {role === 20 && status === "Aceptada" && (
                        <View style={{ marginTop: 10, alignItems: "center" }}>
                            <Text style={{ fontWeight: "700", color: "#333" }}>
                                Tu código de adopción es:
                            </Text>

                            <Text
                                style={{
                                    fontSize: 24,
                                    fontWeight: "900",
                                    color: "#2563EB",
                                    marginTop: 6,
                                }}
                            >
                                {confirmationCode || "Código no disponible"}
                            </Text>

                            <Text style={{ color: "#666", marginTop: 4, textAlign: "center" }}>
                                Entrégaselo al dador o refugio para completar la adopción.
                            </Text>
                        </View>
                    )}

                    {/* Botones para refugios/givers */}
                    {(role === 21 || role === 22) && (
                        <>
                            {status === "Pendiente" && (
                                <View>
                                    {onAccept && (
                                        <Pressable
                                            style={[styles.btn, styles.btnAccept]}
                                            onPress={onAccept}
                                        >
                                            <Text style={styles.btnText}>Aceptar Solicitud</Text>
                                        </Pressable>
                                    )}
                                    {onReject && (
                                        <Pressable
                                            style={[styles.btn, styles.btnReject]}
                                            onPress={onReject}
                                        >
                                            <Text style={styles.btnText}>Rechazar Solicitud</Text>
                                        </Pressable>
                                    )}
                                </View>
                            )}

                            {status === "Aceptada" && (
                                <View style={{ marginTop: 10 }}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ingrese código de adopción"
                                        value={code}
                                        onChangeText={setCode}
                                    />
                                    <Pressable
                                        style={[styles.btn, styles.btnAccept]}
                                        onPress={() => onConfirmCode?.(code)}
                                    >
                                        <Text style={styles.btnText}>Confirmar Código</Text>
                                    </Pressable>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    photo: { width: "90%", height: 220, borderRadius: 2, marginVertical: 12, alignSelf: "center" },
    card: {
        backgroundColor: "#fff",
        width: "95%",
        alignSelf: "center",
        borderRadius: 14,
        padding: 14,
        gap: 10,
        elevation: 2,
    },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    petName: { fontSize: 22, fontWeight: "900", color: "#1C1C1C" },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "800" },
    sectionTitle: { marginTop: 6, fontSize: 14, fontWeight: "800", color: "#1C1C1C" },
    row: { flexDirection: "row", alignItems: "center" },
    label: { fontWeight: "800", color: "#1C1C1C" },
    value: { color: "#444" },
    btn: { marginTop: 10, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    btnAccept: { backgroundColor: "#2E8B57" },
    btnReject: { backgroundColor: "#C0392B" },
    btnText: { fontWeight: "800", color: "#fff" },
    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 8,
        marginTop: 6,
        padding: 8,
        color: "#333",
    },
})
