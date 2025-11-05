import React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import { useAuthContext, User } from "@/context/AuthContext"
import Ionicons from "@expo/vector-icons/Ionicons"
import { setWelcomeSeen } from "@/utils/storage"

const Welcome = () => {
    const { height } = useWindowDimensions()
    const router = useRouter()

    const handleLoginPress = async () => {
        await setWelcomeSeen()
        router.push("/(auth)/(login)/")
    }

    const handleUserPress = async () => {
        await setWelcomeSeen()
        router.push("/(auth)/(register)/user")
    }

    const handleGiverPress = async () => {
        await setWelcomeSeen()
        router.push("/(auth)/(register)/giver")
    }

    return (
        <View style={styles.container}>
            <View style={styles.childContainer}>
                <Text style={styles.titleText}>Bienvenido a </Text>
                <Text style={styles.titleText}>Ayün Pet </Text>
                <Text></Text>
                <Text style={styles.titleDesc}>¡Donde podrás encontrar</Text>
                <Text style={styles.titleDesc}>mascotas en un solo lugar!</Text>
                <View style={styles.iconContainer}>
                    <Ionicons name="paw" size={30} color="#555" style={styles.icon1} />
                    <Ionicons name="paw" size={40} color="#9B6DD7" style={styles.icon2} />
                    <Ionicons name="paw" size={30} color="#9B6DD7" style={styles.icon3} />
                    <Ionicons name="paw" size={35} color="#555" style={styles.icon4} />
                </View>
            </View>

            <View style={{ gap: 16, alignItems: "center", width: "100%" }}>
                <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
                    <Text style={styles.LoginText}>¡Ya tengo cuenta!</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.buttonPrimary, styles.buttonSecondary]}
                    onPress={handleUserPress}
                >
                    <Text style={styles.buttonText}>¡Quiero adoptar!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonPrimary, styles.buttonSecondary]}
                    onPress={handleGiverPress}
                >
                    <Text style={styles.buttonText}>¡Quiero dar en adopción!</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.childContainer}>
                <Image
                    source={require("@images/welcome-pets.png")}
                    style={[styles.petImg, { top: -height * 0.1 }]}
                    resizeMode="none"
                />
            </View>
        </View>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        backgroundColor: `${Colors.yellow}`,
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
    buttonSecondary: { marginTop: "1%" },
    buttonText: { color: "#fff", fontSize: 16 },
    LoginText: { color: "#eee", fontSize: 16 },
    loginButton: {
        backgroundColor: "rgba(155, 109, 215, 0.15)",
        borderColor: "#9B6DD7",
        borderWidth: 1.5,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: "70%",
        alignItems: "center",
        marginBottom: "5%",
    },

    iconContainer: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
    },

    icon1: {
        position: "absolute",
        top: 0,
        right: 0,
        transform: [{ rotate: "20deg" }],
    },
    icon2: {
        position: "absolute",
        top: 50,
        right: 30,
        transform: [{ rotate: "-15deg" }],
    },
    icon3: {
        position: "absolute",
        top: 110,
        right: 5,
        transform: [{ rotate: "35deg" }],
    },
    icon4: {
        position: "absolute",
        top: 150,
        right: 50,
        transform: [{ rotate: "-25deg" }],
    },
})
