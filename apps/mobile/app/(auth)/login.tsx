import React from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from "react-native"
import { useRouter } from "expo-router"
import { useAlert } from "@/context/AlertContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormSchema } from "@/utils/schemas"
import Input from "../../components/ui/Input"
import { z } from "zod"
import { useLoading } from "@/context/LoadingContext"
import { useAuthContext } from "@/context/AuthContext"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

const { width } = Dimensions.get("window")

type LoginForm = z.infer<typeof LoginFormSchema>

export default function LoginScreen() {
    const router = useRouter()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const { signIn, status } = useAuthContext()

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    })

    const onSubmit = async (data: LoginForm) => {
        try {
            await withLoading(async () => {
                await signIn({ email: data.email, password: data.password })
                await new Promise((r) => setTimeout(r, 700)) // simula un retardo para ver el loading

                showAlert("Inicio de sesión exitoso. Redirigiendo…", "success")

                router.replace("/(home)")
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
                <Input<LoginForm>
                    name="email"
                    control={control}
                    label="Correo"
                    placeholder="correo@dominio.com"
                    type="email"
                />

                <Input<LoginForm>
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
        // alignItems: "center",
        // justifyContent: "center",
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
        backgroundColor: "#facc15",
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
