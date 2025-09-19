import React from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"
import { Pet } from "@/interfaces/pet"

interface PublicationCardProps {
    pet: Pet
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pet }) => {
    return (
        <View style={styles.card}>
            <Image
                style={styles.image}
                source={typeof pet.image === "string" ? { uri: pet.image } : pet.image}
            ></Image>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{pet.name}</Text>
                <Text style={styles.details}>{`${pet.gender} ${pet.age}`}</Text>
                <Text style={styles.publisher}>Publicado por: {pet.publisher}</Text>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => console.log("Ver información de la mascota:", pet.name)}
            >
                <Text style={styles.buttonText}>Ver Información</Text>
            </TouchableOpacity>
        </View>
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
        flex: 1, // Cambio: flexibilidad en lugar de ancho fijo
    },
    image: {
        width: "100%",
        height: 140, // Incrementé la altura para mejor proporción
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
        backgroundColor: "#FFD700",
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
