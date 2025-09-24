import React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from "react-native"
import { useRouter } from "expo-router"
import { FirstLaunch } from "@/utils/storage"

export default function Welcome() {
    const { height } = useWindowDimensions()
    const router = useRouter()

    const handlePress = async () => {
        await FirstLaunch()
        router.replace("/(auth)/login")
    }

    return (
        <View style={styles.container}>
            <View style={styles.childContainer}>
                <Text style={styles.titleText}>¡Bienvenido a Ayün Pet! 🐾</Text>
                <Text style={styles.titleDesc}>
                    La primera vez que ingresas a nuestra aplicación ✨
                </Text>
                <Text style={styles.titleDesc}>
                    Aquí podrás encontrar a tu nuevo mejor amigo en un solo lugar.
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.buttonPrimary, styles.buttonSecondary]}
                onPress={handlePress}
            >
                <Text style={styles.buttonText}>Comenzar</Text>
            </TouchableOpacity>

            <View style={styles.childContainer}>
                <Image
                    source={require("@images/welcome-pets.png")}
                    style={[styles.petImg, { top: -height * 0.12 }]}
                    resizeMode="contain"
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F9C53D",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        flex: 1,
        flexDirection: "column",
    },
    childContainer: { width: "80%" },
    titleText: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    titleDesc: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 5,
    },
    petImg: {
        position: "absolute",
        left: "36%",
        width: "100%",
    },
    buttonPrimary: {
        backgroundColor: "#9B6DD7",
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: "70%",
        alignItems: "center",
    },
    buttonSecondary: { marginTop: 25 },
    buttonText: { color: "#fff", fontSize: 16 },
})
