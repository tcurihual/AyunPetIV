import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter, usePathname } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"
import { Pet } from "@/interfaces/pet"
import { Colors } from "@/constants/Colors"
import { useAuthContext } from "@/context/AuthContext"
import { translateSpeciesToSpanish, translateGenderToSpanish } from "@/utils/petTranslations"

interface PublicationCardProps {
    pet: Pet
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pet }) => {
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuthContext()

    const scale = useSharedValue(1)

    const handleViewDetails = () => {
        console.log(
            "🔵 PublicationCard: Clicked, pet.id:",
            pet.id,
            "pathname:",
            pathname,
            "user role:",
            user?.role
        )
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
        setTimeout(() => {
            const isShelter = user?.role === 21 || user?.role === 22
            const route = isShelter ? "/(shelter)/publication/[id]" : "/(home)/publication/[id]"

            console.log(
                "🔵 PublicationCard: isShelter:",
                isShelter,
                "Navigating to:",
                route,
                "with id:",
                pet.id
            )
            router.push({
                pathname: route as any,
                params: { id: String(pet.id) },
            })
            scale.value = withSpring(1, { damping: 15, stiffness: 300 })
        }, 100)
    }

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 250 })
    }

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 250 })
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    })

    const formatAge = (age?: string | number) => {
        if (age === undefined || age === null || age === "" || age === "undefined")
            return "Desconocida"
        const numericAge = Number(age)
        if (isNaN(numericAge)) return String(age)
        if (numericAge <= 0) return "Cachorro"
        if (numericAge === 1) return "1 año"
        return `${numericAge} años`
    }

    return (
        <Animated.View
            style={[styles.card, animatedStyle]}
            sharedTransitionTag={`pet-card-${pet.id}`}
        >
            <Animated.Image
                style={styles.image}
                source={typeof pet.image === "string" ? { uri: pet.image } : pet.image}
                sharedTransitionTag={`pet-image-${pet.id}`}
            />
            <View style={styles.infoContainer}>
                <Animated.Text style={styles.name} sharedTransitionTag={`pet-name-${pet.id}`}>
                    {pet.name}
                </Animated.Text>
                <Text style={styles.details}>
                    {`${translateSpeciesToSpanish(
                        (pet as any).type || ""
                    )} • ${translateGenderToSpanish(pet.gender || "")} • ${formatAge(pet.age)}`}
                </Text>

                <Text style={styles.publisher}>Publicado por: {pet.publisher}</Text>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={handleViewDetails}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Ver Información</Text>
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 1,
    },
    image: {
        width: "100%",
        height: 140,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: "#eee",
    },
    infoContainer: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 6,
        alignItems: "flex-start",
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 2,
    },
    details: {
        fontSize: 13,
        color: "#666",
        marginBottom: 2,
    },
    publisher: {
        fontSize: 12,
        color: "#999",
        marginBottom: 4,
    },
    button: {
        backgroundColor: `${Colors.yellow}`,
        borderRadius: 8,
        paddingVertical: 8,
        marginHorizontal: 12,
        marginBottom: 12,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#222",
    },
})

export default PublicationCard