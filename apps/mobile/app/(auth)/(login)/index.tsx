import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { useRouter } from "expo-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

import { useAuthContext } from "@/context/AuthContext"
import { useLoading } from "@/context/LoadingContext"
import { useAlert } from "@/context/AlertContext"
import { useModal } from "@/context/ModalContext"

import { Colors } from "@/constants/Colors"
import Input from "@ui/Input"
import { ChooseRegisterModalContent } from "@common/modals/registerSelectionModal"
import { LoginFormSchema } from "@/utils/schemas"
import { LoginFormType } from "@/utils/types"

export default function LoginScreen() {
    const router = useRouter()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const { signIn, status, user } = useAuthContext()
    const { openModal } = useModal()

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginFormType>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    })

    // 🔹 Redirección controlada por estado global
    useEffect(() => {
        if (status === "authenticated" && user) {
            router.replace("/check-role")
        } else if (status === "unauthenticated" && user) {
            router.replace("/remembered")
        }
    }, [status, user])

    const onSubmit = async (data: LoginFormType) => {
        try {
            await withLoading(async () => {
                await signIn(data)
                showAlert("Inicio de sesión exitoso.", "success")
            })
        } catch (e: any) {
            const errorText =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                e?.toString() ||
                ""

            console.log("🧩 Error al iniciar sesión:", errorText)

            const lower = errorText.toString().toLowerCase()

            if (
                lower.includes("no ha validado") ||
                lower.includes("no validado") ||
                lower.includes("verifica tu correo") ||
                lower.includes("revisa tu email") ||
                lower.includes("correo") 
            ) {
                showAlert(
                    "Tu cuenta aún no ha sido validada. Serás redirigido a la vista de verificación.",
                    "error"
                )

                setTimeout(() => {
                    try {
                        router.navigate({
                            pathname: "/(auth)/verify-email",
                            params: { email: data.email },
                        })
                    } catch (err) {
                        console.log("⚠️ Error redirigiendo a verify-email:", err)
                    }
                }, 1500)

                return
            }
            const msg =
                typeof e?.response?.data?.message === "string"
                    ? e.response.data.message
                    : typeof e?.message === "string"
                    ? e.message
                    : "Error al iniciar sesión. Inténtalo de nuevo."

            showAlert(msg, "error")
        }
    }

    const disabled = isSubmitting || status === "loading"

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
            enableOnAndroid
            enableAutomaticScroll
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

            <TouchableOpacity onPress={() => router.push("/(auth)/(password)/forgot")}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* 🔹 Acceso manual a validación de correo */}
            <TouchableOpacity onPress={() => router.push("/(auth)/verify-email?from=login")}>
                <Text style={styles.forgotPassword}>¿Aún no validas tu cuenta?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.buttonPrimary, styles.buttonSecondary]}
                onPress={() => openModal(<ChooseRegisterModalContent />)}
            >
                <Text style={styles.buttonText}>¿No tienes cuenta?</Text>
            </TouchableOpacity>
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
        paddingBottom: 20,
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
    buttonSecondary: {
        marginTop: 20,
    },
    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    forgotPassword: {
        marginTop: 15,
        color: "#7c3aed",
        textDecorationLine: "underline",
    },
    verifyEmailText: {
        color: "#7c3aed",
        textDecorationLine: "underline",
        textAlign: "center",
        marginTop: 10,
    },
})
