/**
 * Contexto de Notificaciones Push
 *
 * Este contexto gestiona el estado global de las notificaciones push en la aplicación:
 * - Registro del token push del dispositivo
 * - Sincronización del token con el backend
 * - Listeners de notificaciones recibidas y tocadas
 * - Estado de permisos de notificaciones
 */

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import * as Notifications from "expo-notifications"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"

import { useAuthContext } from "./AuthContext"
import {
    registerForPushNotifications,
    handleNotificationResponse,
    clearBadge,
    NotificationData,
} from "@/services/notifications"

interface LastAdoptionInfo {
    requestId: number | null
    code: string | null
}

interface NotificationContextType {
    expoPushToken: string | null
    notification: Notifications.Notification | null
    permissionGranted: boolean
    isRegistering: boolean
    registerToken: () => Promise<void>
    sendTestNotification: () => Promise<void>
    lastAdoptionInfo: LastAdoptionInfo | null
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
    const [notification, setNotification] = useState<Notifications.Notification | null>(null)
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
    const [isRegistering, setIsRegistering] = useState<boolean>(false)
    const [lastAdoptionInfo, setLastAdoptionInfo] = useState<LastAdoptionInfo | null>(null)

    const { user, status } = useAuthContext()
    const router = useRouter()

    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined)
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined)

    /**
     * Registra el token push del dispositivo y lo envía al backend
     */
    const registerToken = async () => {
        if (isRegistering || expoPushToken) {
            return
        }

        setIsRegistering(true)
        try {
            const token = await registerForPushNotifications()

            if (token) {
                setExpoPushToken(token)
                setPermissionGranted(true)

                // Enviar el token al backend si el usuario está autenticado
                if (status === "authenticated" && user) {
                    await sendTokenToBackend(token)
                }
            } else {
                setPermissionGranted(false)
            }
        } catch (error) {
            console.error("Error al registrar token push:", error)
            setPermissionGranted(false)
        } finally {
            setIsRegistering(false)
        }
    }

    /**
     * Envía el token push al backend
     */
    const sendTokenToBackend = async (token: string) => {
        try {
            console.log("🔄 Importando servicio de push token...")
            // Importar dinámicamente para evitar problemas de dependencias circulares
            const { savePushTokenToBackend, isPushTokenSaved } = await import(
                "@/services/pushTokenService"
            )

            const userId = user?.id?.toString()
            console.log("🔍 Verificando si token ya fue guardado para usuario:", userId)

            const alreadySaved = await isPushTokenSaved(token, userId)
            if (alreadySaved) {
                return
            }

            const result = await savePushTokenToBackend(token, userId)

            if (!result.success) {
                console.error("Error al guardar token en backend:", result.error)
            }
        } catch (error) {
            console.error("Error al enviar token al backend:", error)
        }
    }

    async function handleAdoptionApprovedFromData(data: NotificationData) {
        if (data.type !== "adoption_approved") return

        const requestId = data.requestId ? Number(data.requestId) : null
        const code = typeof data.confirmationCode === "string" ? data.confirmationCode : null

        // Guardar en SecureStore (opcional, ya lo estabas haciendo)
        if (requestId && code) {
            await SecureStore.setItemAsync("last_adoption_request_id", String(requestId))
            await SecureStore.setItemAsync("last_adoption_confirmation_code", code)
        }

        // Guardar en memoria para que el resto de la app reaccione
        setLastAdoptionInfo({ requestId, code })

        console.log("💾 Último código de adopción:", { requestId, code })
    }

    /**
     * Envía una notificación de prueba local
     */
    const sendTestNotification = async () => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🐾 Ayün Pet",
                    body: "Esta es una notificación de prueba",
                    data: { type: "test" },
                    sound: "default",
                },
                trigger: {
                    seconds: 1,
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                },
            })
            console.log("📬 Notificación de prueba enviada")
        } catch (error) {
            console.error("Error al enviar notificación de prueba:", error)
        }
    }

    /**
     * Efecto: Registrar token cuando el usuario se autentica
     */
    useEffect(() => {
        if (status === "authenticated" && user) {
            // Si ya tenemos el token, solo enviarlo al backend para el nuevo usuario
            if (expoPushToken) {
                console.log("🔄 Usuario cambió, enviando token existente al backend...")
                sendTokenToBackend(expoPushToken)
            } else {
                // Si no tenemos token, registrarlo
                registerToken()
            }
        }
    }, [status, user])

    /**
     * Efecto: Configurar listeners de notificaciones
     */
    useEffect(() => {
        // Listener: notificación recibida con la app en primer plano
        notificationListener.current = Notifications.addNotificationReceivedListener(
            async (notification: Notifications.Notification) => {
                console.log("📩 Notificación recibida:", notification)
                setNotification(notification)

                const data = notification.request.content.data as NotificationData

                await handleAdoptionApprovedFromData(data)

                if (data.type?.includes("adoption")) {
                    console.log(
                        "🔄 Detectada notificación de adopción, refrescar datos si es necesario"
                    )
                }
            }
        )

        // Listener: el usuario toca la notificación
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            async (response: Notifications.NotificationResponse) => {
                console.log("📲 Usuario tocó la notificación")

                const data = response.notification.request.content.data as NotificationData

                await handleAdoptionApprovedFromData(data)

                handleNotificationResponse(response, router)
                clearBadge()
            }
        )

        // Cleanup
        return () => {
            notificationListener.current?.remove()
            responseListener.current?.remove()
        }
    }, [router])

    /**
     * Efecto: Limpiar badge cuando la app se abre
     */
    useEffect(() => {
        clearBadge()
    }, [])

    const value = {
        expoPushToken,
        notification,
        permissionGranted,
        isRegistering,
        registerToken,
        sendTestNotification,
        lastAdoptionInfo,
    }

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

/**
 * Hook para usar el contexto de notificaciones
 */
export const useNotifications = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotifications debe ser usado dentro de NotificationProvider")
    }
    return context
}
