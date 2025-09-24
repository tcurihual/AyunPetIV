import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PetFormSchema } from "@/utils/schemas"; 
import { PetFormType } from "@/utils/types"; 
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddPetScreen = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PetFormType>({
    resolver: zodResolver(PetFormSchema),
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Se necesita permiso para acceder a la galería.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setPhoto(imageUri);
    } else {
      Alert.alert("Sin selección", "No se seleccionó ninguna imagen.");
    }
  };

  const onSubmit = (data: PetFormType) => {
    console.log("Datos de la mascota:", data);
    if (photo) {
      router.push("/"); 
    } else {
      Alert.alert("Error", "Por favor, selecciona una foto para la mascota.");
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.formContainer}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Publicar Mascota</Text>
        </View>
          <View style={styles.form}>
            <Text style={styles.label}>Nombre</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Nombre de la mascota"
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            <Text style={styles.label}>Edad</Text>
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={String(value)}
                  onChangeText={(text) => onChange(Number(text))}
                  placeholder="Edad"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}

            <Text style={styles.label}>Especie</Text>
            <Controller
              control={control}
              name="species"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Especie (Dog o Cat)"
                />
              )}
            />
            {errors.species && <Text style={styles.errorText}>{errors.species.message}</Text>}

            <Text style={styles.label}>Género</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Género (Male o Female)"
                />
              )}
            />
            {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}

            <Text style={styles.label}>Tamaño</Text>
            <Controller
              control={control}
              name="size"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tamaño (Small, Medium, Large)"
                />
              )}
            />
            {errors.size && <Text style={styles.errorText}>{errors.size.message}</Text>}

            <Text style={styles.label}>Esterilizado</Text>
            <Controller
              control={control}
              name="sterilized"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={String(value)}
                  onChangeText={(text) => onChange(text === "true")}
                  placeholder="Esterilizado (true o false)"
                />
              )}
            />
            {errors.sterilized && <Text style={styles.errorText}>{errors.sterilized.message}</Text>}

            <View style={styles.buttonContainer}>
              <Button title="Seleccionar Foto" onPress={pickImage} color="#9C27B0" />
            </View>

            {photo && <Image source={{ uri: photo }} style={styles.image} />}

            <View style={styles.submitButtonContainer}>
              <Button
                title="Publicar Mascota"
                onPress={handleSubmit(onSubmit)}
                color="#F9C80E"
              />
            </View>
          </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9C80E",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  formContainer: {
    flexGrow: 1, 
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#9C27B0",
    borderRadius: 8,
  },
  submitButtonContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F9C80E",
    borderRadius: 8,
  },
});

export default AddPetScreen;