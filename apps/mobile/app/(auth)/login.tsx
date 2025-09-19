import React, { useState } from "react"
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView, 
    Dimensions 
} from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAlert } from "@/context/AlertContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormSchema } from "@/utils/schemas"
import Input from "../../components/ui/Input"
import { z } from "zod"

const { width } = Dimensions.get("window")

type LoginForm = z.infer<typeof LoginFormSchema>

export default function LoginScreen() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const { showAlert } = useAlert()
  
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setSubmitting(true)
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ email: data.email, loggedAt: Date.now() })
      )
      showAlert("Inicio de sesión exitoso, espere un momento", "success")      
      await new Promise((resolve) => setTimeout(resolve, 5000))
      router.replace("/(home)")
    } catch (e){
          showAlert("Error al iniciar sesión. Inténtalo de nuevo.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require("@images/image.png")} style={styles.logo} resizeMode="contain" />

        <Input<LoginForm>
          name="email"
          control={control}
          label="Correo"
          placeholder="correo@dominio.com"
          type="email"
        />

        <Input<LoginForm>
          name="password"
          control={control}
          label="Contraseña"
          placeholder="••••••••"
          type="password"
        />

        <TouchableOpacity
          style={[styles.buttonPrimary, (submitting || isSubmitting) && { opacity: 0.6 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting || isSubmitting}
        >
          <Text style={styles.buttonText}>
            {submitting || isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Recuperar contraseña")}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, styles.buttonSecondary]}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    minWidth: 220,
    maxWidth: 400,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#A47CF3",
    color: "#222",
  },
  buttonPrimary: {
    backgroundColor: "#facc15",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "90%",  // Tamaño ajustado de los botones
    alignItems: "center",
    marginTop: 20,  // Espacio entre el botón y los campos
  },
  buttonSecondary: {
    marginTop: 20,  // Espacio entre los botones
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    marginTop: 15,
    color: "#7c3aed",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 6,
  },
})