import React from "react"
import { Stack } from "expo-router"

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "fade",
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="giver_register" />
            <Stack.Screen name="forgot-password" />
        </Stack>
    )
}