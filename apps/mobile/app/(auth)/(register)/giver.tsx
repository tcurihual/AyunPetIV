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

const steps: { title: string; fields: (keyof GiverRegisterFormType)[] }[] = [
    { title: "Nombre", fields: ["name"] },
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

    const {
        control,
        handleSubmit,
        trigger,
        getValues,
        setValue,
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

    const onSubmit = async (data: GiverRegisterFormType) => {
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
                    "giver"
                )

                // TODO: console.log no realiza nada, implementar lo que se debe po sacar validación
                if (pendingFiles.length > 0) {
                    console.log("Archivos pendientes de subir:", pendingFiles.length)
                }

                const message = result.requiresEmailVerification
                    ? "Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta."
                    : "Registro exitoso. Tu cuenta será validada por un administrador."

                showAlert(message, "success")

                setTimeout(() => {
                    router.replace("/(auth)/login")
                }, 2000)
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
                            label="Nombre completo"
                            placeholder="Juan Pérez"
                        />
                    </>
                )
            case 1:
                return (
                    <>
                        <Input<GiverRegisterFormType>
                            key="rut"
                            name="rut"
                            control={control}
                            label="RUT"
                            placeholder="12.345.678-9"
                        />
                    </>
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
                                        style={{ flexDirection: "row", marginBottom: 10, gap: 10 }}
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
                                                    backgroundColor: "#f5f5f5",
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
                                                        color="#ff4444"
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
                                                    color: "#007AFF",
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
                                                backgroundColor: "#F2E4A2",
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

                            <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
                                <Text style={styles.secondaryButtonText}>Volver</Text>
                            </TouchableOpacity>
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
            borderColor: "#ffeaa7",
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
        optionButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            paddingHorizontal: 15,
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#A47CF3",
            gap: 8,
        },
        optionButtonText: {
            color: "#666",
            fontSize: 14,
            fontWeight: "500",
        },
    })
}
