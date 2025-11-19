import React, { useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter, usePathname } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

import { useAuthContext } from "@/context/AuthContext"
import { useSavedPostsContext } from "@/context/SavedPostsContext"
import { translateSpeciesToSpanish, translateGenderToSpanish } from "@/utils/petTranslations"
import { useThemeColor } from "@/hooks/useThemeColor"
import type { PublicationItem } from "@/context/PublicationContext"

interface PublicationCardProps {
    pet: PublicationItem
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pet }) => {
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuthContext()
    const { savePost, removeSavedPostByPostId, checkIfPostIsSaved } = useSavedPostsContext()

    const cardBgColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const textTertiaryColor = useThemeColor({}, "textTertiary")
    const tintColor = useThemeColor({}, "tint")
    const disabledColor = useThemeColor({}, "disabled")

    const scale = useSharedValue(1)

    // ⭐ estados de guardado
    const [isSaved, setIsSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    // id real del post: preferir postId, si no usar id
    const postId = Number(pet.postId ?? pet.id)

    const imageSource = pet.image // ya viene normalizado en PublicationItem

    useEffect(() => {
        if (!user) return
        if (!Number.isFinite(postId)) return

        let isMounted = true

        const checkSaved = async () => {
            try {
                const res = await checkIfPostIsSaved(postId)
                if (isMounted) setIsSaved(res.is_saved)
            } catch (err) {
                console.log("Error checking if post is saved:", err)
            }
        }

        checkSaved()
        return () => {
            isMounted = false
        }
    }, [user, postId, checkIfPostIsSaved])

    const handleToggleSave = useCallback(async () => {
        if (!user || saving) return
        if (!Number.isFinite(postId)) return

        setSaving(true)
        try {
            if (isSaved) {
                await removeSavedPostByPostId(postId)
                setIsSaved(false)
            } else {
                await savePost(postId)
                setIsSaved(true)
            }
        } catch (err) {
            console.log("Error toggling saved post:", err)
        } finally {
            setSaving(false)
        }
    }, [user, saving, isSaved, postId, savePost, removeSavedPostByPostId])

    const handleViewDetails = () => {
        if (!Number.isFinite(postId)) return

        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
        setTimeout(() => {
            const isShelter = user?.role === 21 || user?.role === 22
            const route = isShelter ? "/(shelter)/publication/[id]" : "/(home)/publication/[id]"

            console.log(
                "🔵 PublicationCard: Clicked",
                "postId:",
                postId,
                "pathname:",
                pathname,
                "user role:",
                user?.role
            )

            router.push({
                pathname: route as any,
                params: { id: String(postId) },
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

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const species = (pet.species ?? pet.type ?? "").toString()
    const gender = (pet.gender ?? "").toString()

    return (
        <Animated.View style={[styles.card, { backgroundColor: cardBgColor }, animatedStyle]}>
            {user && Number.isFinite(postId) && (
                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={handleToggleSave}
                    disabled={saving}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={isSaved ? "heart" : "heart-outline"}
                        size={20}
                        color={isSaved ? "#e63946" : textSecondaryColor}
                    />
                </TouchableOpacity>
            )}

            {imageSource && (
                <Animated.Image
                    style={[styles.image, { backgroundColor: disabledColor }]}
                    source={imageSource}
                />
            )}

            <View style={styles.infoContainer}>
                <Animated.Text style={[styles.name, { color: textColor }]}>
                    {pet.name}
                </Animated.Text>

                <Text style={[styles.details, { color: textSecondaryColor }]}>
                    {`${translateSpeciesToSpanish(species)} • ${translateGenderToSpanish(gender)}`}
                </Text>

                <Text style={[styles.ageText, { color: textMutedColor }]}>{pet.age}</Text>

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
        position: "relative",
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
    heartButton: {
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 20,
        padding: 6,
    },
})

export default PublicationCard
