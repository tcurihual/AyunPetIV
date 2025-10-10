import React, { useEffect } from "react"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import { useColorScheme } from "react-native"

import { AuthProvider, useAuthContext } from "@/context/AuthContext"
import { ModalProvider } from "@/context/ModalContext"
import { AlertProvider } from "@/context/AlertContext"
import { Alert } from "@/components/ui/Alert"
import ModalHost from "@common/modals/ModalHost"
import { LoadingProvider } from "@/context/LoadingContext"
import AuthRedirect from "@/features/AuthRedirect"
import { AdoptionRequestProvider } from "@/context/AdoptionRequestContext"
import { router } from "expo-router"


SplashScreen.preventAutoHideAsync()
function RoleRedirect() {
  const { user } = useAuthContext()

  if (!user) return null

  if (user.role === 20) {
    router.replace("/(shelter)")
  } else if (user.role === 19) {
    router.replace("/(home)")
  } else if (user.role === 21) {
    router.replace("/(home)")
  }

  return null
}

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require("@fonts/SpaceMono-Regular.ttf"),
    })

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync()
    }, [loaded])

    if (!loaded) return null

    return (
        <AuthProvider>
            <AdoptionRequestProvider>
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
                            <RoleRedirect />

                            <StatusBar style="inverted" backgroundColor="#000" />
                        </ThemeProvider>
                    </LoadingProvider>
                </AlertProvider>
            </ModalProvider>
            </AdoptionRequestProvider>
        </AuthProvider>
    )
}
