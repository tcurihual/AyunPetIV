import React from "react"
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

export default function Header() {
    const router = useRouter()

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Abrir menú")}>
                <Ionicons name="menu" size={width * 0.07} color="#000" />
            </TouchableOpacity>

            <Image source={require("@/assets/images/Ayun-pet-Logo.png")} style={styles.logo} />

            <TouchableOpacity style={styles.profileCircle} onPress={() => router.push("/profile")}>
                <Image
                    source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                    style={styles.profileImage}
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FBC02D",
        paddingHorizontal: width * 0.05,
        paddingVertical: width * 0.02,
    },
    iconButton: {
        padding: 5,
    },
    logo: {
        width: width * 0.35,
        height: width * 0.15,
        resizeMode: "contain",
    },

    profileCircle: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: (width * 0.12) / 2,
        overflow: "hidden",
        backgroundColor: "#ccc",
        alignItems: "center",
        justifyContent: "center",
    },
    profileImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
})
