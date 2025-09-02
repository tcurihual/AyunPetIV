// app/auth/login.tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // Aquí irá la lógica real de login
    router.replace("/(home)");
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/image.png")} // usa tu propia imagen
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Inputs */}
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#7c3aed"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#7c3aed"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {/* Botón Iniciar Sesión */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Olvidaste contraseña */}
      <TouchableOpacity onPress={() => console.log("Recuperar contraseña")}>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Botón Registrarse */}
      <TouchableOpacity
        style={[styles.buttonPrimary, styles.buttonSecondary]}
        //onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#7c3aed", // morado
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  buttonPrimary: {
    backgroundColor: "#facc15", // amarillo
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonSecondary: {
    marginTop: 25,
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
});
