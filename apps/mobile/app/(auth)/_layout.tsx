import React, { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useTheme } from "../../context/ThemeContext"

export default function AuthLayout() {
    const { setForceTheme } = useTheme()

    // Forzar modo claro en pantallas de autenticación
    useEffect(() => {
        setForceTheme("light")
        
        // Restaurar al salir
        return () => {
            setForceTheme(null)
        }
    }, [setForceTheme])

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
