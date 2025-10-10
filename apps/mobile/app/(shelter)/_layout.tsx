import React from "react"
import { Stack } from "expo-router"
import StatusBar from "@common/StatusBar"

export default function ShelterLayout() {
    return (
        <>
            <StatusBar variant="yellow" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
