import React, { useEffect, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { getUser, getPlainPassword } from "@/utils/storage"
import { useAuthContext, User } from "@/context/AuthContext"

export default function AutoLoginScreen() {
    const router = useRouter()
    const { signIn } = useAuthContext()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const tryAutoLogin = async () => {
            const storedUser = await getUser<User>()
            const storedPassword = await getPlainPassword()

            if (storedUser && storedPassword && storedUser.email) {
                try {
                    await signIn({ email: storedUser.email, password: storedPassword })
                    router.replace("/check-role")
                } catch (e) {
                    console.error("Error al iniciar sesión automática:", e)
                    router.replace("/(auth)/login")
                }
            } else {
                router.replace("/(auth)/login")
            }

            setLoading(false)
        }

        tryAutoLogin()
    }, [])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Verificando sesión guardada…</Text>
            </View>
        )
    }

    return null
}
