// apps/mobile/components/Navbar.tsx
import { View, Text, StyleSheet } from "react-native"

export default function Navbar() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ayun Pet</Text>
            <Text style={styles.title}>ZZZ</Text>
            {/* luego puedes agregar botones o íconos aquí */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
})
