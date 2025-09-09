import React from "react"
import { Stack, Redirect } from "expo-router"
import { useAuthContext } from "../../src/context/AuthContext"

export default function TabsLayout() {
    const { status } = useAuthContext()

    if (status === "loading") return null
    if (status !== "authenticated") return <Redirect href="/(auth)/login" />

    return <Stack screenOptions={{ headerShown: false }} />
}
