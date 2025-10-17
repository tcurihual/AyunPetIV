import React, { useState } from "react"
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    StatusBar,
    useWindowDimensions,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"

import { RegisterFormType } from "@/utils/types"
import { RegisterFormSchema } from "@/utils/schemas"
import Input from "@ui/Input"

const steps: { title: string; fields: (keyof RegisterFormType)[] }[] = [
    { title: "Nombre y RUT", fields: ["name", "rut"] },
    { title: "Contraseña", fields: ["password", "verifyPassword"] },
    { title: "Datos de Contacto", fields: ["email", "phone"] },
]

export default function RegisterScreen() {
    const router = useRouter()
    const { width, height } = useWindowDimensions()
    const styles = useThemeStyles(width, height)
    const [step, setStep] = useState(0)

    const { signUp, status } = useAuthContext()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()

    const {
        control,
        handleSubmit,
        trigger,
        getValues,
        setValue,
        formState: { isSubmitting },
    } = useForm<RegisterFormType>({
        resolver: zodResolver(RegisterFormSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            rut: "",
            password: "",
            verifyPassword: "",
            email: "",
            phone: "",
        },
    })

    const onNext = async () => {
        const ok = await trigger(steps[step].fields as any)
        if (!ok) return
        if (step < steps.length - 1) setStep((s) => s + 1)
    }

    const onBack = () => {
        if (step > 0) setStep((s) => s - 1)
        else router.back()
    }

    const onSubmit = async (data: RegisterFormType) => {
        try {
            await withLoading(async () => {
                const phoneWithPrefix = `+569${data.phone}`

                const result = await signUp(
                    {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        rut: data.rut,
                        phone: phoneWithPrefix,
                        address: "", 
                        description: "",
                    },
                    "user"
                )

                const message = result.requiresEmailVerification
                    ? "Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta."
                    : "Registro exitoso. Tu cuenta será validada por un administrador."

                showAlert(message, "success")

                setTimeout(() => {
                    router.replace("/(auth)/login")
                }, 2000)
            })
        } catch (e: any) {
            console.error("Error en registro:", e)
            const msg =
                e?.response?.data?.error ||
                e?.message ||
                "No se pudo registrar la cuenta. Por favor intenta de nuevo."
            showAlert(msg, "error")
        }
    }

    const disabled = isSubmitting || status === "loading"

    const renderFields = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Input<RegisterFormType>
                            key="name"
                            name="name"
                            control={control}
                            label="Nombre completo"
                            placeholder="Juan Pérez"
                        />
                        <Input<RegisterFormType>
                            key="rut"
                            name="rut"
                            control={control}
                            label="RUT"
                            placeholder="12.345.678-9"
                        />
                    </>
                )
            case 1:
                return (
                    <>
                        <Input<RegisterFormType>
                            key="password"
                            name="password"
                            control={control}
                            label="Contraseña"
                            placeholder="••••••••"
                            type="password"
                        />
                        <Input<RegisterFormType>
                            key="verifyPassword"
                            name="verifyPassword"
                            control={control}
                            label="Repetir contraseña"
                            placeholder="••••••••"
                            type="password"
                        />
                    </>
                )
            case 2:
            default:
                return (
                    <>
                        <Input<RegisterFormType>
                            key="email"
                            name="email"
                            control={control}
                            label="Correo electrónico"
                            placeholder="correo@dominio.com"
                            type="email"
                        />
                        <View style={styles.phoneInputContainer}>
                            <Text style={styles.phoneLabel}>Teléfono</Text>
                            <Text style={styles.phoneHelperText}>
                                Ingrese solo los 8 dígitos después del +56 9
                            </Text>
                            <Input<RegisterFormType>
                                key="phone"
                                name="phone"
                                control={control}
                                label=""
                                placeholder="Ej: 12345678"
                                inputProps={{
                                    keyboardType: "phone-pad",
                                    maxLength: 8,
                                }}
                            />
                        </View>
                    </>
                )
        }
    }

    return (
        <>
            <StatusBar backgroundColor="#FFD24C" barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Ionicons name="arrow-back" size={28} color="black" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Datos de Registro</Text>
                        <Image
                            source={require("@images/ayun-pet.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={styles.semiCircle} />
                    </View>

                    <View style={styles.stepIndicator}>
                        <View style={styles.stepCircleContainer}>
                            <Text style={styles.stepCircle}>{`${step + 1}/3`}</Text>
                        </View>
                        <Text style={styles.stepTitle}>{steps[step].title}</Text>
                    </View>

                    <View style={styles.formContent}>
                        {renderFields()}

                        {step < steps.length - 1 ? (
                            <TouchableOpacity
                                style={[styles.button]}
                                onPress={onNext}
                                disabled={disabled}
                            >
                                <Text style={styles.buttonText}>Continuar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={disabled}
                            >
                                <Text style={styles.buttonText}>
                                    {disabled ? "Creando..." : "Crear Cuenta"}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
                            <Text style={styles.secondaryButtonText}>Volver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

const useThemeStyles = (width: number, height: number) => {
    const isSmallScreen = width < 350
    const headerHeight = Math.max(height * 0.25, 180)
    const logoSize = Math.min(width * 0.4, 150)
    const circleSize = Math.min(width * 0.15, 60)

    return StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
            backgroundColor: "#fff",
        },
        container: {
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            paddingHorizontal: width * 0.05,
            minHeight: height,
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
            width: "112%",
            height: headerHeight,
            alignItems: "center",
            justifyContent: "center",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            marginBottom: 0,
            position: "relative",
        },
        headerTitle: {
            fontSize: isSmallScreen ? 18 : 22,
            fontWeight: "bold",
            color: "#222",
            marginTop: height * 0.06,
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
        stepIndicator: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 40,
            marginBottom: 30,
            width: "100%",
            paddingHorizontal: 10,
        },
        stepCircleContainer: {
            width: isSmallScreen ? 40 : 50,
            height: isSmallScreen ? 40 : 50,
            borderRadius: isSmallScreen ? 20 : 25,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#A47CF3",
            marginRight: isSmallScreen ? 10 : 15,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            elevation: 5,
        },
        stepCircle: {
            fontSize: isSmallScreen ? 14 : 16,
            color: "#A47CF3",
            fontWeight: "bold",
            textAlign: "center",
        },
        stepTitle: {
            fontSize: isSmallScreen ? 18 : 22,
            fontWeight: "bold",
            color: "#222",
        },
        formContent: {
            width: "100%",
            maxWidth: 350,
            paddingHorizontal: 20,
        },
        phoneInputContainer: {
            width: "100%",
            marginBottom: 15,
        },
        phoneLabel: {
            fontSize: 16,
            fontWeight: "500",
            color: "#333",
            marginBottom: 5,
        },
        phoneHelperText: {
            fontSize: 12,
            color: "#666",
            marginBottom: 8,
            fontStyle: "italic",
        },
        input: {
            width: "100%",
            height: Math.max(height * 0.06, 45),
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingHorizontal: 15,
            marginBottom: 15,
            fontSize: 16,
            borderWidth: 1,
            borderColor: "#A47CF3",
            color: "#222",
        },
        button: {
            width: "100%",
            height: Math.max(height * 0.06, 50),
            backgroundColor: "#FFD24C",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            elevation: 3,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        },
        buttonText: {
            color: "#222",
            fontWeight: "600",
            fontSize: 16,
        },
        secondaryButton: {
            width: "100%",
            height: Math.max(height * 0.06, 50),
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 15,
            marginBottom: 30,
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
