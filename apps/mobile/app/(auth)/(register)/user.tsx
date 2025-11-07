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
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as ImagePicker from "expo-image-picker"

import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"
import { RegisterFormType } from "@/utils/types"
import { RegisterFormSchema } from "@/utils/schemas"
import Input from "@ui/Input"
import { Checkbox } from "@/components/ui/Checkbox"
import { authService } from "@/services/auth"

const steps: { title: string; fields: (keyof RegisterFormType)[] }[] = [
    { title: "Nombre y RUT", fields: ["name", "rut"] },
    { title: "Contraseña", fields: ["password", "verifyPassword"] },
    { title: "Datos de Contacto", fields: ["email", "phone"] },
    { title: "Foto de Perfil (Opcional)", fields: ["profileImage"] },
]

export default function RegisterScreen() {
    const router = useRouter()
    const { width, height } = useWindowDimensions()
    const styles = useThemeStyles(width, height)
    const [step, setStep] = useState(0)
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
        } catch {
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
        } catch {
            return true
        }
    }

    const onNext = async () => {
        const ok = await trigger(steps[step].fields as any)
        if (!ok) return
        if (step === 0) {
            const rutIsValid = await validateRut(getValues("rut"))
            if (!rutIsValid) return
        }
        if (step === 2) {
            const emailIsValid = await validateEmail(getValues("email"))
            if (!emailIsValid) return
        }
        if (step < steps.length - 1) setStep((s) => s + 1)
    }

    const onBack = () => {
        if (step > 0) setStep((s) => s - 1)
        else router.back()
    }

    const onSubmit = async (data: RegisterFormType) => {
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
                    },
                    "user"
                )
                const message = result.requiresEmailVerification
                    ? "Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta."
                    : "Registro exitoso. Tu cuenta será validada por un administrador."
                showAlert(message, "success")
                setTimeout(() => {
                    router.replace({
                        pathname: "/(auth)/verify-email",
                        params: { email: data.email },
                    })
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
                    name: `perfil_${Date.now()}.jpg`,
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
                    name: `perfil_${Date.now()}.jpg`,
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
                            inputProps={{
                                onChangeText: (text: string) => {
                                    const currentRut = getValues("rut")
                                    if (text !== currentRut && text !== previousRut.current) {
                                        clearErrors("rut")
                                        previousRut.current = ""
                                    }
                                },
                            }}
                        />
                    </>
                )
            default:
                return null
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
                </View>
            </ScrollView>
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
    })
}
