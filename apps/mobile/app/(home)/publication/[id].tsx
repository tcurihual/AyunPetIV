import React, { useMemo } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import Animated from "react-native-reanimated"
import ayunData from "@/data/mockData"

export default function PublicationDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const raw = useMemo(() => {
        return (ayunData.pet ?? []).find((p) => String(p.id) === String(id))
    }, [id])

    const publisherName = useMemo(() => {
        if (!raw) return "Fundación Demo"
        const u = (ayunData.users ?? []).find((x) => x.id === raw.ownerid)
        return u?.name ?? u?.email ?? "Fundación Demo"
    }, [raw])

    if (!raw) {
        return (
            <View style={styles.center}>
                <Text style={styles.empty}>Publicación no encontrada</Text>
            </View>
        )
    }

    const pet = {
        id: String(raw.id),
        name: raw.name,
        gender: raw.gender,
        age: `${raw.age} años`,
        publisher: publisherName,
        description: raw.description,
        image: raw.image,
        species: raw.species,
    }

    return (
        <View style={styles.screenContainer}>
            <Animated.View style={styles.container} sharedTransitionTag={`pet-card-${pet.id}`}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.infoContainer}>
                        <View style={styles.imageContainer}>
                            <Animated.Image
                                source={
                                    typeof pet.image === "string" ? { uri: pet.image } : pet.image
                                }
                                style={styles.mainImage}
                                resizeMode="cover"
                                sharedTransitionTag={`pet-image-${pet.id}`}
                            />
                        </View>

                        <View style={styles.infoContainer}>
                            <Animated.Text
                                style={styles.petName}
                                sharedTransitionTag={`pet-name-${pet.id}`}
                            >
                                Nombre: {pet.name}
                            </Animated.Text>

                            <View style={styles.infoRow}>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.infoLabel}>
                                        Género: <Text style={styles.infoValue}>{pet.gender}</Text>
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Raza/Tipo:{" "}
                                        <Text style={styles.infoValue}>{pet.species}</Text>
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Edad: <Text style={styles.infoValue}>{pet.age}</Text>
                                    </Text>
                                </View>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.infoLabel}>Publicado por:</Text>
                                    <Text style={styles.publisherName}>{pet.publisher}</Text>
                                </View>
                            </View>

                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionLabel}>Descripción: </Text>
                                <Text style={styles.descriptionText}>{pet.description}</Text>
                            </View>

                            <View style={styles.commentsContainer}>
                                <Text style={styles.commentsTitle}>Comentarios</Text>
                                <View style={styles.commentsPlaceholder}>
                                    <Text style={styles.commentsPlaceholderText}>
                                        Los comentarios aparecerán aquí...
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.sendRequestButton}>
                                    <Text style={styles.sendRequestButtonText}>
                                        Enviar Solicitud
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: "#fff", padding: 16 },
    container: {
        flex: 1,
        backgroundColor: "#EFEFEF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    imageContainer: {
        marginTop: "-10%",
        marginLeft: "-10%",
        width: width * 1,
        height: height * 0.4,
    },
    mainImage: { width: "100%", height: "100%" },
    infoContainer: { padding: 20, flex: 1 },
    petName: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 16 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    infoColumn: { flex: 1 },
    infoLabel: { fontSize: 14, color: "#222", marginBottom: 8, fontWeight: "500" },
    infoValue: { fontWeight: "normal", color: "#666" },
    publisherName: { fontSize: 14, color: "#666", fontWeight: "400" },
    descriptionContainer: { marginTop: 12, marginBottom: 24 },
    descriptionLabel: { fontSize: 14, fontWeight: "500", color: "#222", marginBottom: 4 },
    descriptionText: { fontSize: 14, color: "#666", lineHeight: 20, textAlign: "justify" },
    commentsContainer: { marginTop: 8 },
    commentsTitle: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 12 },
    commentsPlaceholder: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
    },
    commentsPlaceholderText: { fontSize: 14, color: "#999", fontStyle: "italic" },
    buttonContainer: { marginTop: 30, marginBottom: 20, paddingHorizontal: 20 },
    sendRequestButton: {
        backgroundColor: "#FFD700",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    sendRequestButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
    empty: { color: "#333" },
})
