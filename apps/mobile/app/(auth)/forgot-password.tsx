import React, { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useLoading } from "@/context/LoadingContext"

const { width, height } = Dimensions.get("window")

export default function ForgotPasswordScreen() {
    const router = useRouter()
    const { withLoading } = useLoading()
    const [email, setEmail] = useState("")
    const styles = useThemeStyles(width, height)

    const handleSendRecovery = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Por favor ingresa tu email")
            return
        }

        try {
            await withLoading(async () => {
                // Simular envío de email de recuperación
                await new Promise((resolve) => setTimeout(resolve, 2000))
                Alert.alert("Email enviado", "Se ha enviado un link de recuperación a tu email", [
                    { text: "OK", onPress: () => router.back() },
                ])
            })
        } catch (error) {
            Alert.alert("Error", "No se pudo enviar el email de recuperación")
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Recuperar contraseña</Text>
                <View style={styles.semiCircle} />
                <Image
                    source={require("@images/ayun-pet.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="key-outline" size={22} color="#A47CF3" />
                    </View>
                    <Text style={styles.instruction}>
                        Ingresa tu correo para{"\n"}restablecer tu contraseña
                    </Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.button} onPress={handleSendRecovery}>
                    <Text style={styles.buttonText}>Enviar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                    <Text style={styles.secondaryButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const useThemeStyles = (width: number, height: number) => {
    const headerHeight = Math.max(height * 0.25, 180)
    const logoSize = Math.min(width * 0.4, 150)

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
        },
        backButton: {
            position: "absolute",
            top: height * 0.05,
            left: width * 0.05,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: 8,
        },
        header: {
            backgroundColor: "#FFD24C",
            width: "110%",
            height: headerHeight,
            alignItems: "center",
            justifyContent: "center",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            position: "relative",
            marginBottom: 20,
        },
        headerTitle: {
            fontSize: width < 350 ? 18 : 22,
            fontWeight: "bold",
            color: "#222",
            marginTop: height * 0.07,
            textAlign: "center",
        },
        logo: {
            width: logoSize,
            height: logoSize * 0.85,
            top: 20,
            zIndex: 1,
        },
        semiCircle: {
            position: "absolute",
            bottom: Math.max(-logoSize * 0.27, -40),
            width: Math.max(logoSize * 1.2, 100),
            height: Math.max(logoSize * 0.7, 70),
            backgroundColor: "#fff",
            borderTopLeftRadius: Math.max(logoSize * 0.6, 50),
            borderTopRightRadius: Math.max(logoSize * 0.6, 50),
            alignSelf: "center",
            zIndex: 0,
        },
        content: {
            flex: 1,
            alignItems: "center",
            paddingHorizontal: 20,
            width: "100%",
            marginTop: 30,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
            width: "90%",
        },
        iconCircle: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#EFE9FE",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
        },
        instruction: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#000",
        },
        input: {
            width: "90%",
            height: 45,
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 18,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#A47CF3",
            color: "#222",
        },
        button: {
            width: "80%",
            height: 45,
            backgroundColor: "#FFD24C",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
            elevation: 3,
        },
        buttonText: {
            color: "#222",
            fontWeight: "600",
            fontSize: 16,
        },
        secondaryButton: {
            width: "80%",
            height: 45,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 12,
            borderWidth: 2,
            borderColor: "#FFD24C",
            backgroundColor: "#fff",
        },
        secondaryButtonText: {
            color: "#FFD24C",
            fontWeight: "600",
            fontSize: 16,
        },
    })
}
