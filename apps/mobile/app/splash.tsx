import React, { useEffect } from "react"
import { View, Text, ActivityIndicator, StyleSheet, Alert, BackHandler } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { useRouter } from "expo-router"
import { getToken, getUser, isFirstLaunch } from "@/utils/storage"
import type { User } from "@/context/AuthContext"

export default function SplashScreen() {
    const router = useRouter()

    const checkAppState = async () => {
        try {
            const state = await NetInfo.fetch()
            if (!state.isConnected || state.isInternetReachable === false) {
                Alert.alert("Sin conexión", "No tienes acceso a internet.", [
                    { text: "Reintentar", onPress: checkAppState },
                    {
                        text: "Cerrar app",
                        style: "destructive",
                        onPress: () => BackHandler.exitApp(),
                    },
                ])
                return
            }

            try {
                const response = await fetch("https://www.google.com", { method: "HEAD" })
                if (!response.ok) throw new Error("No se pudo acceder a internet")
            } catch {
                Alert.alert("Sin conexión", "No se pudo acceder a internet.", [
                    { text: "Reintentar", onPress: checkAppState },
                    {
                        text: "Cerrar app",
                        style: "destructive",
                        onPress: () => BackHandler.exitApp(),
                    },
                ])
                return
            }

            const [storedToken, storedUser] = await Promise.all([getToken(), getUser<User>()])

            if (storedToken && storedUser) {
                router.replace("/(home)")
                return
            }

            const firstTime = await isFirstLaunch()
            if (firstTime) {
                router.replace("/welcome")
            } else {
                router.replace("/(auth)/login")
            }
        } catch (error) {
            console.error("Error en splash:", error)
            Alert.alert("Error", "Ha ocurrido un problema al iniciar la app.", [
                { text: "Reintentar", onPress: checkAppState },
                { text: "Cerrar app", style: "destructive", onPress: () => BackHandler.exitApp() },
            ])
        }
    }

    useEffect(() => {
        checkAppState()
    }, [])

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.text}>Cargando...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    text: {
        marginTop: 10,
        fontSize: 16,
    },
})
