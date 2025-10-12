import React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"

const Welcome = () => {
    const { height } = useWindowDimensions()
    const router = useRouter()

    return (
        <View style={styles.container}>
            {/* 🔹 Texto principal */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>Bienvenido a</Text>
                <Text style={[styles.title, styles.highlight]}>Ayün Pet</Text>
                <Text style={styles.subtitle}>¡Donde podrás encontrar</Text>
                <Text style={styles.subtitle}>mascotas en un solo lugar!</Text>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#7C3AED" }]}
                    onPress={() => router.push("/(auth)/login")}
                >
                    <Text style={styles.buttonText}>Ya tengo una cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#9B6DD7" }]}
                    onPress={() => router.push("/(auth)/register")}
                >
                    <Text style={styles.buttonText}>¡Quiero Adoptar!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#4C1D95" }]}
                    onPress={() => router.push("/(auth)/giver_register")}
                >
                    <Text style={styles.buttonText}>Quiero Dar en Adopción</Text>
                </TouchableOpacity>
            </View>

            <Image
                source={require("@images/welcome-pets.png")}
                style={[styles.bottomImage, { height: height * 0.35 }]}
                resizeMode="contain"
            />

            <Image
                source={require("@images/paw.png")}
                style={[styles.paw, { top: 40, right: 50, transform: [{ rotate: "-20deg" }] }]}
                resizeMode="contain"
            />
            <Image
                source={require("@images/paw.png")}
                style={[styles.paw, { top: 100, right: 90, transform: [{ rotate: "15deg" }] }]}
                resizeMode="contain"
            />
            <Image
                source={require("@images/paw.png")}
                style={[styles.paw, { top: 160, right: 30, transform: [{ rotate: "-10deg" }] }]}
                resizeMode="contain"
            />
        </View>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.yellow,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 150,
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 40,
        zIndex: 2,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
    },
    highlight: {
        color: "#9B6DD7",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#000",
        textAlign: "center",
    },
    buttonsContainer: {
        width: "80%",
        gap: 15,
        marginTop: 20,
        alignItems: "center",
        zIndex: 2,
    },
    button: {
        width: "100%",
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    bottomImage: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    paw: {
        position: "absolute",
        width: 40,
        height: 40,
        opacity: 0.45,
    },
})
