import React, { useEffect } from "react"
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { SplashScreen, Stack } from "expo-router"
import { AuthProvider } from "../context/AuthContext"
import { LoadingProvider } from "../context/LoadingContext"
import { AlertProvider } from "../context/AlertContext"
import { ModalProvider } from "../context/ModalContext"
import { PublicationProvider } from "../context/PublicationContext"

import { ThemeProvider, useTheme } from "../context/ThemeContext"

export { ErrorBoundary } from "expo-router"

export const unstable_settings = {
    initialRouteName: "(home)",
}

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    })

    useEffect(() => {
        if (error) throw error
    }, [error])

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync()
        }
    }, [loaded])

    if (!loaded) {
        return null
    }

    return (
        <ThemeProvider>
            <RootLayoutNav />
        </ThemeProvider>
    )
}

function RootLayoutNav() {
    const { theme } = useTheme()

    return (
        <LoadingProvider>
            <AlertProvider>
                <ModalProvider>
                    <AuthProvider>
                        <PublicationProvider>
                            <NavThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
                                <Stack>
                                    <Stack.Screen name="(home)" options={{ headerShown: false }} />
                                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                    <Stack.Screen
                                        name="(shelter)"
                                        options={{ headerShown: false }}
                                    />
                                    <Stack.Screen name="camera" options={{ headerShown: false }} />
                                    <Stack.Screen
                                        name="publication-test"
                                        options={{ headerShown: false }}
                                    />
                                </Stack>
                            </NavThemeProvider>
                        </PublicationProvider>
                    </AuthProvider>
                </ModalProvider>
            </AlertProvider>
        </LoadingProvider>
    )
}
