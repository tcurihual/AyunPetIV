import React from "react"
import { ScrollView, View, Text, StyleSheet, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack } from "expo-router"
import { Colors } from "../../constants/Colors"

export default function AboutScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
            <Stack.Screen options={{ title: "Sobre Nosotros" }} />
            <ScrollView>
                <View style={styles.container}>
                    <Text style={[styles.h1, { color: themeColors.text }]}>Sobre Ayün Pet</Text>

                    <Text style={[styles.paragraph, { color: themeColors.text }]}>
                        Bienvenido a Ayün Pet, la plataforma dedicada a conectar mascotas que
                        necesitan un hogar con personas maravillosas dispuestas a brindarles amor y
                        cuidado.
                    </Text>

                    <Text style={[styles.paragraph, { color: themeColors.text }]}>
                        Nuestra misión es facilitar el proceso de adopción de manera segura,
                        transparente y compasiva, asegurando que cada mascota encuentre la familia
                        perfecta.
                    </Text>

                    <Text style={[styles.paragraph, { color: themeColors.text }]}>
                        Creemos que cada animal merece una segunda oportunidad. Gracias por ser
                        parte de este movimiento y ayudar a cambiar vidas, una patita a la vez.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 16,
        gap: 12,
    },
    h1: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: "justify",
    },
})
