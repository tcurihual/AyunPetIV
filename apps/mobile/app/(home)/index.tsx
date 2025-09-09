// apps/mobile/app/(home)/index.tsx
import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"

export default function Home() {
    const router = useRouter()

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Contenido central */}
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Bienvenido al Home</Text>

                <TouchableOpacity
                    style={{
                        marginTop: 20,
                        backgroundColor: "#F9C80E",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={() => router.push("/perfil")}
                >
                    <Text style={{ fontWeight: "bold", color: "#000" }}>
                        Ir al perfil del dador
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer fijo */}
            <View
                style={{
                    padding: 12,
                    borderTopWidth: 1,
                    borderColor: "#ddd",
                    alignItems: "center",
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
        </View>
    )
}
