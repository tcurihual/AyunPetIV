import React, { useState } from "react"
import { ScrollView, Text, View, StyleSheet } from "react-native"
import { Checkbox } from "@/components/ui/Checkbox" 

export default function TermsAndConditions() {
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const isBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 10
    if (isBottom) setScrolledToEnd(true)
  }

  const handleCheck = () => {
    if (scrolledToEnd) setAccepted(!accepted)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones – Ayün Pet</Text>

      <ScrollView
        style={styles.scroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>1. Introducción{"\n"}</Text>
          El presente documento establece los{" "}
          <Text style={styles.bold}>Términos y Condiciones de uso</Text> de la
          plataforma <Text style={styles.bold}>Ayün Pet</Text>, una aplicación
          orientada a facilitar procesos de{" "}
          <Text style={styles.bold}>adopción responsable de mascotas</Text>{" "}
          entre usuarios y entidades colaboradoras. Al utilizar los servicios de
          Ayün Pet, el usuario declara haber leído, comprendido y aceptado todas
          las disposiciones aquí contenidas.{"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>2. Definiciones{"\n"}</Text>
          - <Text style={styles.bold}>Usuario adoptante:</Text> Persona que se
          registra para postular o adoptar mascotas.{"\n"}
          - <Text style={styles.bold}>Usuario dador:</Text> Persona o entidad
          que publica mascotas en búsqueda de adopción.{"\n"}
          - <Text style={styles.bold}>Plataforma:</Text> El conjunto de
          aplicaciones móviles, servicios web y bases de datos administrados por
          el equipo de Ayün Pet.{"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>3. Uso de la plataforma{"\n"}</Text>
          El usuario se compromete a utilizar la plataforma de forma
          responsable, veraz y conforme a la ley, absteniéndose de realizar
          publicaciones falsas o de carácter inapropiado. Ayün Pet se reserva el
          derecho de suspender o eliminar cuentas que incumplan estos términos.
          {"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>
            4. Tratamiento y almacenamiento de datos{"\n"}
          </Text>
          El usuario autoriza expresamente a{" "}
          <Text style={styles.bold}>Ayün Pet</Text> a almacenar, procesar y
          utilizar los datos personales y documentos que haya proporcionado,
          tales como el{" "}
          <Text style={styles.bold}>
            Registro Social de Hogares (RSH)
          </Text>
          , <Text style={styles.bold}>certificados de antecedentes</Text> y
          cualquier otro archivo necesario para validar la postulación o
          adopción. Estos datos serán tratados conforme a la{" "}
          <Text style={styles.bold}>
            Ley N°19.628 sobre Protección de la Vida Privada
          </Text>{" "}
          y solo serán utilizados para los fines propios del proceso de
          adopción.{"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>5. Responsabilidad del usuario{"\n"}</Text>
          El usuario declara que toda la información proporcionada en los
          formularios es fidedigna y actualizada, siendo responsable de
          cualquier falsedad u omisión que pueda afectar el proceso de adopción.
          {"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>
            6. Responsabilidad de Ayün Pet{"\n"}
          </Text>
          Ayün Pet actúa únicamente como{" "}
          <Text style={styles.bold}>intermediario tecnológico</Text> entre
          usuarios y entidades. No se responsabiliza de acuerdos, entregas o
          compromisos posteriores realizados fuera de la plataforma.{"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>7. Propiedad intelectual{"\n"}</Text>
          El diseño, logotipo y contenido de la plataforma son propiedad de Ayün
          Pet y no podrán ser reproducidos ni utilizados sin autorización
          expresa.{"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>8. Modificaciones de los términos{"\n"}</Text>
          Ayün Pet podrá modificar estos Términos y Condiciones en cualquier
          momento, notificando los cambios a través de la aplicación o correo
          electrónico registrado.{"\n\n"}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>9. Aceptación{"\n"}</Text>
          Al marcar la opción “He leído y acepto los Términos y Condiciones”, el
          usuario declara que ha leído íntegramente este documento y acepta
          todas sus cláusulas. La aceptación es requisito indispensable para
          continuar con el proceso de registro y uso de la plataforma.{"\n\n"}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Checkbox
          label="He leído y acepto los Términos y Condiciones"
          disabled={!scrolledToEnd}
          checked={accepted}
          onPress={handleCheck}
        />
        {!scrolledToEnd && (
          <Text style={styles.notice}>
            🔒 Debes leer hasta el final para habilitar esta opción.
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF", 
    marginBottom: 10,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: "#222222",
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#222222",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
    paddingTop: 10,
  },
  notice: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
})
