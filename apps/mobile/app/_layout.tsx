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
import { MessageProvider } from "@/context/MessageContext"
import { ReportProvider } from "@/context/ReportContext"
import { AdoptionRequestProvider } from "@/context/AdoptionRequestContext"
import { PublicationProvider } from "@/context/PublicationContext"
import { QuestionProvider } from "@/context/QuestionContext"
import { router } from "expo-router"

SplashScreen.preventAutoHideAsync()
// function RoleRedirect() {
//     const { user } = useAuthContext()

//     useEffect(() => {
//         if (!user) return

//         if (user.role === 20) {
//             router.replace("/(shelter)")
//         } else if (user.role === 19 || user.role === 21) {
//             router.replace("/(home)")
//         }
//     }, [user])

//     return null
// }

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
            <QuestionProvider>
                <MessageProvider>
                    <ReportProvider>
                        <AdoptionRequestProvider>
                            <PublicationProvider>
                                <ModalProvider>
                                    <AlertProvider>
                                        <LoadingProvider>
                                            <ThemeProvider
                                                value={
                                                    colorScheme === "dark"
                                                        ? DarkTheme
                                                        : DefaultTheme
                                                }
                                            >
                                                <Stack
                                                    initialRouteName="splash"
                                                    screenOptions={{ headerShown: false }}
                                                >
                                                    <Stack.Screen name="splash" />
                                                    <Stack.Screen name="(auth)" />
                                                    <Stack.Screen name="(home)" />
                                                    <Stack.Screen name="(shelter)" />
                                                    <Stack.Screen name="+not-found" />
                                                </Stack>

                                                <ModalHost />
                                                <Alert />
                                                <AuthRedirect />
                                                {/* <RoleRedirect /> */}
                                                <StatusBar
                                                    style="inverted"
                                                    backgroundColor="#000"
                                                />
                                            </ThemeProvider>
                                        </LoadingProvider>
                                    </AlertProvider>
                                </ModalProvider>
                            </PublicationProvider>
                        </AdoptionRequestProvider>
                    </ReportProvider>
                </MessageProvider>
            </QuestionProvider>
        </AuthProvider>
    )
}
