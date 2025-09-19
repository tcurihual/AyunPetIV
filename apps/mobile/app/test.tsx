import React from "react"
import { View, StyleSheet } from "react-native"
import PublicationCard from "@common/PublicationCard"

export default function Index() {
    const testPet = {
        id: "1",
        name: "Firulais",
        age: "2 años",
        breed: "Golden Retriever",
        gender: "male",
        publisher: "John Doe",
        image: require("../assets/images/ayun-pet.png"),
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <PublicationCard pet={testPet} />
                <PublicationCard pet={testPet} />
            </View>
            <View style={styles.row}>
                <PublicationCard pet={testPet} />
                <PublicationCard pet={testPet} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
})
