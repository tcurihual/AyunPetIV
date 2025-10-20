import React from "react"
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { Colors } from "@/constants/Colors"

const { width } = Dimensions.get("window")

type HeaderProps = {
    onMenuPress?: () => void
}

export default function Header({ onMenuPress }: HeaderProps) {
    const router = useRouter()
    const { user } = useAuthContext()

    const defaultAvatar = "https://randomuser.me/api/portraits/women/44.jpg"
    const userAvatar = user?.avatar || defaultAvatar

    const handleProfilePress = () => {
        if (user?.role === 21 || user?.role === 22) {
            router.push("/(shelter)/my-profile")
        } else {
            router.push("/(home)/my-profile")
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                <Ionicons name="menu" size={width * 0.07} color="#000" />
            </TouchableOpacity>

            <Image source={require("@/assets/images/Ayun-pet-Logo.png")} style={styles.logo} />

            <TouchableOpacity style={styles.profileCircle} onPress={handleProfilePress}>
                <Image source={{ uri: userAvatar }} style={styles.profileImage} />

                {!user && (
                    <View style={styles.noUserIndicator}>
                        <Text style={styles.noUserText}>?</Text>
                    </View>
                )}
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
        backgroundColor: Colors.yellow,
        paddingHorizontal: width * 0.05,
        paddingVertical: width * 0.02,
    },
    iconButton: { padding: 5 },
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
    profileImage: { width: "100%", height: "100%", resizeMode: "cover" },
    noUserIndicator: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    noUserText: {
        color: "#fff",
        fontSize: width * 0.04,
        fontWeight: "bold",
    },
})
