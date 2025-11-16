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
                    <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 24 }]}>
                        Preguntas para Dadores
                    </Text>

                    <FaqItem
                        question="¿Cómo puedo publicar una mascota en adopción?"
                        answer="Como dador verificado, puedes publicar mascotas desde tu dashboard. 
                        Presiona el botón '+' en la parte inferior, completa el formulario con los 
                        datos de la mascota (nombre, edad, descripción, fotos, etc.) y publícala. 
                        Tu publicación será visible para todos los usuarios interesados en adoptar."
                    />

                    <FaqItem
                        question="¿Cómo gestiono las solicitudes de adopción?"
                        answer="Recibirás notificaciones cuando alguien solicite adoptar una de tus 
                        mascotas. Puedes revisar todas las solicitudes en la sección 'Solicitudes' 
                        de tu perfil. Allí podrás ver los formularios completados por los interesados, 
                        aprobar o rechazar solicitudes, y comunicarte con los adoptantes potenciales."
                    />

                    <FaqItem
                        question="¿Puedo editar o eliminar una publicación?"
                        answer="Sí, puedes editar o eliminar tus publicaciones en cualquier momento 
                        desde 'Mis Publicaciones'. Si una mascota ya fue adoptada, te recomendamos 
                        eliminar o marcar la publicación como adoptada para mantener la información 
                        actualizada."
                    />

                    <FaqItem
                        question="¿Qué información debo incluir en una publicación?"
                        answer="Es importante incluir: nombre de la mascota, edad, especie (perro/gato), 
                        raza, tamaño, descripción de su personalidad y necesidades especiales si las tiene. 
                        También puedes agregar fotos claras y de buena calidad. Cuanta más información 
                        proporciones, más fácil será encontrar el hogar perfecto."
                    />

                    <FaqItem
                        question="¿Cómo verifico que un adoptante es adecuado?"
                        answer="Revisa cuidadosamente el formulario de adopción que completa cada interesado. 
                        Contiene información sobre su hogar, experiencia con mascotas, disponibilidad y 
                        compromiso. Puedes hacer preguntas adicionales antes de aprobar la adopción y, 
                        si es posible, realizar una visita al hogar del adoptante."
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
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
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
