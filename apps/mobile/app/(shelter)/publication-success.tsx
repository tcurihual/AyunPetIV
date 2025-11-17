import React, { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

const { width, height } = Dimensions.get("window")

export default function PublicationSuccessScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()

    const postId = params.postId as string

    // Animaciones
    const checkScale = useSharedValue(0)
    const checkRotation = useSharedValue(-180)
    const contentOpacity = useSharedValue(0)
    const contentTranslateY = useSharedValue(30)

    useEffect(() => {
        // Animar el check
        checkScale.value = withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1, { damping: 10, stiffness: 100 })
        )
        checkRotation.value = withSpring(0, { damping: 10, stiffness: 80 })

        // Animar el contenido con delay
        contentOpacity.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }))
        contentTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 100 }))
    }, [])

    const checkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }, { rotate: `${checkRotation.value}deg` }],
    }))

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }))

    const handleViewPublication = () => {
        if (postId) {
            router.replace({
                pathname: "/(shelter)/publication/[id]",
                params: { id: postId },
            })
        } else {
            router.replace("/(shelter)")
        }
    }

    const handleBackToHome = () => {
        router.replace("/(shelter)")
    }

    return (
        <View style={styles.container}>
            {/* Contenido superior centrado */}
            <View style={styles.topContent}>
                {/* Ícono de éxito animado */}
                <Animated.View style={[styles.checkCircle, checkAnimatedStyle]}>
                    <Ionicons name="checkmark-circle" size={140} color={Colors.light.success} />
                </Animated.View>

                {/* Título animado */}
                <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
                    <Text style={styles.title}>¡Publicación Exitosa! 🎉</Text>
                </Animated.View>
            </View>

            {/* Botones en la parte inferior */}
            <Animated.View style={[styles.buttonsContainer, contentAnimatedStyle]}>
                {postId && (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleViewPublication}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="eye" size={24} color="#222" />
                        <Text style={styles.primaryButtonText}>Ver Publicación</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleBackToHome}
                    activeOpacity={0.8}
                >
                    <Ionicons name="home" size={24} color={Colors.secondary} />
                    <Text style={styles.secondaryButtonText}>Volver al Inicio</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: "space-between",
        paddingVertical: 60,
    },
    topContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    checkCircle: {
        marginBottom: 40,
    },
    textContainer: {
        alignItems: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#222",
        textAlign: "center",
    },
    buttonsContainer: {
        width: "100%",
        paddingHorizontal: 24,
        gap: 12,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButton: {
        backgroundColor: Colors.yellow,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222",
    },
    secondaryButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: Colors.secondary,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.secondary,
    },
})
