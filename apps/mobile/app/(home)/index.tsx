import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import BottomNavbar from "@/components/BottomNavbar"

export default function Home() {
    const router = useRouter()

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Contenido central */}
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <Text>Bienvenido al Home</Text>

                {/* Botón para abrir cámara */}
                <TouchableOpacity
                    style={{
                        marginTop: 8,
                        backgroundColor: "#2563eb",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/camara")}
                >
                    <Text style={{ fontWeight: "bold", color: "#fff" }}>Abrir cámara</Text>
                </TouchableOpacity>

                {/* Botón para ir a perfil del dador */}
                <TouchableOpacity
                    style={{
                        marginTop: 12,
                        backgroundColor: "#F9C80E",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/(home)/perfil")}
                >
                    <Text style={{ fontWeight: "bold", color: "#000" }}>
                        Ir al perfil del dador
                    </Text>
                </TouchableOpacity>

                {/* Botón para ir a Solicitudes */}
                <TouchableOpacity
                    style={{
                        marginTop: 12,
                        backgroundColor: "#F7C948",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/requestList")}
                >
                    <Text style={{ fontWeight: "bold", color: "#1C1C1C" }}>Ir a Solicitudes</Text>
                </TouchableOpacity>
            </View>

            {/* Footer fijo */}
            <View
                style={{
                    padding: 12,
                    borderTopWidth: 1,
                    borderColor: "#ddd",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <TouchableOpacity
                    style={{
                        backgroundColor: "#000",
                        paddingVertical: 12,
                        paddingHorizontal: 30,
                        borderRadius: 8,
                    }}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

            {/* BottomNavbar */}
            <BottomNavbar
                activeTab="home"
                onTabPress={(tab) => {
                    if (tab === "home") return router.replace("/(home)")
                    if (tab === "camara") return router.push("/camara")
                    if (tab === "requests") return router.push("/requestList")
                    if (tab === "perfil") return router.push("/(home)/perfil")
                    console.log("Tab no mapeada:", tab)
                }}
            />
        </View>
    )
}
