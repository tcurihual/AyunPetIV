import { StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/ui/Input";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const pwd = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      // TODO: aquí va la llamada real a la API
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ email: data.email, name: data.name, loggedAt: Date.now() })
      );
      router.replace("/(home)");
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la cuenta.");
    }
  };

  return (
    <ThemedView style={styles.container} lightColor="#fff">
      <View style={styles.header}>
        <ThemedText type="title">Crear cuenta</ThemedText>
        <ThemedText type="subtitle">Únete a AyunPet 🐾</ThemedText>
      </View>

      <Input<RegisterForm>
        name="name"
        control={control}
        label="Nombre"
        placeholder="Tu nombre"
        type="text"
        rules={{ required: "El nombre es obligatorio" }}
      />

      <Input<RegisterForm>
        name="email"
        control={control}
        label="Correo electrónico"
        placeholder="ejemplo@mail.com"
        type="email"
        rules={{
          required: "El correo es obligatorio",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Formato de correo inválido",
          },
        }}
      />

      <Input<RegisterForm>
        name="password"
        control={control}
        label="Contraseña"
        placeholder="••••••••"
        type="password"
        rules={{
          required: "La contraseña es obligatoria",
          minLength: { value: 6, message: "Mínimo 6 caracteres" },
        }}
      />

      <Input<RegisterForm>
        name="confirmPassword"
        control={control}
        label="Confirmar contraseña"
        placeholder="••••••••"
        type="password"
        rules={{
          required: "Confirma tu contraseña",
          validate: (v) => v === pwd || "Las contraseñas no coinciden",
        }}
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          {isSubmitting ? "Creando cuenta..." : "Registrarme"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace("/(auth)/login")}>
        <ThemedText type="defaultSemiBold" style={styles.secondaryText}>
          Ya tengo cuenta, iniciar sesión
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  header: { marginBottom: 24, gap: 6 },
  button: { marginTop: 16, backgroundColor: "#0a7ea4", paddingVertical: 14, borderRadius: 12 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", textAlign: "center" },
  secondaryBtn: { marginTop: 12, paddingVertical: 12 },
  secondaryText: { textAlign: "center", color: "#0a7ea4" },
});
