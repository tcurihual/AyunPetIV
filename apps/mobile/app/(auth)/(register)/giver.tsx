import React, { useState, useRef } from "react"
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    StatusBar,
    useWindowDimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as ImagePicker from "expo-image-picker"

import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"

import Input from "@ui/Input"
import { GiverRegisterFormType } from "@/utils/types"
import { GiverRegisterFormSchema } from "@/utils/schemas"
import { FileInfo } from "@/services/http"
import { authService } from "@/services/auth"

const steps = [
    { title: "Nombre y Foto", fields: ["name", "profileImage"] },
    { title: "RUT", fields: ["rut"] },
    { title: "Contraseña", fields: ["password", "verifyPassword"] },
    { title: "Datos de Contacto", fields: ["email", "phone"] },
    { title: "Información adicional", fields: ["address", "description", "files"] },
]

export default function RegisterScreen() {
    const router = useRouter()
    const { width, height } = useWindowDimensions()
    const { theme } = useTheme()
    const colors = Colors[theme]
    const styles = useThemeStyles(width, height, colors)

    const [step, setStep] = useState(0)
    const [pendingFiles, setPendingFiles] = useState<FileInfo[]>([])
    const [showTypeModal, setShowTypeModal] = useState(true)
    const [giverType, setGiverType] = useState<"giver" | "shelter" | null>(null)

    const { signUp, status } = useAuthContext()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()
    const previousRut = useRef<string>("")
    const previousEmail = useRef<string>("")

    const {
        control,
        handleSubmit,
        trigger,
        getValues,
        setError,
        clearErrors,
        formState: { isSubmitting },
    } = useForm<GiverRegisterFormType>({
        resolver: zodResolver(GiverRegisterFormSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            rut: "",
            password: "",
            verifyPassword: "",
            email: "",
            phone: "",
            address: "",
            description: "",
            files: [],
            profileImage: undefined,
        },
    })

    const validateRut = async (rut: string) => {
        if (rut === previousRut.current) return true
        try {
            const isAvailable = await authService.checkUserExists({ rut })
            if (!isAvailable) {
                setError("rut", { type: "manual", message: "Este RUT ya está registrado" })
                return false
            }
            clearErrors("rut")
            previousRut.current = rut
            return true
        } catch {
            return true
        }
    }

    const validateEmail = async (email: string) => {
        if (email === previousEmail.current) return true
        try {
            const isAvailable = await authService.checkUserExists({ email })
            if (!isAvailable) {
                setError("email", { type: "manual", message: "Este correo ya está registrado" })
                return false
            }
            clearErrors("email")
            previousEmail.current = email
            return true
        } catch {
            return true
        }
    }

    const onNext = async () => {
        const ok = await trigger(steps[step].fields as any)
        if (!ok) return
        if (step === 1) {
            const rutIsValid = await validateRut(getValues("rut"))
            if (!rutIsValid) return
        }
        if (step === 3) {
            const emailIsValid = await validateEmail(getValues("email"))
            if (!emailIsValid) return
        }
        if (step < steps.length - 1) setStep((s) => s + 1)
    }

    const onBack = () => {
        if (step > 0) setStep((s) => s - 1)
        else router.back()
    }

    const onSubmit = async (data: GiverRegisterFormType) => {
        if (!giverType) return
        try {
            const rutIsValid = await validateRut(data.rut)
            const emailIsValid = await validateEmail(data.email)
            if (!rutIsValid || !emailIsValid) return

            await withLoading(async () => {
                const phoneWithPrefix = `+569${data.phone}`
                const result = await signUp(
                    {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        rut: data.rut,
                        phone: phoneWithPrefix,
                        address: data.address || "",
                        description: data.description || "",
                        profileImage: data.profileImage,
                        documents: pendingFiles.length > 0 ? pendingFiles : undefined,
                    },
                    giverType
                )

                const message = result.requiresEmailVerification
                    ? "Registro exitoso. Verifica tu correo electrónico."
                    : "Registro exitoso. Tu cuenta será validada por un administrador."

                showAlert(message, "success")
                setTimeout(() => router.replace("/(auth)/login"), 2000)
            })
        } catch (e: any) {
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
                    <Input<GiverRegisterFormType>
                        key="name"
                        name="name"
                        control={control}
                        label={giverType === "shelter" ? "Nombre de fundación" : "Nombre completo"}
                        placeholder={
                            giverType === "shelter"
                                ? "Ej: Fundación Patitas Felices"
                                : "Ej: Juan Pérez"
                        }
                    />
                )
            case 1:
                return (
                    <Input<GiverRegisterFormType>
                        key="rut"
                        name="rut"
                        control={control}
                        label="RUT"
                        placeholder="12.345.678-9"
                    />
                )
            case 2:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="password"
                            name="password"
                            control={control}
                            label="Contraseña"
                            placeholder="••••••••"
                            type="password"
                        />
                        <Input<GiverRegisterFormType>
                            key="verifyPassword"
                            name="verifyPassword"
                            control={control}
                            label="Repetir contraseña"
                            placeholder="••••••••"
                            type="password"
                        />
                    </>
                )
            case 3:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="email"
                            name="email"
                            control={control}
                            label="Correo electrónico"
                            placeholder="correo@dominio.com"
                            type="email"
                        />
                        <Input<GiverRegisterFormType>
                            key="phone"
                            name="phone"
                            control={control}
                            label="Teléfono"
                            placeholder="12345678"
                        />
                    </>
                )
            case 4:
                return (
                    <>
                        {giverType === "shelter" && (
                            <Input<GiverRegisterFormType>
                                key="address"
                                name="address"
                                control={control}
                                label="Dirección"
                                placeholder="Calle Ejemplo 123, Ciudad"
                            />
                        )}
                        <Input<GiverRegisterFormType>
                            key="description"
                            name="description"
                            control={control}
                            label="Descripción"
                            placeholder={
                                giverType === "giver"
                                    ? "Cuéntanos un poco sobre ti..."
                                    : "Describe la misión o propósito de tu fundación"
                            }
                        />
                    </>
                )
            default:
                return null
        }
    }

    return (
        <>
            <StatusBar backgroundColor={colors.tint} barStyle="dark-content" />
            <Modal visible={showTypeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>¿Qué tipo de dador eres?</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setGiverType("giver")
                                setShowTypeModal(false)
                            }}
                        >
                            <Text style={styles.modalButtonText}>Dador Individual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setGiverType("shelter")
                                setShowTypeModal(false)
                            }}
                        >
                            <Text style={styles.modalButtonText}>Fundación</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {!showTypeModal && (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                                <Ionicons name="arrow-back" size={28} color={colors.text} />
                            </TouchableOpacity>

                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Registro</Text>
                                <Image
                                    source={require("@images/ayun-pet.png")}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                                <View style={styles.semiCircle} />
                            </View>

                            <View style={styles.stepIndicator}>
                                <View style={styles.stepCircleContainer}>
                                    <Text style={styles.stepCircle}>{`${step + 1}/5`}</Text>
                                </View>
                                <Text style={styles.stepTitle}>{steps[step].title}</Text>
                            </View>

                            <View style={styles.formContent}>
                                {renderFields()}

                                {step < steps.length - 1 ? (
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={onNext}
                                        disabled={disabled}
                                    >
                                        <Text style={styles.buttonText}>Continuar</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.button}
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
                </KeyboardAvoidingView>
            )}
        </>
    )
}

const useThemeStyles = (width: number, height: number, colors: any) =>
    StyleSheet.create({
        scrollContainer: { flexGrow: 1, backgroundColor: colors.background },
        container: {
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            paddingHorizontal: width * 0.05,
            minHeight: height,
        },
        backButton: {
            position: "absolute",
            top: height * 0.05,
            left: width * 0.05,
            zIndex: 10,
            borderRadius: 20,
            padding: 8,
        },
        header: {
            backgroundColor: colors.tint,
            width: "112%",
            height: Math.max(height * 0.25, 180),
            alignItems: "center",
            justifyContent: "center",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
        },
        headerTitle: {
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            marginTop: height * 0.06,
        },
        logo: {
            width: Math.min(width * 0.4, 150),
            height: Math.min(width * 0.4, 150) * 0.85,
            top: 20,
        },
        semiCircle: {
            position: "absolute",
            bottom: -40,
            width: 120,
            height: 80,
            backgroundColor: colors.background,
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            alignSelf: "center",
        },
        stepIndicator: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 40,
            marginBottom: 30,
            width: "100%",
        },
        stepCircleContainer: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.card,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: Colors.purple,
            marginRight: 15,
            elevation: 5,
        },
        stepCircle: {
            fontSize: 16,
            color: Colors.purple,
            fontWeight: "bold",
        },
        stepTitle: { fontSize: 22, fontWeight: "bold", color: colors.text },
        formContent: { width: "100%", maxWidth: 350, paddingHorizontal: 20 },
        button: {
            width: "100%",
            height: 50,
            backgroundColor: colors.tint,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            elevation: 3,
        },
        buttonText: { color: colors.text, fontWeight: "600", fontSize: 16 },
        secondaryButton: {
            width: "100%",
            height: 50,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 15,
            marginBottom: 30,
            borderWidth: 2,
            borderColor: colors.tint,
            backgroundColor: colors.card,
        },
        secondaryButtonText: {
            color: colors.tint,
            fontWeight: "600",
            fontSize: 16,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
        },
        modalContainer: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 25,
            width: "80%",
            alignItems: "center",
            elevation: 10,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 20,
            textAlign: "center",
        },
        modalButton: {
            backgroundColor: colors.tint,
            borderRadius: 12,
            paddingVertical: 12,
            width: "100%",
            marginVertical: 8,
            alignItems: "center",
        },
        modalButtonText: {
            color: colors.text,
            fontWeight: "600",
            fontSize: 16,
        },
    })
