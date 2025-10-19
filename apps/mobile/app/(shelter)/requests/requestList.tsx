import React, { useMemo } from "react"
import { SafeAreaView, View, Text, FlatList, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import RequestCard, { RequestStatus } from "@/components/common/RequestCard"
import { useAuthContext } from "@/context/AuthContext"
import { Status } from "@/components/common/RequestDetailCard"

const MOCK = [
    {
        id: "1",
        petName: "Firulais",
        adoptante: "Pepito Pérez",
        estado: "Pendiente" as Status,
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        fecha: "11 de Abril de 2025",
    },
    {
        id: "2",
        petName: "Luna",
        adoptante: "María López",
        estado: "Aceptada" as Status,
        petPhoto:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop",
        fecha: "12 de Abril de 2025",
    },
    {
        id: "3",
        petName: "Toby",
        adoptante: "Andrés Valdés",
        estado: "Rechazada" as Status,
        petPhoto:
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
        fecha: "13 de Abril de 2025",
    },
]

export default function ShelterRequests() {
    const router = useRouter()
    const { user } = useAuthContext()
    const role = user?.role

    const solicitudes = useMemo(() => MOCK, [])

    const handleAccept = (id: string) => {
        Alert.alert("✔", `Solicitud ${id} aceptada`)
    }

    const handleReject = (id: string) => {
        Alert.alert("✘", `Solicitud ${id} rechazada`)
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
                ListHeaderComponent={
                    <View style={{ gap: 6, marginBottom: 8 }}>
                        <Text style={styles.h1}>Solicitudes de adopción</Text>
                        <Text style={styles.sub}>Gestiona las solicitudes de tus mascotas</Text>
                    </View>
                }
                data={solicitudes}
                keyExtractor={(i) => i.id}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item }) => (
                    <RequestCard
                        petPhoto={item.petPhoto}
                        petName={item.petName}
                        requester={item.adoptante}
                        date={item.fecha}
                        status={item.estado}
                        onPress={() =>
                            router.push({
                                pathname: "/(shelter)/requests/[id]",
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
