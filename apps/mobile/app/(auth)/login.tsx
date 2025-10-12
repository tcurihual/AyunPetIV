import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { useRouter } from "expo-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import * as LocalAuthentication from "expo-local-authentication"
import { Ionicons } from "@expo/vector-icons"

import { useAuthContext } from "@/context/AuthContext"
import { useLoading } from "@/context/LoadingContext"
import { useAlert } from "@/context/AlertContext"

import Input from "@ui/Input"
import { LoginFormSchema } from "@/utils/schemas"
import { LoginFormType } from "@/utils/types"
import { Colors } from "@/constants/Colors"
import { getUser, getPlainPassword } from "@/utils/storage"
import type { User } from "@/context/AuthContext"

export default function LoginScreen() {
    const router = useRouter()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const { signIn, status } = useAuthContext()

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginFormType>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    })

    // 🔹 Login normal con correo y contraseña
    const onSubmit = async (data: LoginFormType) => {
        try {
            await withLoading(async () => {
                await signIn(data)
                await new Promise((r) => setTimeout(r, 700))
                showAlert("Inicio de sesión exitoso. Redirigiendo…", "success")
            })
        } catch (e: any) {
            const msg =
                typeof e?.message === "string"
                    ? e.message
                    : "Error al iniciar sesión. Inténtalo de nuevo."
            showAlert(msg, "error")
        }
    }

    const disabled = isSubmitting || status === "loading"

    const handleBiometricLogin = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync()
            const enrolled = await LocalAuthentication.isEnrolledAsync()

            if (!hasHardware || !enrolled) {
                showAlert("Tu dispositivo no tiene huella configurada.", "error")
                return
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Usar huella para iniciar sesión",
                cancelLabel: "Cancelar",
            })

            if (result.success) {
                const storedUser = await getUser<User>()
                const storedPassword = await getPlainPassword()

                if (storedUser?.email && storedPassword) {
                    await withLoading(async () => {
                        await signIn({
                            email: storedUser.email,
                            password: storedPassword,
                        })
                    })
                    showAlert("Inicio de sesión con huella exitoso ✅", "success")
                } else {
                    showAlert("No se encontraron credenciales guardadas.", "error")
                }
            }
        } catch (error) {
            console.error("Error en autenticación biométrica:", error)
            showAlert("No se pudo usar la autenticación biométrica.", "error")
        }
    }

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
        >
            <Image source={require("@images/image.png")} style={styles.logo} resizeMode="contain" />

            <View style={{ width: "75%" }}>
                <Input<LoginFormType>
                    name="email"
                    control={control}
                    label="Correo"
                    placeholder="correo@dominio.com"
                    type="email"
                />

                <Input<LoginFormType>
                    name="password"
                    control={control}
                    label="Contraseña"
                    placeholder="••••••••"
                    type="password"
                />
            </View>

            <TouchableOpacity
                style={[styles.buttonPrimary, disabled && { opacity: 0.6 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={disabled}
            >
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBiometricLogin} style={styles.biometricButton}>
                <Ionicons name="finger-print" size={40} color="#7C3AED" />
                <Text style={styles.biometricText}>Usar huella</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
                <TouchableOpacity
                    style={[styles.buttonSecondary, { backgroundColor: "#9B6DD7" }]}
                    onPress={() => router.push("/(auth)/register")}
                >
                    <Text style={styles.buttonSecondaryText}>Registrarme como Adoptante</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonSecondary, { backgroundColor: "#4C1D95" }]}
                    onPress={() => router.push("/(auth)/giver_register")}
                >
                    <Text style={styles.buttonSecondaryText}>Registrarme como Organización</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 40,
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 30,
    },
    buttonPrimary: {
        backgroundColor: Colors.yellow,
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 30,
        width: "75%",
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    biometricButton: {
        alignItems: "center",
        marginTop: 10,
    },
    biometricText: {
        fontSize: 14,
        color: "#7C3AED",
        fontWeight: "500",
        marginTop: 4,
    },
    forgotPassword: {
        marginTop: 15,
        color: "#7c3aed",
        textDecorationLine: "underline",
    },
    registerContainer: {
        marginTop: 25,
        alignItems: "center",
        width: "75%",
        gap: 12,
    },
    registerTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
        color: "#333",
    },
    buttonSecondary: {
        borderRadius: 16,
        paddingVertical: 14,
        width: "100%",
        alignItems: "center",
    },
    buttonSecondaryText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
})
