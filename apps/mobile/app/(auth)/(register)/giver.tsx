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
    KeyboardAvoidingView,
    Platform,
    Modal,
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
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"

import Input from "@ui/Input"

import { GiverRegisterFormType } from "@/utils/types"
import { GiverRegisterFormSchema } from "@/utils/schemas"
import { FileInfo } from "@/services/http"
import { Checkbox } from "@/components/ui/Checkbox"
import { authService } from "@/services/auth"

const steps: { title: string; fields: (keyof GiverRegisterFormType)[] }[] = [
    { title: "Nombre", fields: ["name"] },
    { title: "Correo Electrónico", fields: ["email"] },
    { title: "RUT", fields: ["rut"] },
    { title: "Contraseña", fields: ["password", "verifyPassword"] },
    { title: "Foto de Perfil (Opcional)", fields: ["profileImage"] },
    { title: "Subida de Archivos", fields: ["files"] },
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
        watch,
        formState: { isSubmitting },
    } = useForm<GiverRegisterFormType>({
        resolver: zodResolver(GiverRegisterFormSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            email: "",
            rut: "",
            password: "",
            verifyPassword: "",
            files: [],
            profileImage: undefined,
        },
    })

    const profileImage = watch("profileImage")

    const onNext = async () => {
        const ok = await trigger(steps[step].fields as any)
        if (!ok) return

        // Validar email en el paso 1 (después de validaciones de react-hook-form)
        if (step === 1) {
            const email = getValues("email")
            const emailIsValid = await validateEmail(email)
            if (!emailIsValid) return
        }

        // Validar RUT en el paso 2 (después de validaciones de react-hook-form)
        if (step === 2) {
            const rut = getValues("rut")
            const rutIsValid = await validateRut(rut)
            if (!rutIsValid) return
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

    const onSubmit = async (data: GiverRegisterFormType) => {
        try {
            const rutIsValid = await validateRut(data.rut)
            const emailIsValid = await validateEmail(data.email)

            if (!rutIsValid || !emailIsValid) {
                // No continuar si alguno ya está registrado
                return
            }

            await withLoading(async () => {
                const result = await signUp(
                    {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        rut: data.rut,
                        address: "",
                        description: "",
                        profileImage: data.profileImage,
                        documents: pendingFiles.length > 0 ? pendingFiles : undefined,
                    },
                    "giver"
                )

                showAlert("Registro exitoso.", "success")

                // Redirigir a la pantalla de confirmación
                setTimeout(() => {
                    router.replace({
                        pathname: "/(auth)/registration-success" as any,
                        params: {
                            type: giverType || "giver",
                            email: data.email,
                        },
                    })
                }, 1500)
            })
        } catch (e: any) {
            // TODO: Console.error, no es relevante en despliegue, corroborar correcto funcionamiento y eliminar
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
                    name: `perfil_dador_${Date.now()}.jpg`,
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
                    name: `perfil_dador_${Date.now()}.jpg`,
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
                        <Input<GiverRegisterFormType>
                            key="name"
                            name="name"
                            control={control}
                            label={
                                giverType === "shelter" ? "Nombre de fundación" : "Nombre completo"
                            }
                            placeholder="Juan Pérez"
                            helperText={
                                giverType === "shelter"
                                    ? "Nombre legal o comercial de tu fundación"
                                    : "Ingresa tu nombre y apellido"
                            }
                        />
                    </>
                )
            case 1:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="email"
                            name="email"
                            control={control}
                            label="Correo electrónico"
                            placeholder="correo@ejemplo.com"
                            helperText="Usaremos este correo para enviarte información importante"
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
                    </>
                )
            case 2:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="rut"
                            name="rut"
                            control={control}
                            label="RUT"
                            placeholder="12.345.678-9"
                            helperText="Ingresa tu RUT con puntos y guión (ej: 12.345.678-9)"
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
            case 3:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="password"
                            name="password"
                            control={control}
                            label="Contraseña"
                            placeholder="Ingresa tu contraseña"
                            helperText="Mínimo 8 caracteres. Debe incluir mayúsculas, minúsculas y números"
                            type="password"
                        />
                        <Input<GiverRegisterFormType>
                            key="verifyPassword"
                            name="verifyPassword"
                            control={control}
                            label="Repetir contraseña"
                            placeholder="Repite tu contraseña"
                            helperText="Ingresa la misma contraseña para confirmar"
                            type="password"
                        />
                    </>
                )
            case 4:
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
                                    <Ionicons name="close-circle" size={32} color={Colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={handleSelectProfileImage}
                            >
                                <Ionicons name="camera-outline" size={40} color={Colors.secondary}  />
                                <Text style={styles.uploadButtonText}>Seleccionar Foto</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )
            case 5:
                return (
                    <Controller
                        control={control}
                        name="files"
                        render={({ field, fieldState }) => (
                            <View style={{ width: "100%" }}>
                                <Text style={styles.phoneLabel}>Documentos de verificación</Text>
                                <Text style={styles.documentsHelperText}>
                                    Sube documentos de Registro Social de Hogares y Certificado de
                                    Antecedentes para análisis.
                                </Text>

                                <View style={{ marginBottom: 15 }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            marginBottom: 10,
                                            gap: 10,
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={[styles.optionButton, { flex: 1 }]}
                                            onPress={() => handleCameraCapture(field)}
                                        >
                                            <Ionicons
                                                name="camera-outline"
                                                size={20}
                                                color="#666"
                                            />
                                            <Text style={styles.optionButtonText}>Tomar Foto</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.optionButton, { flex: 1 }]}
                                            onPress={async () => {
                                                try {
                                                    const { status } =
                                                        await ImagePicker.requestMediaLibraryPermissionsAsync()
                                                    if (status !== "granted") {
                                                        showAlert(
                                                            "Necesitamos permisos de galería para continuar",
                                                            "error"
                                                        )
                                                        return
                                                    }

                                                    const result =
                                                        await ImagePicker.launchImageLibraryAsync({
                                                            mediaTypes:
                                                                ImagePicker.MediaTypeOptions.Images,
                                                            allowsEditing: false,
                                                            quality: 0.8,
                                                            allowsMultipleSelection: true,
                                                            base64: false,
                                                            exif: false,
                                                        })

                                                    if (!result.canceled && result.assets) {
                                                        const filesInfo: FileInfo[] =
                                                            result.assets.map((asset, index) => ({
                                                                uri: asset.uri,
                                                                name: `galeria_${Date.now()}_${index}.jpg`,
                                                                type:
                                                                    asset.type === "image"
                                                                        ? "image/jpeg"
                                                                        : "image/jpeg",
                                                            }))

                                                        setPendingFiles((prev) => [
                                                            ...prev,
                                                            ...filesInfo,
                                                        ])

                                                        const photoNames = filesInfo.map(
                                                            (file) => file.name
                                                        )
                                                        const currentFiles = Array.isArray(
                                                            field.value
                                                        )
                                                            ? field.value
                                                            : []
                                                        field.onChange([
                                                            ...currentFiles,
                                                            ...photoNames,
                                                        ])
                                                    }
                                                } catch (error) {
                                                    showAlert(
                                                        "Error al seleccionar de la galería",
                                                        "error"
                                                    )
                                                }
                                            }}
                                        >
                                            <Ionicons
                                                name="images-outline"
                                                size={20}
                                                color="#666"
                                            />
                                            <Text style={styles.optionButtonText}>Galería</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.optionButton, { width: "100%" }]}
                                        onPress={async () => {
                                            try {
                                                const result =
                                                    await DocumentPicker.getDocumentAsync({
                                                        type: ["image/*", "application/pdf"],
                                                        multiple: true,
                                                        copyToCacheDirectory: true,
                                                    })

                                                if (!result.canceled && result.assets) {
                                                    const filesInfo: FileInfo[] = result.assets.map(
                                                        (asset) => ({
                                                            uri: asset.uri,
                                                            name: asset.name,
                                                            type:
                                                                asset.mimeType || "application/pdf",
                                                        })
                                                    )

                                                    setPendingFiles((prev) => [
                                                        ...prev,
                                                        ...filesInfo,
                                                    ])

                                                    const fileNames = filesInfo.map(
                                                        (file) => file.name
                                                    )
                                                    const currentFiles = Array.isArray(field.value)
                                                        ? field.value
                                                        : []
                                                    field.onChange([...currentFiles, ...fileNames])
                                                }
                                            } catch (error) {
                                                showAlert("Error al seleccionar archivos", "error")
                                            }
                                        }}
                                    >
                                        <Ionicons name="folder-outline" size={20} color="#666" />
                                        <Text style={styles.optionButtonText}>
                                            Seleccionar Documentos
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {Array.isArray(field.value) && field.value.length > 0 && (
                                    <View style={{ marginTop: 10 }}>
                                        <Text
                                            style={[
                                                styles.phoneLabel,
                                                { fontSize: 14, marginBottom: 10 },
                                            ]}
                                        >
                                            Archivos seleccionados ({field.value.length}):
                                        </Text>
                                        {field.value.map((fileName: string, index: number) => (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    backgroundColor: Colors.light.background,
                                                    padding: 10,
                                                    borderRadius: 8,
                                                    marginBottom: 5,
                                                }}
                                            >
                                                <Ionicons
                                                    name={
                                                        fileName.toLowerCase().includes(".pdf")
                                                            ? "document-outline"
                                                            : fileName.startsWith("foto_")
                                                            ? "camera-outline"
                                                            : fileName.startsWith("galeria_")
                                                            ? "images-outline"
                                                            : "image-outline"
                                                    }
                                                    size={16}
                                                    color="#666"
                                                />
                                                <Text
                                                    style={{
                                                        flex: 1,
                                                        marginLeft: 8,
                                                        fontSize: 12,
                                                        color: "#333",
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {fileName}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const currentFiles = Array.isArray(
                                                            field.value
                                                        )
                                                            ? field.value
                                                            : []
                                                        const newFiles = currentFiles.filter(
                                                            (_: any, i: number) => i !== index
                                                        )
                                                        field.onChange(newFiles)
                                                    }}
                                                    style={{ padding: 5 }}
                                                >
                                                    <Ionicons
                                                        name="close-circle"
                                                        size={18}
                                                        color= {Colors.danger}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                {fieldState.error && (
                                    <Text style={{ color: "red", fontSize: 12, marginTop: 5 }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                )
            default:
                return null
        }
    }

    return (
        <>
            <StatusBar backgroundColor= "Colors.primary" barStyle="dark-content" />
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

                            <View style={styles.stepIndicator}>
                                <View style={styles.stepCircleContainer}>
                                    <Text style={styles.stepCircle}>{`${step + 1}/6`}</Text>
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
                                    <View style={{ width: "100%", marginTop: 15 }}>
                                        <View style={{ marginBottom: 10 }}>
                                            <Checkbox
                                                label="He leído y acepto los Términos y Condiciones"
                                                checked={acceptedTerms}
                                                onPress={() => setAcceptedTerms(!acceptedTerms)}
                                            />
                                            <TouchableOpacity
                                                onPress={() =>
                                                    router.push("/(legal)/terms-and-conditions")
                                                }
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

                                        <TouchableOpacity
                                            style={styles.secondaryButton}
                                            onPress={onBack}
                                        >
                                            <Text style={styles.secondaryButtonText}>Volver</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </>
    )
}

const useThemeStyles = (width: number, height: number, colors: any) => {
    const isSmallScreen = width < 350
    const headerHeight = Math.max(height * 0.25, 180)
    const logoSize = Math.min(width * 0.4, 150)

    return StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
            backgroundColor: colors.background,
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
            backgroundColor: Colors.light.background,
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
            color: colors.text,
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
        documentsHelperText: {
            fontSize: 14,
            color: "#333",
            marginBottom: 15,
            fontWeight: "600",
            textAlign: "center",
            backgroundColor: "#fff3cd",
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.primary,
            lineHeight: 20,
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
        optionButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            paddingHorizontal: 15,
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.secondary,
            gap: 8,
        },
        optionButtonText: {
            color: "#666",
            fontSize: 14,
            fontWeight: "500",
        },
        profileHelperText: {
            fontSize: 12,
            color: "#666",
            marginBottom: 15,
            textAlign: "center",
            fontStyle: "italic",
        },
        uploadButton: {
            width: Math.min(width * 0.4, 150),
            height: Math.min(width * 0.4, 150),
            borderRadius: Math.min(width * 0.2, 75),
            backgroundColor: Colors.light.background,
            borderWidth: 2,
            borderColor: Colors.secondary,
            borderStyle: "dashed",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 15,
        },
        uploadButtonText: {
            marginTop: 8,
            fontSize: 12,
            color: Colors.secondary,
            fontWeight: "600",
        },
        imagePreviewContainer: {
            position: "relative",
            marginVertical: 15,
        },
        profileImagePreview: {
            width: Math.min(width * 0.4, 150),
            height: Math.min(width * 0.4, 150),
            borderRadius: Math.min(width * 0.2, 75),
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
            fontStyle: "italic",
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
}
