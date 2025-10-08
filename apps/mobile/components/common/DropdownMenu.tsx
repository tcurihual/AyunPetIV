import React, { useEffect, useRef } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Animated,
    Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

const { width } = Dimensions.get("window")

type DropdownMenuProps = {
    onClose: () => void
}

export default function DropdownMenu({ onClose }: DropdownMenuProps) {
    const router = useRouter()
    const { signOut } = useAuthContext()

    const slideAnim = useRef(new Animated.Value(-width * 0.7)).current

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [])

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: -width * 0.7,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose()
        })
    }

    const handleNavigate = (
        path: `/(auth)` | `/profile` | `/settings` | `/about` | `/help` | `/login`
    ) => {
        handleClose()
        router.push(path)
    }

    return (
        <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}
                    >
                        <View style={styles.headerBar}>
                            <Image
                                source={require("@/assets/images/Ayun-pet-Logo.png")}
                                style={styles.logo}
                            />
                        </View>

                        <View style={styles.profileSection}>
                            <Ionicons name="person-circle-outline" size={64} color="#000" />
                            <Text style={styles.name}>Nombre Usuario</Text>
                            <Text style={styles.email}>usuario@email.com</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/profile")}
                        >
                            <Ionicons name="person-outline" size={22} color="#000" />
                            <Text style={styles.text}>Mi Perfil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/settings")}
                        >
                            <Ionicons name="settings-outline" size={22} color="#000" />
                            <Text style={styles.text}>Configuración</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/about")}
                        >
                            <Ionicons name="information-circle-outline" size={22} color="#000" />
                            <Text style={styles.text}>Sobre Ayün Pet</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => handleNavigate("/help")}
                        >
                            <Ionicons name="help-circle-outline" size={22} color="#000" />
                            <Text style={styles.text}>Ayuda</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.item, styles.logout]}
                            onPress={async () => {
                                await signOut()
                                handleNavigate("/(auth)")
                            }}
                        >
                            <Ionicons name="log-out-outline" size={22} color="red" />
                            <Text style={[styles.text, { color: "red" }]}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        flexDirection: "row",
    },
    menu: {
        width: width * 0.7,
        backgroundColor: "#fff",
        height: "100%",
    },
    headerBar: {
        width: "100%",
        height: 120,
        backgroundColor: "#FFD24C",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 120,
        height: 40,
        resizeMode: "contain",
    },
    profileSection: {
        alignItems: "center",
        marginVertical: 20,
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 10,
    },
    email: {
        fontSize: 12,
        color: "#666",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    text: {
        marginLeft: 15,
        fontSize: 15,
    },
    logout: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
})
