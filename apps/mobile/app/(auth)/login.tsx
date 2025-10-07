import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { useRouter } from "expo-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

import { useAuthContext } from "@/context/AuthContext"
import { useLoading } from "@/context/LoadingContext"
import { useAlert } from "@/context/AlertContext"

import Input from "@ui/Input"
import { LoginFormSchema } from "@/utils/schemas"
import { LoginFormType } from "@/utils/types"
import { Colors } from "@/constants/Colors"

export default function LoginScreen() {
    const router = useRouter()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const { signIn, status, user } = useAuthContext()
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginFormType>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    })

    const onSubmit = async (data: LoginFormType) => {
        try {
            await withLoading(async () => {
                await signIn({ email: data.email, password: data.password })
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

            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.buttonPrimary, styles.buttonSecondary]}
                onPress={() => router.push("/(auth)/register")}
            >
                <Text style={styles.buttonText}>Registrarse</Text>
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
        backgroundColor: `${Colors.yellow}`,
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
})
