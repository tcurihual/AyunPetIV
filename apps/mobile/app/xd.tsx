import React, { useEffect } from "react"
import { View, Image, Alert, BackHandler, Text } from "react-native"
import LottieView from "lottie-react-native"
import NetInfo from "@react-native-community/netinfo"
import { Colors } from "@/constants/Colors"

export default function Index() {
    // useEffect(() => {
    //     // Mantener solo la validación de conexión
    //     checkConnection()
    // }, [])

    const checkConnection = async () => {
        try {
            const state = await NetInfo.fetch()

            if (!state.isConnected || state.isInternetReachable === false) {
                return showNoInternet()
            }

            try {
                const response = await fetch("https://www.google.com", { method: "HEAD" })
                if (!response.ok) throw new Error("Sin internet real")
            } catch {
                return showNoInternet()
            }
        } catch {
            showNoInternet()
        }
    }

    const showNoInternet = () => {
        Alert.alert("Sin conexión", "No tienes acceso a internet.", [
            { text: "Reintentar", onPress: checkConnection },
            { text: "Salir", style: "destructive", onPress: () => BackHandler.exitApp() },
        ])
    }

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Image
                source={require("@images/image.png")}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
            />

            <View style={{ position: "absolute", bottom: "10%", alignItems: "center" }}>
                <LottieView
                    source={require("@animations/Dog-walking.json")}
                    autoPlay
                    style={{ width: 175, height: 175 }}
                />
                <Text style={{ fontSize: 18, fontWeight: "500" }}>Cargando...</Text>
            </View>
        </View>
    )
}
