// app/_layout.tsx
import React, { useEffect, useState } from "react"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import { useColorScheme } from "react-native"

// Providers
import { AuthProvider } from "../src/context/AuthContext"
// IMPORTA EL LOADING
import Loading from "@/components/Loading"
import { ModalProvider } from "../src/context/ModalContext"

// Host de modales
import ModalHost from "../components/modals/ModalHost"

// Evitar que la splash se oculte antes de cargar assets
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync()
    }, [loaded])

    if (!loaded) return null

    return (
        <AuthProvider>
          <ModalProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
              
                  <ModalHost />
                  <Loading visible={loading} />

                <StatusBar style="auto" />
                {/* Loader global */}
            </ThemeProvider>
          </ModalProvider>
        </AuthProvider>
    )
}
