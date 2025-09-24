import React, { useMemo } from "react"
import { View, Alert } from "react-native"
import { useLocalSearchParams } from "expo-router"
import RequestDetailCard, { Status } from "@/components/common/RequestDetailCard"

const MOCK = [
    {
        id: "1",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Firulais",
        requester: "Pepito Pérez",
        date: "11 de Abril de 2025",
        status: "Aceptada" as Status,
    },
    {
        id: "2",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Luna",
        requester: "María López",
        date: "12 de Abril de 2025",
        status: "Pendiente" as Status,
    },
    {
        id: "3",
        petPhoto:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
        petName: "Max",
        requester: "Juan Torres",
        date: "14 de Abril de 2025",
        status: "Rechazada" as Status,
    },
    {
        id: "4",
        petPhoto:
            "https://images.unsplash.com/photo-1558788353-f76d92427f16?q=80&w=800&auto=format&fit=crop",
        petName: "Nina",
        requester: "Carla Muñoz",
        date: "15 de Abril de 2025",
        status: "Pendiente" as Status,
    },
    {
        id: "5",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Rocky",
        requester: "Diego Herrera",
        date: "16 de Abril de 2025",
        status: "Aceptada" as Status,
    },
    {
        id: "6",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Maya",
        requester: "Fernanda Soto",
        date: "17 de Abril de 2025",
        status: "Rechazada" as Status,
    },
    {
        id: "7",
        petPhoto:
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
        petName: "Toby",
        requester: "Andrés Valdés",
        date: "18 de Abril de 2025",
        status: "Pendiente" as Status,
    },
    {
        id: "8",
        petPhoto:
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800&auto=format&fit=crop",
        petName: "Simba",
        requester: "Constanza Rivas",
        date: "19 de Abril de 2025",
        status: "Aceptada" as Status,
    },
]

export default function RequestDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()

    const solicitud = useMemo(() => MOCK.find((r) => r.id === String(id)), [id])

    if (!solicitud) {
        return <View></View>
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
            <RequestDetailCard
                petPhoto={solicitud.petPhoto}
                petName={solicitud.petName}
                requester={solicitud.requester}
                date={solicitud.date}
                status={solicitud.status}
                message={`Estoy muy interesado en adoptar a ${solicitud.petName}`}
                onAccept={() => Alert.alert("✔", "Solicitud aceptada")}
                onReject={() => Alert.alert("✘", "Solicitud rechazada")}
            />
        </View>
    )
}
