import React, { useEffect } from "react"
import { Stack, useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function Layout() {
    const router = useRouter()
    const { status, user } = useAuthContext()

    const isShelterUser = (user: any) => {
        if (!user) return false
        return (
            user.id === "21" ||
            user.role === "shelter" ||
            (typeof user.role === "number" && user.role === 21) ||
            user.role === 21
        )
    }

    useEffect(() => {
        if (status === "loading") return

        if (status === "unauthenticated" || !user) {
            router.replace("/(auth)/login")
            return
        }

        if (!isShelterUser(user)) {
            router.replace("/(home)")
        }
    }, [status, user, router])

    if (status === "loading") {
        return null
    }

    if (status === "authenticated" && user && isShelterUser(user)) {
        return <Stack screenOptions={{ headerShown: false }} />
    }

    return null
}
