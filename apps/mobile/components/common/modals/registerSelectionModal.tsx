import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Colors } from "@/constants/Colors"
import { useRouter } from "expo-router"
import { useModal } from "@/context/ModalContext"

export const ChooseRegisterModalContent = () => {
    const router = useRouter()
    const { closeModal } = useModal()

    const handleAdopt = () => {
        closeModal()
        router.push("/(auth)/(register)/user")
    }

    const handleGive = () => {
        closeModal()
        router.push("/(auth)/(register)/giver")
    }

    return (
        <View style={styles.modal}>
            <Text style={styles.title}>Si aún no tienes cuenta debes registrarte</Text>
            <Text style={styles.subtitle}>Elige una opción para continuar</Text>

            <TouchableOpacity style={styles.button} onPress={handleAdopt}>
                <Text style={styles.buttonText}>Adoptar una mascota</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleGive}>
                <Text style={[styles.buttonText, { color: Colors.purple }]}>Dar en adopción</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal}>
                <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: { fontSize: 15, color: "#666", marginBottom: 20, textAlign: "center" },
    button: {
        backgroundColor: Colors.purple,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: "100%",
        alignItems: "center",
        marginVertical: 5,
    },
    secondary: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: Colors.purple },
    buttonText: { color: "#fff", fontWeight: "600" },
    cancel: { color: "#d9534f", marginTop: 15, fontWeight: "bold" },
})
