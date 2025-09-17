import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"

export default function Home() {
    const router = useRouter()

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <Text>Bienvenido al Home</Text>

                <TouchableOpacity
                    style={{
                        marginTop: 8,
                        backgroundColor: "#2563eb",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/camera")}
                >
                    <Text style={{ fontWeight: "bold", color: "#fff" }}>Abrir cámara</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        marginTop: 12,
                        backgroundColor: "#F9C80E",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/profile")}
                >
                    <Text style={{ fontWeight: "bold", color: "#000" }}>
                        Ir al perfil del dador
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        marginTop: 12,
                        backgroundColor: "#F7C948",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/(requests)/requestList")}
                >
                    <Text style={{ fontWeight: "bold", color: "#1C1C1C" }}>Ir a Solicitudes</Text>
                </TouchableOpacity>
            </View>

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
                        marginBottom: 12,
                    }}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
