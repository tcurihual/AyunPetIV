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
                const isGiverOrShelter = user.role === 21 || user.role === 22
                router.replace(isGiverOrShelter ? "/(shelter)" : "/(home)")
                return
            }

            if (status === "unauthenticated") {
                const target = user ? "/(auth)/remembered-login" : "/(auth)/login"
                router.replace(target)
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
