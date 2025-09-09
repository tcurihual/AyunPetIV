import React, { useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { isFirstLaunch, FirstLaunch, getToken } from "../../src/utils/storage"
const Index = () => {
    const router = useRouter()
    return (
        <View style={styles.container}>
            <View style={styles.childContainer}>
                <Text style={styles.titleText}>Bienvenido a </Text>
                <Text style={styles.titleText}>Ayün Pet </Text>
                <Text></Text>
                <Text style={styles.titleDesc}>Donde podras encontrar</Text>
                <Text style={styles.titleDesc}>mascotas en un solo lugar!</Text>
            </View>
            <TouchableOpacity
                style={[styles.buttonPrimary, styles.buttonSecondary]}
                onPress={() => router.push("/(auth)/login")}
            >
                <Text style={styles.buttonText}>Quiero Adoptar!</Text>
            </TouchableOpacity>
            <View style={styles.childContainer}>
                <Image
                    source={require("../../assets/images/welcome-pets.png")}
                    style={styles.petImg}
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
        top: -100,
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
