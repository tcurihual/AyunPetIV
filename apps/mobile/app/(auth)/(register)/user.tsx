import React, { useRef, useState } from "react"
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
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as ImagePicker from "expo-image-picker"

import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"

import { RegisterFormType } from "@/utils/types"
import { RegisterFormSchema } from "@/utils/schemas"
import Input from "@ui/Input"
import { authService } from "@/services/auth"
import { FileInfo } from "@/services/http"
import { Checkbox } from "@/components/ui/Checkbox"
import {Colors} from "@/constants/Colors"

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
        watch,
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

    const profileImage = watch("profileImage")

    const onNext = async () => {
        const ok = await trigger(steps[step].fields as any)
        if (!ok) return

        // Validar RUT en el paso 1 (después de validaciones de react-hook-form)
        if (step === 0) {
            const rut = getValues("rut")
            const rutIsValid = await validateRut(rut)
            if (!rutIsValid) return
        }

        // Validar email en el paso 3 (después de validaciones de react-hook-form)
        if (step === 2) {
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

    const onSubmit = async (data: RegisterFormType) => {
        try {
            const rutIsValid = await validateRut(data.rut)
            const emailIsValid = await validateEmail(data.email)

            if (!rutIsValid || !emailIsValid) {
                // No continuar si alguno ya está registrado
                return
            }

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
            // TODO: Console.error, no es relevante en despliegue, corroborar correcto funcionamiento y eliminar
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
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Tomar Foto",
                    onPress: () => takeProfilePicture(),
                },
                {
                    text: "Elegir de Galería",
                    onPress: () => pickFromGallery(),
                },
            ])
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            showAlert("Error al seleccionar la foto", "error")
        }
    }

    const removeProfileImage = () => {
        setValue("profileImage", undefined)
    }

    const disabled = isSubmitting || status === "loading"

    const handleCameraCapture = async (field: any) => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== "granted") {
                showAlert("Necesitamos permisos de cámara para continuar", "error")
                return
            }

            Alert.alert("Opciones de Foto", "¿Cómo prefieres tomar la foto?", [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Foto Rápida",
                    onPress: () => takePictureWithOptions(field, false),
                },
                {
                    text: "Con Recorte",
                    onPress: () => takePictureWithOptions(field, true),
                },
            ])
        } catch (error) {
            showAlert("Error al acceder a la cámara", "error")
        }
    }

    const takePictureWithOptions = async (field: any, allowEditing: boolean) => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: allowEditing,
                aspect: allowEditing ? [4, 3] : undefined,
                quality: 0.8,
                base64: false,
                exif: false,
            })

            if (!result.canceled && result.assets) {
                const asset = result.assets[0]
                const fileInfo: FileInfo = {
                    uri: asset.uri,
                    name: `foto_${Date.now()}.jpg`,
                    type: asset.type === "image" ? "image/jpeg" : "image/jpeg",
                }

                setPendingFiles((prev) => [...prev, fileInfo])

                const currentFiles = Array.isArray(field.value) ? field.value : []
                field.onChange([...currentFiles, fileInfo.name])
            }
        } catch (error) {
            showAlert("Error al tomar la foto", "error")
        }
    }

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
                                    // Limpiar el error cuando el usuario cambia el valor
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
                return (
                    <>
                        <Input<RegisterFormType>
                            key="email"
                            name="email"
                            control={control}
                            label="Correo electrónico"
                            placeholder="correo@dominio.com"
                            type="email"
                            inputProps={{
                                onChangeText: (text: string) => {
                                    // Limpiar el error cuando el usuario cambia el valor
                                    const currentEmail = getValues("email")
                                    if (text !== currentEmail && text !== previousEmail.current) {
                                        clearErrors("email")
                                        previousEmail.current = ""
                                    }
                                },
                            }}
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
            case 3:
            default:
                return (
                    <View style={{ width: "100%", alignItems: "center" }}>
                        <Text style={styles.phoneLabel}>Foto de Perfil (Opcional)</Text>
                        <Text style={styles.profileHelperText}>
                            Agrega una foto de perfil para personalizar tu cuenta
                        </Text>

                        {profileImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: profileImage.uri }}
                                    style={styles.profileImagePreview}
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={removeProfileImage}
                                >
                                    <Ionicons name="close-circle" size={32} color={Colors.danger}/>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={handleSelectProfileImage}
                            >
                                <Ionicons name="camera-outline" size={48} color={Colors.secondary} />
                                <Text style={styles.uploadButtonText}>Seleccionar Foto</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.skipText}>Puedes omitir este paso si lo deseas</Text>
                    </View>
                )
        }
    }

    return (
        <>
            <StatusBar backgroundColor="Colors.primary" barStyle="dark-content" />
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
                            <Text style={styles.stepCircle}>{`${step + 1}/4`}</Text>
                        </View>
                        <Text style={styles.stepTitle}>{steps[step].title}</Text>
                    </View>{" "}
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
                            <View style={{ width: "100%", marginTop: 15 }}>
                                <View style={{ marginBottom: 10 }}>
                                    <Checkbox
                                        label="He leído y acepto los Términos y Condiciones"
                                        checked={acceptedTerms}
                                        onPress={() => setAcceptedTerms(!acceptedTerms)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => router.push("/(legal)/terms-and-conditions")}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.secondary,
                                                fontSize: 14,
                                                textDecorationLine: "underline",
                                                marginTop: 4,
                                            }}
                                        >
                                            Ver Términos y Condiciones
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        (!acceptedTerms || disabled) && {
                                            backgroundColor: Colors.primary,
                                        },
                                    ]}
                                    onPress={() => {
                                        if (!acceptedTerms) return
                                        handleSubmit(onSubmit)()
                                    }}
                                    disabled={disabled}
                                >
                                    <Text style={styles.buttonText}>
                                        {disabled ? "Creando..." : "Crear Cuenta"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
                                    <Text style={styles.secondaryButtonText}>Volver</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
            backgroundColor: Colors.primary,
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
            borderColor: Colors.secondary,
            marginRight: isSmallScreen ? 10 : 15,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            elevation: 5,
        },
        stepCircle: {
            fontSize: isSmallScreen ? 14 : 16,
            color: Colors.secondary,
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
            borderColor: Colors.secondary,
            color: "#222",
        },
        button: {
            width: "100%",
            height: Math.max(height * 0.06, 50),
            backgroundColor: Colors.primary,
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
            borderColor: Colors.primary,
            backgroundColor: "#fff",
        },
        secondaryButtonText: {
            color: Colors.primary,
            fontWeight: "600",
            fontSize: 16,
        },
        profileHelperText: {
            fontSize: 12,
            color: "#666",
            marginBottom: 20,
            textAlign: "center",
            fontStyle: "italic",
        },
        uploadButton: {
            width: Math.min(width * 0.5, 200),
            height: Math.min(width * 0.5, 200),
            borderRadius: Math.min(width * 0.25, 100),
            backgroundColor: Colors.light.background,
            borderWidth: 2,
            borderColor: Colors.secondary,
            borderStyle: "dashed",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 20,
        },
        uploadButtonText: {
            marginTop: 10,
            fontSize: 14,
            color: Colors.secondary,
            fontWeight: "600",
        },
        imagePreviewContainer: {
            position: "relative",
            marginVertical: 20,
        },
        profileImagePreview: {
            width: Math.min(width * 0.5, 200),
            height: Math.min(width * 0.5, 200),
            borderRadius: Math.min(width * 0.25, 100),
            borderWidth: 3,
            borderColor: Colors.secondary,
        },
        removeImageButton: {
            position: "absolute",
            top: -5,
            right: -5,
            backgroundColor: "#fff",
            borderRadius: 16,
        },
        skipText: {
            fontSize: 12,
            color: "#999",
            marginTop: 10,
            textAlign: "center",
            fontStyle: "italic",
        },
    })
}
