import React, { useState } from "react"
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Input from "../../components/ui/Input"
import { RegisterFormSchema } from "@/utils/schemas"
import { z } from "zod"
import { useAuthContext } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useLoading } from "@/context/LoadingContext"

const { width } = Dimensions.get("window")
type RegisterForm = z.infer<typeof RegisterFormSchema>

const steps: { title: string; fields: (keyof RegisterForm)[] }[] = [
  { title: "Nombre y RUT", fields: ["name", "rut"] },
  { title: "Contraseña", fields: ["password", "verifyPassword"] },
  { title: "Datos de Contacto", fields: ["email", "phone"] },
]

export default function RegisterScreen() {
  const router = useRouter()
  const styles = useThemeStyles()
  const [step, setStep] = useState(0)

  const { signUp, status } = useAuthContext()
  const { showAlert } = useAlert()
  const { withLoading } = useLoading()

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      rut: "",
      password: "",
      verifyPassword: "",
      email: "",
      phone: "",
    },
  })

  const onNext = async () => {
    const ok = await trigger(steps[step].fields as any)
    if (!ok) return
    if (step < steps.length - 1) setStep((s) => s + 1)
  }

  const onBack = () => {
    if (step > 0) setStep((s) => s - 1)
    else router.back()
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      await withLoading(async () => {
        await signUp({
          name: data.name,
          email: data.email,
          password: data.password,
        })
        showAlert("Registro exitoso. Redirigiendo…", "success")
        router.replace("/(home)/IntermediateView")
      })
    } catch (e: any) {
      const msg =
        typeof e?.message === "string" ? e.message : "No se pudo registrar la cuenta"
      showAlert(msg, "error")
    }
  }

  const disabled = isSubmitting || status === "loading"

  const renderFields = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Input<RegisterForm>
              name="name"
              control={control}
              label="Nombre completo"
              placeholder="Juan Pérez"
            />
            <Input<RegisterForm>
              name="rut"
              control={control}
              label="RUT"
              placeholder="12.345.678-9"
            />
          </>
        )
      case 1:
        return (
          <>
            <Input<RegisterForm>
              name="password"
              control={control}
              label="Contraseña"
              placeholder="••••••••"
              type="password"
            />
            <Input<RegisterForm>
              name="verifyPassword"
              control={control}
              label="Repetir contraseña"
              placeholder="••••••••"
              type="password"
            />
          </>
        )
      case 2:
      default:
        return (
          <>
            <Input<RegisterForm>
              name="email"
              control={control}
              label="Correo electrónico"
              placeholder="correo@dominio.com"
              type="email"
            />
            <Input<RegisterForm>
              name="phone"
              control={control}
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              inputProps={{ keyboardType: "phone-pad" }}
            />
          </>
        )
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Datos de Registro</Text>
          <View style={styles.semiCircle} />
          <Image
            source={require("@images/ayun-pet.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.stepIndicator}>
          <Text style={styles.stepCircle}>{`${step + 1}/3`}</Text>
          <Text style={styles.stepTitle}>{steps[step].title}</Text>
        </View>

        {renderFields()}

        {step < steps.length - 1 ? (
          <TouchableOpacity style={[styles.button]} onPress={onNext} disabled={disabled}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button]}
            onPress={handleSubmit(onSubmit)}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>
              {disabled ? "Creando..." : "Crear Cuenta"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const useThemeStyles = () => {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
    },
    container: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 0,
      paddingHorizontal: 16,
      minHeight: Dimensions.get("window").height,
    },
    backButton: {
      position: "absolute",
      top: 24,
      left: 16,
      zIndex: 1,
    },
    header: {
      backgroundColor: "#FFD24C",
      width: "110%",
      height: "20%",
      alignItems: "center",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      paddingBottom: 24,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: width < 350 ? 16 : 20,
      fontWeight: "bold",
      marginTop: 40,
      marginBottom: 0,
      color: "#222",
    },
    logo: {
      width: width * 0.45,
      height: width * 0.38,
      top: 0,
    },
    semiCircle: {
      position: "absolute",
      bottom: -40,
      width: "35%",
      height: "60%",
      backgroundColor: "#fff",
      borderTopLeftRadius: 60,
      borderTopRightRadius: 60,
      alignSelf: "center",
      zIndex: 0,
    },
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
      marginTop: 80,
      width: "90%",
    },
    stepCircle: {
      borderWidth: 2,
      borderColor: "#A47CF3",
      borderRadius: 20,
      width: 40,
      height: 40,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: 18,
      color: "#A47CF3",
      marginRight: 12,
      fontWeight: "bold",
      backgroundColor: "#ffffffff",
      paddingTop: 5,
    },
    stepTitle: {
      fontSize: width < 350 ? 15 : 18,
      fontWeight: "bold",
      color: "#222",
    },
    input: {
      width: "90%",
      minWidth: 220,
      maxWidth: 400,
      height: 40,
      backgroundColor: "#fff",
      borderRadius: 16,
      paddingHorizontal: 16,
      marginBottom: 12,
      fontSize: 15,
      borderWidth: 1,
      borderColor: "#A47CF3",
      color: "#222",
    },
    button: {
      width: "80%",
      minWidth: 180,
      maxWidth: 350,
      height: 40,
      backgroundColor: "#FFD24C",
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 18,
      elevation: 2,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "500",
      fontSize: 15,
    },
    secondaryButton: {
      width: "80%",
      minWidth: 180,
      maxWidth: 350,
      height: 40,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      borderWidth: 1,
      borderColor: "#FFD24C",
      backgroundColor: "#fff",
    },
    secondaryButtonText: {
      color: "#FFD24C",
      fontWeight: "500",
      fontSize: 15,
    },
  })
}