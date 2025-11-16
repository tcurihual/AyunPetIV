import React, { useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

type RegistrationType = "user" | "giver" | "shelter"

export default function RegistrationSuccessScreen() {
    const router = useRouter()
    const { type, email } = useLocalSearchParams<{ type: RegistrationType; email?: string }>()

    const getContent = () => {
        switch (type) {
            case "user":
                return {
                    icon: "mail-outline",
                    iconColor: "#FFD24C",
                    title: "¡Registro Exitoso!",
                    subtitle: "Valida tu cuenta",
                    message:
                        "Hemos enviado un código de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para validar tu cuenta.",
                    steps: [
                        "Revisa tu correo electrónico",
                        "Busca el código de verificación",
                        "Ingresa el código en la siguiente pantalla",
                        "¡Listo! Podrás iniciar sesión",
                    ],
                    buttonText: "Validar cuenta ahora",
                    action: () => {
                        router.replace({
                            pathname: "/(auth)/verify-email",
                            params: { email: email || "" },
                        })
                    },
                }
            case "giver":
            case "shelter":
                const isShelter = type === "shelter"
                return {
                    icon: "time-outline",
                    iconColor: "#A47CF3",
                    title: "¡Registro Exitoso!",
                    subtitle: "Cuenta en revisión",
                    message: `Tu solicitud como ${
                        isShelter ? "fundación" : "dador individual"
                    } ha sido recibida correctamente. Un administrador revisará la documentación que proporcionaste.`,
                    steps: [
                        "Tu cuenta está siendo revisada por un administrador",
                        "Recibirás un correo electrónico cuando sea validada",
                        "El proceso puede tomar entre 24 a 48 horas",
                        "Una vez validada, podrás iniciar sesión normalmente",
                    ],
                    buttonText: "Volver al inicio",
                    action: () => {
                        router.replace("/(auth)/(login)/")
                    },
                    additionalInfo:
                        "Nota: Si no recibes respuesta en 48 horas, por favor contacta a soporte.",
                }
            default:
                return {
                    icon: "checkmark-circle-outline",
                    iconColor: "#4CAF50",
                    title: "¡Registro Exitoso!",
                    subtitle: "Cuenta creada",
                    message: "Tu cuenta ha sido creada correctamente.",
                    steps: ["Ahora puedes iniciar sesión con tus credenciales"],
                    buttonText: "Ir al inicio de sesión",
                    action: () => {
                        router.replace("/(auth)/(login)/")
                    },
                }
        }
    }

    const content = getContent()

    return (
        <>
            <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    {/* Icono principal */}
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: content.iconColor + "20" },
                        ]}
                    >
                        <Ionicons name={content.icon as any} size={60} color={content.iconColor} />
                    </View>

                    {/* Título y subtítulo */}
                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.subtitle}>{content.subtitle}</Text>

                    {/* Mensaje principal */}
                    <Text style={styles.message}>{content.message}</Text>

                    {/* Pasos a seguir */}
                    <View style={styles.stepsContainer}>
                        {content.steps.map((step, index) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Información adicional (solo para giver/shelter) */}
                    {content.additionalInfo && (
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={18} color="#666" />
                            <Text style={styles.infoText}>{content.additionalInfo}</Text>
                        </View>
                    )}

                    {/* Botón de acción */}
                    <TouchableOpacity style={styles.button} onPress={content.action}>
                        <Text style={styles.buttonText}>{content.buttonText}</Text>
                        <Ionicons name="arrow-forward" size={18} color="#000" />
                    </TouchableOpacity>

                    {/* Enlace alternativo */}
                    {type === "user" && (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.replace("/(auth)/(login)/")}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Validar más tarde e ir al inicio
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Logo en la parte inferior */}
                <Image
                    source={require("@images/ayun-pet.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        paddingTop: 40,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 500,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginBottom: 16,
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        color: "#444",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 5,
    },
    stepsContainer: {
        width: "100%",
        marginBottom: 20,
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        paddingHorizontal: 5,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#FFD24C",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        flexShrink: 0,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    stepText: {
        flex: 1,
        fontSize: 13,
        color: "#333",
        lineHeight: 19,
        paddingTop: 4,
    },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#FFF3CD",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        width: "100%",
        borderWidth: 1,
        borderColor: "#FFE69C",
        alignItems: "flex-start",
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: "#666",
        marginLeft: 8,
        lineHeight: 18,
    },
    button: {
        flexDirection: "row",
        backgroundColor: Colors.yellow,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "600",
        marginRight: 6,
    },
    secondaryButton: {
        marginTop: 12,
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: "#7c3aed",
        fontSize: 13,
        textDecorationLine: "underline",
        textAlign: "center",
    },
    logo: {
        width: 100,
        height: 80,
        marginTop: 20,
        opacity: 0.5,
    },
})
