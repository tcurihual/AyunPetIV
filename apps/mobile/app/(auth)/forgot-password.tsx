import React, { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

export default function ForgotPasswordScreen() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const styles = useThemeStyles()

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>

            {/* Header igual al Register */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Recuperar contraseña</Text>
                <View style={styles.semiCircle} />
                <Image
                    source={require("@images/ayun-pet.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="key-outline" size={22} color="#A47CF3" />
                    </View>
                    <Text style={styles.instruction}>
                        Ingresa tu correo para{"\n"}restablecer tu contraseña
                    </Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Enviar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                    <Text style={styles.secondaryButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const useThemeStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "flex-start",
        },
        backButton: {
            position: "absolute",
            top: 24,
            left: 16,
            zIndex: 1,
        },
        header: {
            backgroundColor: "#FFD24C",
            width: "110%",
            height: height * 0.22,
            alignItems: "center",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            paddingBottom: 20,
            marginBottom: 12,
        },
        headerTitle: {
            fontSize: width < 350 ? 16 : 20,
            fontWeight: "bold",
            marginTop: 24,
            marginBottom: 8,
            color: "#222",
        },
        logo: {
            width: width * 0.45,
            height: width * 0.38,
            top: 12,
        },
        semiCircle: {
            position: "absolute",
            bottom: -40,
            width: "35%",
            height: "60%",
            backgroundColor: "#fff",
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            alignSelf: "center",
            zIndex: 0,
        },
        content: {
            flex: 1,
            alignItems: "center",
            paddingHorizontal: 20,
            width: "100%",
            marginTop: 20,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
            width: "90%",
        },
        iconCircle: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#EFE9FE",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
        },
        instruction: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#000",
        },
        input: {
            width: "90%",
            minWidth: 220,
            maxWidth: 400,
            height: 40,
            backgroundColor: "#fff",
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 18,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#A47CF3",
            color: "#222",
        },
        button: {
            width: "80%",
            minWidth: 180,
            maxWidth: 350,
            height: 40,
            backgroundColor: "#FFD24C",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
            elevation: 2,
        },
        buttonText: {
            color: "#fff",
            fontWeight: "500",
            fontSize: 15,
        },
        secondaryButton: {
            width: "80%",
            minWidth: 180,
            maxWidth: 350,
            height: 40,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 12,
            borderWidth: 1,
            borderColor: "#FFD24C",
            backgroundColor: "#fff",
        },
        secondaryButtonText: {
            color: "#FFD24C",
            fontWeight: "500",
            fontSize: 15,
        },
    })
