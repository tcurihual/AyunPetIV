import { Text, View, StyleSheet } from "react-native"

export default function Index() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Ayün Pet</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "#000",
    },
})
