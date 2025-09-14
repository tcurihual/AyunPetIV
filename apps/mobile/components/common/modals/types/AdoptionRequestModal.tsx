import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import BaseModal from "../BaseModal"
import { useModal } from "@/context/ModalContext"

type Props = {
    petId: string
    petName?: string
    onSubmit?: (payload: { petId: string; message: string }) => Promise<void> | void
}

const AdoptionRequestModal: React.FC<Props> = ({ petId, petName, onSubmit }) => {
    const { closeModal } = useModal()
    const [message, setMessage] = useState("")

    const handleSend = async () => {
        await onSubmit?.({ petId, message })
        closeModal()
    }

    return (
        <BaseModal title={`Postular a ${petName ?? "la mascota"}`}>
            <View>
                <Text style={{ marginBottom: 6 }}>Escribe tu mensaje para el dador:</Text>
                <TextInput
                    placeholder="Ej: Tengo patio y tiempo para paseos diarios…"
                    multiline
                    value={message}
                    onChangeText={setMessage}
                    style={{
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 10,
                        padding: 10,
                        minHeight: 90,
                    }}
                />
                <TouchableOpacity
                    onPress={handleSend}
                    style={{
                        marginTop: 12,
                        backgroundColor: "#2563eb",
                        padding: 12,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
                        Enviar postulación
                    </Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    )
}

export default AdoptionRequestModal
