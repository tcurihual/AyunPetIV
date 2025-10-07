import React, { useEffect } from "react"
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
import ModalHost from "@common/modals/ModalHost"
import { LoadingProvider } from "@/context/LoadingContext"
import AuthRedirect from "@/components/AuthRedirect"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require("@fonts/SpaceMono-Regular.ttf"),
    })

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync()
    }, [loaded])

    if (!loaded) return null

    // (tabs) se encuentra commentado ya que no se encuentra del flujo, pero

    return (
        <AuthProvider>
            <ModalProvider>
                <AlertProvider>
                    <LoadingProvider>
                        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                            <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="splash" />
                                <Stack.Screen name="(auth)" />
                                <Stack.Screen name="(home)" />
                                <Stack.Screen name="(shelter)" />
                                <Stack.Screen name="+not-found" />
                            </Stack>

                            <ModalHost />
                            <Alert />
                            <AuthRedirect />

                            <StatusBar style="inverted" />
                        </ThemeProvider>
                    </LoadingProvider>
                </AlertProvider>
            </ModalProvider>
        </AuthProvider>
    )
}
