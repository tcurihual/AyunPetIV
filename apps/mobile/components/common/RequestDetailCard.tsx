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
import { useThemeColor } from "@/hooks/useThemeColor"
import { Colors } from "@/constants/Colors"

export type Status = "Pendiente" | "Aceptada" | "Rechazada" | "Completada"

export interface RequestDetailProps {
    petPhoto: string
    petName: string
    requester: string
    date: string
    status: Status
    message?: string
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
    onAccept,
    onReject,
    onConfirmCode,
}: RequestDetailProps) {
    const { user } = useAuthContext()
    const role = user?.role
    const [code, setCode] = useState("")

    const cardBgColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const bgColor = useThemeColor({}, "background")
    const borderColor = useThemeColor({}, "border")
    const infoColor = useThemeColor({}, "info")

    // Obtener estilos de estado según el tema
    const statusPending = Colors.light.statusPending
    const statusApproved = Colors.light.statusApproved
    const statusCompleted = Colors.light.statusCompleted
    const statusRejected = Colors.light.statusRejected

    const statusStyles: Record<Status, { bg: string; fg: string }> = {
        Pendiente: statusPending,
        Aceptada: statusApproved,
        Completada: statusCompleted,
        Rechazada: statusRejected,
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

                <View style={[styles.card, { backgroundColor: cardBgColor }]}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.petName, { color: textColor }]}>{petName}</Text>
                        <View style={[styles.badge, { backgroundColor: st.bg }]}>
                            <Text style={[styles.badgeText, { color: st.fg }]}>{status}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: textColor }]}>Detalles de solicitud:</Text>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: textColor }]}>Solicitante: </Text>
                        <Text style={[styles.value, { color: textColor }]}>{requester}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: textColor }]}>Fecha: </Text>
                        <Text style={[styles.value, { color: textColor }]}>{date}</Text>
                    </View>

                    {message && (
                        <View style={[styles.row, { alignItems: "flex-start" }]}>
                            <Text style={[styles.label, { color: textColor }]}>Mensaje: </Text>
                            <Text style={[styles.value, { flex: 1, color: textColor }]}>{message}</Text>
                        </View>
                    )}

                    {/* Mostrar código de adopción si es usuario adoptante */}
                    {role === 20 && status === "Aceptada" && (
                        <View style={{ marginTop: 10, alignItems: "center" }}>
                            <Text style={{ fontWeight: "700", color: textColor }}>
                                Tu código de adopción es:
                            </Text>
                            <Text
                                style={{
                                    fontSize: 24,
                                    fontWeight: "900",
                                    color: infoColor,
                                    marginTop: 6,
                                }}
                            >
                                {code || "9F27C"}
                            </Text>
                            <Text style={{ color: textSecondaryColor, marginTop: 4, textAlign: "center" }}>
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
                                        style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
                                        placeholder="Ingrese código de adopción"
                                        placeholderTextColor={textMutedColor}
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
        width: "95%",
        alignSelf: "center",
        borderRadius: 14,
        padding: 14,
        gap: 10,
        elevation: 2,
    },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    petName: { fontSize: 22, fontWeight: "900" },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "800" },
    sectionTitle: { marginTop: 6, fontSize: 14, fontWeight: "800" },
    row: { flexDirection: "row", alignItems: "center" },
    label: { fontWeight: "800" },
    value: {},
    btn: { marginTop: 10, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    btnAccept: { backgroundColor: "#2E8B57" },
    btnReject: { backgroundColor: "#C0392B" },
    btnText: { fontWeight: "800", color: "#fff" },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 6,
        padding: 8,
    },
})
