import React, { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"

import { useAuthContext } from "@/context/AuthContext"
import { isFirstLaunch, markFirstLaunch } from "@/utils/storage"

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
            router.replace("/(auth)/(login)/")

            // if (status === "authenticated" && user) {
            //     const isGiverOrShelter = user.role === 21 || user.role === 22
            //     router.replace(isGiverOrShelter ? "/(shelter)" : "/(home)")
            //     return
            // }

            // if (status === "unauthenticated") {
            //     router.replace("/(auth)/(login)/")
            //     return
            // }
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
