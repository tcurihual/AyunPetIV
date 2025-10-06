import React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from "react-native"
import { useRouter } from "expo-router"
import { FirstLaunch } from "@/utils/storage"

const Index = () => {
    const { height } = useWindowDimensions()
    const router = useRouter()

    const handleAdoptPress = async () => {
        await FirstLaunch()
        router.push("/(auth)/login")
    }

    const handleGivePress = async () => {
        await FirstLaunch()
        router.push("/(auth)/giver_register")
    }

    return (
        <View style={styles.container}>
            <View style={styles.childContainer}>
                <Text style={styles.titleText}>Bienvenido a </Text>
                <Text style={styles.titleText}>Ayün Pet </Text>
                <Text></Text>
                <Text style={styles.titleDesc}>¡Donde podrás encontrar</Text>
                <Text style={styles.titleDesc}>mascotas en un solo lugar!</Text>
            </View>

            <View style={{ gap: 16, alignItems: "center", width: "100%" }}>
                <TouchableOpacity
                    style={[styles.buttonPrimary, styles.buttonSecondary]}
                    onPress={handleAdoptPress}
                >
                    <Text style={styles.buttonText}>¡Quiero Adoptar!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonPrimary, styles.buttonSecondary]}
                    onPress={handleGivePress}
                >
                    <Text style={styles.buttonText}>Quiero Dar en Adopción</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.childContainer}>
                <Image
                    source={require("@images/welcome-pets.png")}
                    style={[styles.petImg, { top: -height * 0.12 }]}
                    resizeMode="none"
                />
            </View>
        </View>
    )
}

export default Index

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
    },
    titleDesc: {
        fontSize: 16,
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
    buttonSecondary: { marginTop: 0 }, // Reducido el margen entre los botones
    buttonText: { color: "#fff", fontSize: 16 },
})
