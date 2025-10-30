import React, { useEffect } from "react"
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
import { useBiometricLogin } from "@/hooks/useBiometricsLogin"

export default function rememberedLogin() {
    const router = useRouter()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const { signIn, status, user } = useAuthContext()
    const { tryBiometricLogin } = useBiometricLogin()

    useEffect(() => {
        tryBiometricLogin()
    }, [])

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginFormType>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: { email: user?.email || "", password: "" },
        mode: "onTouched",
    })

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

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
        >
            <Image source={require("@images/image.png")} style={styles.logo} resizeMode="contain" />
            <View style={{ width: "75%", alignItems: "center", marginVertical: 20, gap: 10 }}>
                <Text style={styles.title}>👋 ¡Bienvenido de vuelta!</Text>
                <Text style={styles.nameTitle}>{user ? user.name : "pedrito"}</Text>
            </View>

            <View style={{ width: "75%" }}>
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
            <TouchableOpacity onPress={() => router.push("/(auth)/(login)/")}>
                <Text style={styles.forgotPassword}>Ingresar con otra cuenta</Text>
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
        width: 200,
        height: 200,
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
    title: {
        fontSize: 20,
    },
    nameTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
})
