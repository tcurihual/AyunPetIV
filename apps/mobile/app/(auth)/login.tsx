import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useForm, Controller } from "react-hook-form"

type LoginForm = {
    email: string
    password: string
}

export default function LoginScreen() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    })

    const onSubmit = async (data: LoginForm) => {
        try {
            setSubmitting(true)
            await AsyncStorage.setItem(
                "user",
                JSON.stringify({ email: data.email, loggedAt: Date.now() })
            )

            router.replace("/(home)")
        } catch (e) {
            Alert.alert("Error", "No se pudo iniciar sesión")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <View style={styles.container}>
            <Image source={require("@images/image.png")} style={styles.logo} resizeMode="contain" />

            <Controller
                control={control}
                name="email"
                rules={{
                    required: "El correo es obligatorio",
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Formato de correo inválido",
                    },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder="Correo electrónico"
                        placeholderTextColor="#7c3aed"
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                    />
                )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            <Controller
                control={control}
                name="password"
                rules={{
                    required: "La contraseña es obligatoria",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder="Contraseña"
                        placeholderTextColor="#7c3aed"
                        secureTextEntry
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        autoComplete="password"
                        textContentType="password"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            <TouchableOpacity
                style={[styles.buttonPrimary, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={submitting}
            >
                <Text style={styles.buttonText}>
                    {submitting ? "Ingresando..." : "Iniciar Sesión"}
                </Text>
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    logo: { width: 450, height: 450, marginTop: "-30%" },
    input: {
        width: "100%",
        height: 45,
        borderWidth: 1,
        borderColor: "#7c3aed",
        borderRadius: 20,
        paddingHorizontal: 15,
        marginBottom: 8,
    },
    buttonPrimary: {
        backgroundColor: "#facc15",
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    buttonSecondary: { marginTop: 25 },
    buttonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
    forgotPassword: { marginTop: 15, color: "#7c3aed", textDecorationLine: "underline" },
    errorText: { color: "#dc2626", marginBottom: 6 },
})
