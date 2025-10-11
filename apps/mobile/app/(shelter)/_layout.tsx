import React from "react"
import { Stack, Redirect } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function ShelterLayout() {
    // const { user } = useAuthContext()

    // solo el rol 20 puede estar aquí
    // if (!user) return <Redirect href="/(auth)/login" />
    // if (user.role !== 20) return <Redirect href="/(home)" />

    return <Stack screenOptions={{ headerShown: false }} />
}
