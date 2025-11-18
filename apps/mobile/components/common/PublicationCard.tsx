import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter, usePathname } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"
import { Pet } from "@/interfaces/pet"
import { Colors } from "@/constants/Colors"
import { useAuthContext } from "@/context/AuthContext"
import { translateSpeciesToSpanish, translateGenderToSpanish } from "@/utils/petTranslations"
import { formatAgeFromObject } from "@/utils/ageFormat"
import { useThemeColor } from "@/hooks/useThemeColor"

interface PublicationCardProps {
    pet: Pet
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pet }) => {
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuthContext()

    const cardBgColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const textTertiaryColor = useThemeColor({}, "textTertiary")
    const tintColor = useThemeColor({}, "tint")
    const disabledColor = useThemeColor({}, "disabled")

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

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: cardBgColor },
                animatedStyle
            ]}
            sharedTransitionTag={`pet-card-${pet.id}`}
        >
            <Animated.Image
                style={[styles.image, { backgroundColor: disabledColor }]}
                source={typeof pet.image === "string" ? { uri: pet.image } : pet.image}
                sharedTransitionTag={`pet-image-${pet.id}`}
            />
            <View style={styles.infoContainer}>
                <Animated.Text 
                    style={[styles.name, { color: textColor }]} 
                    sharedTransitionTag={`pet-name-${pet.id}`}
                >
                    {pet.name}
                </Animated.Text>
                <Text style={[styles.details, { color: textSecondaryColor }]}>
                    {`${translateSpeciesToSpanish((pet as any).type || "")} • ${translateGenderToSpanish(pet.gender || "")}`}
                </Text>
                <Text style={[styles.ageText, { color: textMutedColor }]}>
                    {formatAgeFromObject(pet)}
                </Text>
                <Text style={[styles.publisher, { color: textTertiaryColor }]}>
                    Publicado por: {pet.publisher}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: tintColor }]}
                onPress={handleViewDetails}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
            >
                <Text style={[styles.buttonText, { color: "#000" }]}>Ver Información</Text>
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    card: {
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
        marginBottom: 2,
    },
    details: {
        fontSize: 13,
        marginBottom: 2,
    },
    ageText: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 2,
    },
    publisher: {
        fontSize: 12,
        marginBottom: 4,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 8,
        marginHorizontal: 12,
        marginBottom: 12,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "bold",
    },
})

export default PublicationCard