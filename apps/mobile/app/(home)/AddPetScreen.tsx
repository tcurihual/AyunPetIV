import React, { useState } from "react"
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, Switch } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PetFormSchema } from "@/utils/schemas"
import type { z } from "zod"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Picker } from "@react-native-picker/picker"
import ayunData from "@/data/mockData"
import { uploadMedia } from "@/services/media"
import { addLocalPet, LocalPet } from "@/services/petStorage"
import {
    SpeciesTranslations,
    GenderTranslations,
    SizeTranslations,
    translateSpeciesToSpanish,
    translateGenderToSpanish,
    translateSizeToSpanish,
} from "@/utils/petTranslations"

type PetFormInput = z.input<typeof PetFormSchema>
type PetFormOutput = z.output<typeof PetFormSchema>

const AddPetScreen = () => {
    const router = useRouter()
    const [photo, setPhoto] = useState<string | null>(null)
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PetFormInput>({
        resolver: zodResolver(PetFormSchema),
        defaultValues: {
            ownerId: 1,
            name: "",
            species: "Dog",
            gender: "Male",
            size: "Small",
            age: 0,
            sterilized: false,
        } as PetFormInput,
        mode: "onTouched",
    })

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            Alert.alert("Error", "Se necesita permiso para acceder a la galería.")
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        })
        if (!result.canceled && result.assets?.length) setPhoto(result.assets[0].uri)
        else Alert.alert("Sin selección", "No se seleccionó ninguna imagen.")
    }

    const onSubmit: SubmitHandler<PetFormInput> = async (raw) => {
        try {
            // Valida y coercea según tu schema
            const data: PetFormOutput = PetFormSchema.parse(raw)

            if (!photo) {
                Alert.alert("Error", "Por favor, selecciona una foto para la mascota.")
                return
            }

            // 1) ID local para la publicación (mock)
            const tempPetId = `${Date.now()}`

            // 2) Subir imagen a Media (armamos un "asset" mínimo)
            const fakeAsset = {
                uri: photo,
                fileName: `pet-${tempPetId}.jpg`,
                mimeType: "image/jpeg",
            } as any
            const uploaded = await uploadMedia("pet", tempPetId, [fakeAsset])

            // 3) Resolver nombre del publicador desde los mocks
            const owner = (ayunData.users ?? []).find((u) => u.id === data.ownerId)
            const ownerName = owner?.name ?? owner?.email ?? "Fundación Demo"

            // 4) Guardar publicación local (AsyncStorage)
            const petLocal: LocalPet = {
                id: tempPetId,
                ownerName,
                name: data.name,
                gender: translateGenderToSpanish(data.gender), // "Macho"/"Hembra"
                ageYears: data.age, // ya viene como number gracias a z.coerce
                species: translateSpeciesToSpanish(data.species) ?? "Otro",
                description: "", // tu schema no tiene descripción; dejamos vacío
                imageUrls: uploaded.map((u) => u.url), // ej: "/uploads/pet/:id/archivo.jpg"
                createdAt: new Date().toISOString(),
            }
            await addLocalPet(petLocal)

            Alert.alert("OK", "Mascota publicada correctamente")
            router.push("/")
        } catch (e: any) {
            console.error(e)
            Alert.alert("Error", e?.message ?? "No se pudo publicar la mascota")
        }
    }

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.formContainer}
            resetScrollToCoords={{ x: 0, y: 0 }}
            scrollEnabled
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Publicar Mascota</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Nombre</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <TextInput
                                style={styles.input}
                                value={String(value ?? "")}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                placeholder="Nombre de la mascota"
                                autoCapitalize="sentences"
                            />
                        )}
                    />
                    {errors.name && (
                        <Text style={styles.errorText}>{String(errors.name.message)}</Text>
                    )}

                    <Text style={styles.label}>Edad</Text>
                    <Controller
                        control={control}
                        name="age"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <TextInput
                                style={styles.input}
                                value={(value as number) > 0 ? String(value) : ""}
                                onChangeText={(txt) => {
                                    const numericValue = txt.replace(/[^\d]/g, "")
                                    onChange(numericValue ? parseInt(numericValue, 10) : 0)
                                }}
                                onBlur={onBlur}
                                placeholder="Edad en años (ej: 3)"
                                keyboardType="number-pad"
                            />
                        )}
                    />
                    {errors.age && (
                        <Text style={styles.errorText}>{String(errors.age.message)}</Text>
                    )}

                    <Text style={styles.label}>Especie</Text>
                    <Controller
                        control={control}
                        name="species"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.pickerWrapper}>
                                <Picker selectedValue={value} onValueChange={onChange}>
                                    {SpeciesTranslations.options.map((option) => (
                                        <Picker.Item
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    />
                    {errors.species && (
                        <Text style={styles.errorText}>{String(errors.species.message)}</Text>
                    )}

                    <Text style={styles.label}>Género</Text>
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.pickerWrapper}>
                                <Picker selectedValue={value} onValueChange={onChange}>
                                    {GenderTranslations.options.map((option) => (
                                        <Picker.Item
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    />
                    {errors.gender && (
                        <Text style={styles.errorText}>{String(errors.gender.message)}</Text>
                    )}

                    <Text style={styles.label}>Tamaño</Text>
                    <Controller
                        control={control}
                        name="size"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.pickerWrapper}>
                                <Picker selectedValue={value} onValueChange={onChange}>
                                    {SizeTranslations.options.map((option) => (
                                        <Picker.Item
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    />
                    {errors.size && (
                        <Text style={styles.errorText}>{String(errors.size.message)}</Text>
                    )}

                    <View style={styles.switchRow}>
                        <Text style={styles.labelInline}>Esterilizado</Text>
                        <Controller
                            control={control}
                            name="sterilized"
                            render={({ field: { onChange, value } }) => (
                                <Switch value={!!value} onValueChange={onChange} />
                            )}
                        />
                    </View>
                    {errors.sterilized && (
                        <Text style={styles.errorText}>{String(errors.sterilized.message)}</Text>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button title="Seleccionar Foto" onPress={pickImage} color="#9C27B0" />
                    </View>

                    {photo && <Image source={{ uri: photo }} style={styles.image} />}

                    <View style={styles.submitButtonContainer}>
                        <Button
                            title={isSubmitting ? "Publicando..." : "Publicar Mascota"}
                            onPress={handleSubmit(onSubmit)}
                            color="#F9C80E"
                            disabled={isSubmitting}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
        justifyContent: "space-between",
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
    labelInline: {
        fontSize: 16,
        color: "#000",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    pickerWrapper: {
        marginTop: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#ffffffff",
        justifyContent: "space-between",
    },
    switchRow: {
        marginTop: 4,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        marginBottom: 16,
        borderRadius: 8,
        alignSelf: "center",
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
})

export default AddPetScreen
