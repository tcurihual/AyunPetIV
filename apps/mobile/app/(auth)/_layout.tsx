import React from "react"
import { Stack, Redirect } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function AuthLayout() {
    const { status } = useAuthContext()

    if (status === "loading") return null

    if (status === "authenticated") return <Redirect href="/(tabs)" />

    return <Stack screenOptions={{ headerShown: false }} />
}
