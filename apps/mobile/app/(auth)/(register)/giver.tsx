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
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"

import Input from "@ui/Input"

import { GiverRegisterFormType } from "@/utils/types"
import { GiverRegisterFormSchema } from "@/utils/schemas"
import { FileInfo } from "@/services/http"
import { Checkbox } from "@/components/ui/Checkbox"
import { authService } from "@/services/auth"

const steps: { title: string; fields: (keyof GiverRegisterFormType)[] }[] = [
    { title: "Nombre y Foto", fields: ["name", "profileImage"] },
    { title: "RUT", fields: ["rut"] },
    { title: "Contraseña", fields: ["password", "verifyPassword"] },
    { title: "Datos de Contacto", fields: ["email", "phone"] },
    { title: "Subida de Archivos", fields: ["files"] },
]

export default function RegisterScreen() {
    const router = useRouter()
    const { width, height } = useWindowDimensions()
    const styles = useThemeStyles(width, height)
    const [step, setStep] = useState(0)
    const [pendingFiles, setPendingFiles] = useState<FileInfo[]>([])
    const [acceptedTerms, setAcceptedTerms] = useState(false)

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
        setValue,
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
            files: [],
            profileImage: undefined,
        },
    })

    const validateRut = async (rut: string): Promise<boolean> => {
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
        } catch (error: any) {
            console.error("Error validando RUT:", error)
            return true
        }
    }

    const validateEmail = async (email: string): Promise<boolean> => {
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
        } catch (error: any) {
            console.error("Error validando email:", error)
            return true
        }
    }

    const onNext = async () => {
        const ok = await trigger(steps[step].fields as any)
        if (!ok) return

        if (step === 1) {
            const rut = getValues("rut")
            const rutIsValid = await validateRut(rut)
            if (!rutIsValid) return
        }

        if (step === 3) {
            const email = getValues("email")
            const emailIsValid = await validateEmail(email)
            if (!emailIsValid) return
        }

        if (step < steps.length - 1) setStep((s) => s + 1)
    }

    const onBack = () => {
        if (step > 0) setStep((s) => s - 1)
        else router.back()
    }

    const onSubmit = async (data: GiverRegisterFormType) => {
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
                        address: "",
                        description: "",
                        profileImage: data.profileImage,
                        documents: pendingFiles.length > 0 ? pendingFiles : undefined,
                    },
                    "giver"
                )

                const message = result.requiresEmailVerification
                    ? "Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta."
                    : "Registro exitoso. Tu cuenta será validada por un administrador."

                showAlert(message, "success")

                setTimeout(() => router.replace("/(auth)/login"), 2000)
            })
        } catch (e: any) {
            console.error("Error en registro de dador:", e)
            const msg =
                e?.response?.data?.error ||
                e?.message ||
                "No se pudo registrar la cuenta. Por favor intenta de nuevo."
            showAlert(msg, "error")
        }
    }

    const handleSelectProfileImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== "granted") {
                showAlert("Necesitamos permisos de galería para continuar", "error")
                return
            }
            Alert.alert("Seleccionar Foto", "¿Cómo deseas obtener tu foto de perfil?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Tomar Foto", onPress: () => takeProfilePicture() },
                { text: "Elegir de Galería", onPress: () => pickFromGallery() },
            ])
        } catch {
            showAlert("Error al acceder a las fotos", "error")
        }
    }

    const takeProfilePicture = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== "granted") {
                showAlert("Necesitamos permisos de cámara para continuar", "error")
                return
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })
            if (!result.canceled && result.assets) {
                const asset = result.assets[0]
                setValue("profileImage", {
                    uri: asset.uri,
                    name: `perfil_dador_${Date.now()}.jpg`,
                    type: "image/jpeg",
                })
            }
        } catch {
            showAlert("Error al tomar la foto", "error")
        }
    }

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })
            if (!result.canceled && result.assets) {
                const asset = result.assets[0]
                setValue("profileImage", {
                    uri: asset.uri,
                    name: `perfil_dador_${Date.now()}.jpg`,
                    type: "image/jpeg",
                })
            }
        } catch {
            showAlert("Error al seleccionar la foto", "error")
        }
    }

    const removeProfileImage = () => setValue("profileImage", undefined)

    const disabled = isSubmitting || status === "loading"

    const renderFields = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="name"
                            name="name"
                            control={control}
                            label="Nombre completo"
                            placeholder="Juan Pérez"
                        />
                        <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
                            <Text style={styles.phoneLabel}>Foto de Perfil (Opcional)</Text>
                            <Text style={styles.profileHelperText}>
                                Agrega una foto de perfil para personalizar tu cuenta
                            </Text>
                        </View>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <>
            <StatusBar backgroundColor="#FFD24C" barStyle="dark-content" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <Ionicons name="arrow-back" size={28} color="black" />
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}

const useThemeStyles = (width: number, height: number) => {
    const isSmallScreen = width < 350
    const headerHeight = Math.max(height * 0.25, 180)
    const logoSize = Math.min(width * 0.4, 150)
    return StyleSheet.create({
        scrollContainer: { flexGrow: 1, backgroundColor: "#fff" },
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
            justifyContent: "flex-start",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            paddingTop: 20,
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
        logo: { width: logoSize, height: logoSize * 0.85, top: 20, zIndex: 1 },
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
        phoneLabel: { fontSize: 16, fontWeight: "500", color: "#333", marginBottom: 5 },
        profileHelperText: {
            fontSize: 12,
            color: "#666",
            marginBottom: 15,
            textAlign: "center",
            fontStyle: "italic",
        },
    })
}
