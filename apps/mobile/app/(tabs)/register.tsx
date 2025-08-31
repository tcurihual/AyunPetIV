import * as React from "react"
import { useState } from "react"
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function RegisterScreen() {
    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [rut, setRut] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [repeatPassword, setRepeatPassword] = useState<string>("")

    return React.createElement(
        View,
        { style: styles.container },
        React.createElement(
            TouchableOpacity,
            { style: styles.backButton, onPress: () => router.back() },
            React.createElement(Ionicons, { name: "arrow-back", size: 28, color: "black" })
        ),
        React.createElement(Image, {
            source: require("@/assets/images/ayun-pet.png"),
            style: styles.logo,
            resizeMode: "contain",
        }),
        React.createElement(TextInput, {
            style: styles.input,
            placeholder: "Correo electrónico",
            value: email,
            onChangeText: setEmail,
            autoCapitalize: "none",
            keyboardType: "email-address",
        }),
        React.createElement(TextInput, {
            style: styles.input,
            placeholder: "RUT",
            value: rut,
            onChangeText: setRut,
            autoCapitalize: "characters",
        }),
        React.createElement(TextInput, {
            style: styles.input,
            placeholder: "Contraseña",
            value: password,
            onChangeText: setPassword,
            secureTextEntry: true,
        }),
        React.createElement(TextInput, {
            style: styles.input,
            placeholder: "Repita Contraseña",
            value: repeatPassword,
            onChangeText: setRepeatPassword,
            secureTextEntry: true,
        }),
        React.createElement(
            TouchableOpacity,
            { style: styles.button },
            React.createElement(Text, { style: styles.buttonText }, "Crear Cuenta")
        ),
        React.createElement(
            TouchableOpacity,
            { style: styles.button, onPress: () => router.back() },
            React.createElement(Text, { style: styles.buttonText }, "Volver Atrás")
        )
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ededed",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 40,
        paddingHorizontal: 16,
    },
    backButton: {
        position: "absolute",
        top: 24,
        left: 16,
        zIndex: 1,
    },
    logo: {
        width: 160,
        height: 140,
        marginBottom: 24,
        marginTop: 24,
    },
    input: {
        width: "90%",
        height: 40,
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        fontSize: 15,
    },
    button: {
        width: "80%",
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
})
