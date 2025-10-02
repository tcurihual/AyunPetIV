import React from "react"
import { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { isFirstLaunch } from "@/utils/storage"
import { useAuthContext } from "@/context/AuthContext"

export default function Index() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const { status } = useAuthContext()

    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const firstTime = await isFirstLaunch()

                if (status === "loading") {
                    setLoading(true)
                    return
                }

                if (status === "unauthenticated") {
                    if (firstTime) {
                        router.replace("/(auth)/intermediate-view")
                    } else {
                        router.replace("/(auth)/login")
                    }
                }
            } catch {
                router.replace("/(auth)/login")
            } finally {
                setLoading(false)
            }
        }
        checkFirstLaunch()
    }, [router, status])

    if (loading || status === "loading") {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return null
}
