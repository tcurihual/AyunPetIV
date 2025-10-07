import React, { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { isFirstLaunch, markFirstLaunch } from "@/utils/storage"
import { useAuthContext } from "@/context/AuthContext"

export default function Index() {
    const router = useRouter()
    const { status, user } = useAuthContext()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        ;(async () => {
            const first = await isFirstLaunch()

            if (status === "loading") return

            if (first) {
                await markFirstLaunch()
                router.replace("/(auth)/welcome")
                return
            }

            if (status === "authenticated" && user) {
                router.replace(user.role === 21 ? "/(shelter)" : "/(home)")
                return
            }

            setChecking(false)
        })()
    }, [status, user])

    if (checking || status === "loading") {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return null
}
