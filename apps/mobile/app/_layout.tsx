import React, { useEffect } from "react"
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { SplashScreen, Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { AuthProvider } from "@/context/AuthContext"
import { LoadingProvider, useLoading } from "@/context/LoadingContext"
import { registerLoadingHandler } from "@/services/http"
import { AlertProvider } from "@/context/AlertContext"
import { ModalProvider } from "@/context/ModalContext"
import { PublicationProvider } from "@/context/PublicationContext"
import { MessageProvider } from "@/context/MessageContext"
import { ReportProvider } from "@/context/ReportContext"
import { AdoptionRequestProvider } from "@/context/AdoptionRequestContext"
import { QuestionProvider } from "@/context/QuestionContext"
import { PostFormProvider } from "@/context/PostFormContext"
import { PostResponsesProvider } from "@/context/PostResponsesContext"
import { NotificationProvider } from "@/context/NotificationContext"
import ModalHost from "@common/modals/ModalHost"
import { Alert } from "@/components/ui/Alert"
import AuthRedirect from "@/features/AuthRedirect"
import { ThemeProvider, useTheme } from "../context/ThemeContext"

export { ErrorBoundary } from "expo-router"

function LoadingHandlerBridge({ children }: { children: React.ReactNode }) {
    const { showLoading, hideLoading } = useLoading()

    useEffect(() => {
        registerLoadingHandler({ showLoading, hideLoading })
    }, [showLoading, hideLoading])

    return <>{children}</>
}

function RootLayoutNav() {
    const { theme } = useTheme()

    return (
        <LoadingProvider>
            <AuthProvider>
                {/* ✔️ AuthRedirect colocado JUSTO después del AuthProvider */}
                <AuthRedirect />

                <AlertProvider>
                    <ModalProvider>
                        <QuestionProvider>
                            <PostFormProvider>
                                <PostResponsesProvider>
                                    <MessageProvider>
                                        <ReportProvider>
                                            <AdoptionRequestProvider>
                                                <PublicationProvider>
                                                    <NotificationProvider>
                                                        <LoadingHandlerBridge>
                                                            <NavThemeProvider
                                                                value={
                                                                    theme === "dark"
                                                                        ? DarkTheme
                                                                        : DefaultTheme
                                                                }
                                                            >
                                                                <Stack
                                                                    screenOptions={{
                                                                        headerShown: false,
                                                                    }}
                                                                >
                                                                    <Stack.Screen name="index" />
                                                                    <Stack.Screen name="(auth)" />
                                                                    <Stack.Screen name="(home)" />
                                                                    <Stack.Screen name="(shelter)" />
                                                                    <Stack.Screen name="+not-found" />
                                                                </Stack>

                                                                <ModalHost />
                                                                <Alert />
                                                                <StatusBar style="auto" />
                                                            </NavThemeProvider>
                                                        </LoadingHandlerBridge>
                                                    </NotificationProvider>
                                                </PublicationProvider>
                                            </AdoptionRequestProvider>
                                        </ReportProvider>
                                    </MessageProvider>
                                </PostResponsesProvider>
                            </PostFormProvider>
                        </QuestionProvider>
                    </ModalProvider>
                </AlertProvider>
            </AuthProvider>
        </LoadingProvider>
    )
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

    if (!loaded) return null

    return (
        <ThemeProvider>
            <RootLayoutNav />
        </ThemeProvider>
    )
}
