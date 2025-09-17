import React from "react"
import { SafeAreaView, View, Text, StyleSheet, FlatList } from "react-native"
import { useRouter } from "expo-router"
import RequestCard, { RequestStatus } from "@/components/common/RequestCard"

const MOCK = [
    {
        id: "1",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Firulais",
        requester: "Pepito Pérez",
        date: "11 de Abril de 2025",
        status: "Aceptada" as RequestStatus,
    },
    {
        id: "2",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Luna",
        requester: "María López",
        date: "12 de Abril de 2025",
        status: "Pendiente" as RequestStatus,
    },
    {
        id: "3",
        petPhoto:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
        petName: "Max",
        requester: "Juan Torres",
        date: "14 de Abril de 2025",
        status: "Rechazada" as RequestStatus,
    },
    {
        id: "4",
        petPhoto:
            "https://images.unsplash.com/photo-1558788353-f76d92427f16?q=80&w=800&auto=format&fit=crop",
        petName: "Nina",
        requester: "Carla Muñoz",
        date: "15 de Abril de 2025",
        status: "Pendiente" as RequestStatus,
    },
    {
        id: "5",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Rocky",
        requester: "Diego Herrera",
        date: "16 de Abril de 2025",
        status: "Aceptada" as RequestStatus,
    },
    {
        id: "6",
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        petName: "Maya",
        requester: "Fernanda Soto",
        date: "17 de Abril de 2025",
        status: "Rechazada" as RequestStatus,
    },
    {
        id: "7",
        petPhoto:
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
        petName: "Toby",
        requester: "Andrés Valdés",
        date: "18 de Abril de 2025",
        status: "Pendiente" as RequestStatus,
    },
    {
        id: "8",
        petPhoto:
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800&auto=format&fit=crop",
        petName: "Simba",
        requester: "Constanza Rivas",
        date: "19 de Abril de 2025",
        status: "Aceptada" as RequestStatus,
    },
]

export default function Requests() {
    const router = useRouter()

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
                ListHeaderComponent={
                    <View style={{ gap: 6, marginBottom: 8 }}>
                        <Text style={styles.h1}>Mis Solicitudes</Text>
                        <Text style={styles.sub}>Revisa tus solicitudes de adopción</Text>
                    </View>
                }
                data={MOCK}
                keyExtractor={(i) => i.id}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item }) => (
                    <RequestCard
                        petPhoto={item.petPhoto}
                        petName={item.petName}
                        requester={item.requester}
                        date={item.date}
                        status={item.status}
                        onPress={() =>
                            router.push({
                                pathname: "/[id]",
                                params: { id: item.id },
                            })
                        }
                    />
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F2" },
    h1: { fontSize: 22, fontWeight: "900", color: "#1C1C1C" },
    sub: { color: "#6B6B6B" },
})
