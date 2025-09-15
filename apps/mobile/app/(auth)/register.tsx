import React, { useState } from "react"
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

type InputConfig = {
    key: string
    placeholder: string
    autoCapitalize?: "none" | "sentences" | "words" | "characters"
    keyboardType?: string
    secureTextEntry?: boolean
}

const steps: {
    title: string
    inputs: InputConfig[]
}[] = [
    {
        title: "Nombre y RUT",
        inputs: [
            { key: "name", placeholder: "Nombre completo", autoCapitalize: "words" },
            { key: "rut", placeholder: "RUT", keyboardType: "default" },
        ],
    },
    {
        title: "Contraseña",
        inputs: [
            { key: "password", placeholder: "Contraseña", secureTextEntry: true },
            { key: "repeatPassword", placeholder: "Repetir contraseña", secureTextEntry: true },
        ],
    },
    {
        title: "Datos de Contacto",
        inputs: [
            { key: "email", placeholder: "Correo electrónico", keyboardType: "email-address" },
            { key: "phone", placeholder: "Teléfono", keyboardType: "phone-pad" },
        ],
    },
]

export default function RegisterScreen() {
    const router = useRouter()
    const styles = useThemeStyles()
    const [step, setStep] = useState(0)
    const [form, setForm] = useState({
        name: "",
        rut: "",
        password: "",
        repeatPassword: "",
        email: "",
        phone: "",
    })

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value })
    }

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1)
        else router.back()
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Datos de Registro</Text>
                    <View style={styles.semiCircle} />
                    <Image
                        source={require("@images/ayun-pet.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepCircle}>{`${step + 1}/3`}</Text>
                    <Text style={styles.stepTitle}>{steps[step].title}</Text>
                </View>
                {steps[step].inputs.map((input) => (
                    <TextInput
                        key={input.key}
                        style={styles.input}
                        placeholder={input.placeholder}
                        value={form[input.key as keyof typeof form]}
                        onChangeText={(v) => handleChange(input.key, v)}
                        autoCapitalize={input.autoCapitalize ?? "none"}
                        keyboardType={(input.keyboardType as any) ?? "default"}
                        secureTextEntry={input.secureTextEntry ?? false}
                    />
                ))}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {step === steps.length - 1 ? "Crear Cuenta" : "Continuar"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                    <Text style={styles.secondaryButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const useThemeStyles = () => {
    return StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
        },
        container: {
            width: "100%",
            maxWidth: 420,
            alignSelf: "center",
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: 0,
            paddingHorizontal: 16,
            minHeight: Dimensions.get("window").height,
        },
        backButton: {
            position: "absolute",
            top: 24,
            left: 16,
            zIndex: 1,
        },
        header: {
            backgroundColor: "#FFD24C",
            width: "110%",
            height: "20%",
            alignItems: "center",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            paddingBottom: 24,
            marginBottom: 12,
        },
        headerTitle: {
            fontSize: width < 350 ? 16 : 20,
            fontWeight: "bold",
            marginTop: 24,
            marginBottom: 8,
            color: "#222",
        },
        logo: {
            width: width * 0.45,
            height: width * 0.38,
            top: 12,
        },
        semiCircle: {
            position: "absolute",
            bottom: -40,
            width: "35%",
            height: "60%",
            backgroundColor: "#fff",
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            alignSelf: "center",
            zIndex: 0,
        },
        stepIndicator: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 18,
            marginTop: 18,
            width: "90%",
        },
        stepCircle: {
            borderWidth: 2,
            borderColor: "#A47CF3",
            borderRadius: 20,
            width: 40,
            height: 40,
            textAlign: "center",
            textAlignVertical: "center",
            fontSize: 18,
            color: "#A47CF3",
            marginRight: 12,
            fontWeight: "bold",
            backgroundColor: "#fff",
            paddingTop: 5,
        },
        stepTitle: {
            fontSize: width < 350 ? 15 : 18,
            fontWeight: "bold",
            color: "#222",
        },
        input: {
            width: "90%",
            minWidth: 220,
            maxWidth: 400,
            height: 40,
            backgroundColor: "#fff",
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 12,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#A47CF3",
            color: "#222",
        },
        button: {
            width: "80%",
            minWidth: 180,
            maxWidth: 350,
            height: 40,
            backgroundColor: "#FFD24C",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 18,
            elevation: 2,
        },
        buttonText: {
            color: "#fff",
            fontWeight: "500",
            fontSize: 15,
        },
        secondaryButton: {
            width: "80%",
            minWidth: 180,
            maxWidth: 350,
            height: 40,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 12,
            borderWidth: 1,
            borderColor: "#FFD24C",
            backgroundColor: "#fff",
        },
        secondaryButtonText: {
            color: "#FFD24C",
            fontWeight: "500",
            fontSize: 15,
        },
    })
}
