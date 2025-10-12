import React, { useEffect } from "react"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import { useColorScheme, View, ActivityIndicator } from "react-native"

import { AuthProvider, useAuthContext } from "@/context/AuthContext"
import { ModalProvider } from "@/context/ModalContext"
import { AlertProvider } from "@/context/AlertContext"
import { Alert } from "@/components/ui/Alert"
import ModalHost from "@common/modals/ModalHost"
import { LoadingProvider } from "@/context/LoadingContext"
import { MessageProvider } from "@/context/MessageContext"
import { ReportProvider } from "@/context/ReportContext"
import { AdoptionRequestProvider } from "@/context/AdoptionRequestContext"

SplashScreen.preventAutoHideAsync()

function AppNavigator() {
    const { status, user } = useAuthContext()

    if (status === "loading") {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                }}
            >
                <ActivityIndicator size="large" color="#9B6DD7" />
            </View>
        )
    }

    if (status === "authenticated" && user) {
        if (user.role === 20) {
            return <Stack initialRouteName="(shelter)" screenOptions={{ headerShown: false }} />
        } else if (user.role === 19 || user.role === 21) {
            return <Stack initialRouteName="(home)" screenOptions={{ headerShown: false }} />
        }
    }

    return <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false }} />
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
            <MessageProvider>
                <ReportProvider>
                    <AdoptionRequestProvider>
                        <ModalProvider>
                            <AlertProvider>
                                <LoadingProvider>
                                    <ThemeProvider
                                        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                                    >
                                        <AppNavigator />

                                        <ModalHost />
                                        <Alert />
                                        <StatusBar style="light" />
                                    </ThemeProvider>
                                </LoadingProvider>
                            </AlertProvider>
                        </ModalProvider>
                    </AdoptionRequestProvider>
                </ReportProvider>
            </MessageProvider>
        </AuthProvider>
    )
}
