import React from "react"
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Platform,
    StatusBar,
    TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"

export default function TermsAndConditions() {
    const router = useRouter()

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor={Colors.light.textSecondary} barStyle="dark-content" />

            <View style={styles.container}>
                {/* 🔙 Botón para volver atrás */}
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButtonContainer}
                    >
                        <Text style={styles.backButton}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Términos y Condiciones – Ayün Pet</Text>
                </View>

                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={true}>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>1. Introducción{"\n"}</Text>
                        El presente documento establece los{" "}
                        <Text style={styles.bold}>Términos y Condiciones de uso</Text> de la
                        plataforma <Text style={styles.bold}>Ayün Pet</Text>, una aplicación
                        orientada a facilitar procesos de{" "}
                        <Text style={styles.bold}>adopción responsable de mascotas</Text> entre
                        usuarios y entidades colaboradoras. Al utilizar los servicios de Ayün Pet,
                        el usuario declara haber leído, comprendido y aceptado todas las
                        disposiciones aquí contenidas.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>2. Definiciones{"\n"}</Text>-{" "}
                        <Text style={styles.bold}>Usuario adoptante:</Text> Persona que se registra
                        para postular o adoptar mascotas.{"\n"}-{" "}
                        <Text style={styles.bold}>Usuario dador:</Text> Persona o entidad que
                        publica mascotas en búsqueda de adopción.{"\n"}-{" "}
                        <Text style={styles.bold}>Plataforma:</Text> El conjunto de aplicaciones
                        móviles, servicios web y bases de datos administrados por el equipo de Ayün
                        Pet.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>3. Uso de la plataforma{"\n"}</Text>
                        El usuario se compromete a utilizar la plataforma de forma responsable,
                        veraz y conforme a la ley, absteniéndose de realizar publicaciones falsas o
                        de carácter inapropiado. Ayün Pet se reserva el derecho de suspender o
                        eliminar cuentas que incumplan estos términos.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>
                            4. Tratamiento y almacenamiento de datos{"\n"}
                        </Text>
                        El usuario autoriza expresamente a <Text style={styles.bold}>Ayün Pet</Text>{" "}
                        a almacenar, procesar y utilizar los datos personales y documentos que haya
                        proporcionado, tales como el{" "}
                        <Text style={styles.bold}>Registro Social de Hogares (RSH)</Text>,{" "}
                        <Text style={styles.bold}>certificados de antecedentes</Text> y cualquier
                        otro archivo necesario para validar la postulación o adopción. Estos datos
                        serán tratados conforme a la{" "}
                        <Text style={styles.bold}>
                            Ley N°19.628 sobre Protección de la Vida Privada
                        </Text>{" "}
                        y solo serán utilizados para los fines propios del proceso de adopción.
                        {"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>5. Responsabilidad del usuario{"\n"}</Text>
                        El usuario declara que toda la información proporcionada en los formularios
                        es fidedigna y actualizada, siendo responsable de cualquier falsedad u
                        omisión que pueda afectar el proceso de adopción.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>6. Responsabilidad de Ayün Pet{"\n"}</Text>
                        Ayün Pet actúa únicamente como{" "}
                        <Text style={styles.bold}>intermediario tecnológico</Text> entre usuarios y
                        entidades. No se responsabiliza de acuerdos, entregas o compromisos
                        posteriores realizados fuera de la plataforma.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>7. Propiedad intelectual{"\n"}</Text>
                        El diseño, logotipo y contenido de la plataforma son propiedad de Ayün Pet y
                        no podrán ser reproducidos ni utilizados sin autorización expresa.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>8. Modificaciones de los términos{"\n"}</Text>
                        Ayün Pet podrá modificar estos Términos y Condiciones en cualquier momento,
                        notificando los cambios a través de la aplicación o correo electrónico
                        registrado.{"\n\n"}
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>9. Aceptación{"\n"}</Text>
                        Al marcar la opción “He leído y acepto los Términos y Condiciones”, el
                        usuario declara que ha leído íntegramente este documento y acepta todas sus
                        cláusulas. La aceptación es requisito indispensable para continuar con el
                        proceso de registro y uso de la plataforma.{"\n\n"}
                    </Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.textSecondary,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.light.textSecondary,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backButtonContainer: {
        padding: 4,
        marginRight: 6,
    },
    backButton: {
        fontSize: 24,
        color: Colors.secondary,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: Colors.secondary,
        textAlign: "center",
    },
    scroll: {
        flex: 1,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        color: Colors.dark.text,
        lineHeight: 22,
        marginBottom: 10,
    },
    bold: {
        fontWeight: "bold",
        color: Colors.dark.text,
    },
})
