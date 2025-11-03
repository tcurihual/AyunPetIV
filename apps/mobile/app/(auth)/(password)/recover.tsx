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
    ActivityIndicator,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { passwordResetService } from "@/services/passwordReset"

const { width, height } = Dimensions.get("window")

export default function RecoveryPinScreen() {
    const router = useRouter()
    const params = useLocalSearchParams<{ email?: string }>()
    const [pin, setPin] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const styles = useThemeStyles(width, height)

    const userEmail = params.email || ""

    const handleVerifyPin = async () => {
        if (!pin.trim()) {
            Alert.alert("Error", "Por favor ingresa el código de 6 dígitos")
            return
        }

        if (!passwordResetService.isValidCode(pin.trim())) {
            Alert.alert("Error", "El código debe ser de 6 dígitos numéricos")
            return
        }

        if (!newPassword.trim()) {
            Alert.alert("Error", "Por favor ingresa tu nueva contraseña")
            return
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
            return
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden")
            return
        }

        if (!userEmail) {
            Alert.alert("Error", "No se encontró el email. Por favor regresa y vuelve a intentar.")
            return
        }

        setIsLoading(true)

        try {
            // normalizar código (eliminar espacios) antes de enviarlo al backend
            const normalizedPin = pin.replace(/\s/g, "")

            const response = await passwordResetService.verifyResetCode(
                userEmail,
                pin.trim(),
                newPassword
            )

            if (response.type === "success") {
                Alert.alert("¡Contraseña cambiada!", response.message, [
                    {
                        text: "Ir al inicio de sesión",
                        onPress: () => router.push("/(auth)/login"),
                    },
                ])
            } else {
                Alert.alert("Error", response.message)
            }
        } catch (error) {
            Alert.alert("Error", "Ocurrió un error inesperado. Intenta nuevamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ingresar PIN</Text>
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
                        <Ionicons name="mail-outline" size={22} color="#A47CF3" />
                    </View>
                    <Text style={styles.instruction}>
                        Un código de recuperación fue{"\n"}enviado a{" "}
                        {userEmail ? userEmail : "su correo"}
                    </Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Código de 6 dígitos"
                    placeholderTextColor="#888"
                    value={passwordResetService.formatCode(pin)}
                    onChangeText={(text) => {
                        const digits = text.replace(/\s/g, "").slice(0, 6) // Limitar a 6 dígitos
                        setPin(digits)
                    }}
                    keyboardType="number-pad"
                    maxLength={7} // Permite espacios en el formato
                />

                <TextInput
                    style={[styles.input, { textAlign: "left", letterSpacing: 0 }]}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#888"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />

                <TextInput
                    style={[styles.input, { textAlign: "left", letterSpacing: 0 }]}
                    placeholder="Confirmar nueva contraseña"
                    placeholderTextColor="#888"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleVerifyPin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#222" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Cambiar contraseña</Text>
                    )}
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
            textAlign: "center",
            letterSpacing: 4,
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
        buttonDisabled: {
            opacity: 0.6,
        },
    })
}
