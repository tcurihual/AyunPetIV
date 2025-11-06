import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { z } from "zod"

import { http } from "@/services/http"
import Input from "@ui/Input"
import { useAlert } from "@/context/AlertContext"
import BackButton from "@/components/common/BackButton"
import { Colors } from "@/constants/Colors"

const { width } = Dimensions.get("window")

const schema = z.object({
    email: z.string().email("Correo inválido"),
    code: z.string().min(4, "Código inválido"),
})

export default function VerifyEmailScreen() {
    const router = useRouter()
    const { showAlert } = useAlert()
    const { from, email: emailParam } = useLocalSearchParams<{ from?: string; email?: string }>()
    const [loading, setLoading] = useState(false)

    const { control, handleSubmit } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: emailParam || "", code: "" },
    })

    const handleVerify = async (values: any) => {
        setLoading(true)
        try {
            const res = await http.post("/v1/auth/validate-code", values)
            if (res.data?.type === "success") {
                showAlert("¡Correo verificado correctamente!", "success")
                setTimeout(() => {
                    router.replace("/(auth)/(login)/")
                }, 1500)
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al verificar el código"
            showAlert(msg, "error")
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async (email: string) => {
        try {
            await http.post("/v1/auth/create-verification-code", { email })
            showAlert("Correo reenviado correctamente", "success")
        } catch (err: any) {
            const msg = err.response?.data?.message || "No se pudo reenviar el correo"
            showAlert(msg, "error")
        }
    }

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
            {from === "login" && (
                <View style={styles.backContainer}>
                    <BackButton
                        floating={false}
                        style={{
                            backgroundColor: Colors.light.card,
                            borderRadius: width * 0.06,
                            padding: width * 0.02,
                            elevation: 3,
                        }}
                    />
                </View>
            )}

            <Text style={styles.title}>Verificación de correo</Text>
            <Text style={styles.subtitle}>Ingresa el código que recibiste en tu correo</Text>

            <Input name="email" control={control} label="Correo" placeholder="tuemail@gmail.com" />
            <Input
                name="code"
                control={control}
                label="Código"
                placeholder="1234"
                inputProps={{
                    keyboardType: "numeric",
                    maxLength: 6,
                }}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleSubmit(handleVerify)}
                disabled={loading}
            >
                <Text style={styles.buttonText}>Verificar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleResend(control._formValues.email)}>
                <Text style={styles.resend}>Reenviar código</Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#FFFFFF",
    },
    backContainer: {
        position: "absolute",
        top: 40,
        left: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FAD02E",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#A1A1A1",
        marginBottom: 24,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#FAD02E",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    resend: {
        color: "#6C63FF",
        textAlign: "center",
        marginTop: 20,
        fontWeight: "500",
    },
})
