import React from "react"
import { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { isFirstLaunch } from "@/utils/storage"

export default function Index() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkStorage = async () => {
            try {
                const user = await AsyncStorage.getItem("user")
                const firstTime = await isFirstLaunch()
                if (user) {
                    router.replace("/(home)")
                } else {
                    if (firstTime) {
                        router.replace("/(auth)")
                    } else {
                        router.replace("/(auth)/login")
                    }
                }
            } catch {
                router.replace("/(auth)")
            } finally {
                setLoading(false)
            }
        }
        checkStorage()
    }, [router])

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return null
}
