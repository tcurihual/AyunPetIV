import React, { useEffect, useState } from "react"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import { useColorScheme } from "react-native"

import { AuthProvider } from "@/context/AuthContext"
import { ModalProvider } from "@/context/ModalContext"

import { AlertProvider } from "@/context/AlertContext"
import { Alert } from "@/components/ui/Alert"

import Loading from "@ui/Loading"
import ModalHost from "@common/modals/ModalHost"

// Evitar que la splash se oculte antes de cargar assets
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require("@fonts/SpaceMono-Regular.ttf"),
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync()
    }, [loaded])

    if (!loaded) return null

    // (tabs) se encuentra commentado ya que no se encuentra del flujo, pero

    return (
        <AuthProvider>
            <ModalProvider>
                <AlertProvider>
                    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(auth)" />
                            <Stack.Screen name="(home)" />
                            <Stack.Screen name="+not-found" />
                        </Stack>

                        <ModalHost />
                        <Loading visible={loading} />
                        <Alert />

                        <StatusBar style="inverted" />
                    </ThemeProvider>
                </AlertProvider>
            </ModalProvider>
        </AuthProvider>
    )
}
