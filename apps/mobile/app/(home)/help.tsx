import React, { useState } from "react"
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack } from "expo-router"
import { ChevronDown } from "lucide-react-native"
import { Colors } from "../../constants/Colors"

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [open, setOpen] = useState(false)
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    const borderColor = themeColors.tabIconDefault

    return (
        <View style={[styles.faqItem, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setOpen(!open)}
                activeOpacity={0.7}
            >
                <Text style={[styles.question, { color: themeColors.text }]}>{question}</Text>
                <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
                    <ChevronDown size={20} color={themeColors.text} />
                </View>
            </TouchableOpacity>

            {open && (
                <View style={styles.content}>
                    <Text style={[styles.answer, { color: themeColors.text }]}>{answer}</Text>
                </View>
            )}
        </View>
    )
}

export default function HelpScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
            <Stack.Screen options={{ title: "Ayuda y Preguntas Frecuentes" }} />
            <ScrollView>
                <View style={styles.container}>
                    <Text style={[styles.h1, { color: themeColors.text }]}>
                        Preguntas Frecuentes (FAQ)
                    </Text>

                    <FaqItem
                        question="¿Cómo puedo adoptar una mascota?"
                        answer="Para adoptar, simplemente navega por las publicaciones, encuentra una 
                        mascota que te interese y presiona el botón 'Ver información'. Esto te llevará 
                        a los detalles de la mascota. Luego, presiona el botón 'Solicitar adopción' 
                        para hacer tu solicitud de adopción. Debes completar un formulario y el 
                        donante (persona o refugio) se comunicará contigo"
                    />

                    <FaqItem
                        question="¿Tiene algún costo adoptar?"
                        answer="Ayün Pet no cobra ninguna tarifa por la adopción. 
                        Sin embargo, algunos refugios o dadores pueden solicitar 
                        una tarifa de adopción simbólica para cubrir gastos 
                        veterinarios (vacunas, esterilización, etc.). Esto se 
                        especifica en cada publicación."
                    />

                    <FaqItem
                        question="¿Qué es un 'Dador' (Giver)?"
                        answer="Un 'Dador' puede ser un refugio de animales verificado, 
                        una organización de rescate o un usuario particular 
                        (rol 'Giver') que ha sido validado por nuestros 
                        administradores para asegurar que las adopciones 
                        sean seguras y responsables."
                    />
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
    },
    h1: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },
    faqItem: {
        borderBottomWidth: 1,
        marginBottom: 8,
    },
    trigger: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    question: {
        fontWeight: "bold",
        fontSize: 16,
        flex: 1,
        marginRight: 8,
    },
    content: {
        paddingBottom: 12,
        paddingTop: 4,
    },
    answer: {
        fontSize: 15,
        lineHeight: 21,
        textAlign: "justify",
    },
})
