import React from "react"
import { View, ScrollView, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import RequestDetailCard, { Status } from "@/components/common/RequestDetailCard"

export default function ShelterRequestDetail() {
    const router = useRouter()
    const { id } = useLocalSearchParams()

    const solicitud = {
        id: Number(id),
        petPhoto: "https://placekitten.com/400/400",
        petName: "Luna",
        requester: "Juan Pérez",
        date: "2025-10-18",
        status: "Aceptada" as Status,
        message: "Me encantaría adoptar a Luna y darle un hogar lleno de amor.",
    }

    const handleAccept = () => {
        console.log("Solicitud aceptada")
        router.back()
    }

    const handleReject = () => {
        console.log("Solicitud rechazada")
        router.back()
    }

    const handleConfirmCode = (codigo: string) => {
        console.log("Código confirmado:", codigo)
        router.back()
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <RequestDetailCard
                petPhoto={solicitud.petPhoto}
                petName={solicitud.petName}
                requester={solicitud.requester}
                date={solicitud.date}
                status={solicitud.status}
                message={solicitud.message}
                onAccept={handleAccept}
                onReject={handleReject}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
})
