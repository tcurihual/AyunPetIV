import React, { useState } from "react"
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    Alert,
    Switch,
    TouchableOpacity,
    Dimensions,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PetFormSchema } from "@/utils/schemas"
import type { z } from "zod"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
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
    const { width, height } = Dimensions.get("window")
    const styles = getResponsiveStyles(width, height)

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
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            resetScrollToCoords={{ x: 0, y: 0 }}
            scrollEnabled={true}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardOpeningTime={250}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.cardContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Publicar Mascota</Text>
                    </View>

                    <View style={styles.formContent}>
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
                            <Text style={styles.errorText}>
                                {String(errors.sterilized.message)}
                            </Text>
                        )}

                        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={20} color="#A47CF3" />
                            <Text style={styles.photoButtonText}>Seleccionar Foto</Text>
                        </TouchableOpacity>

                        {photo && <Image source={{ uri: photo }} style={styles.image} />}

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? "Publicando..." : "Publicar Mascota"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAwareScrollView>
    )
}

const getResponsiveStyles = (width: number, height: number) => {
    const isSmallScreen = width < 350
    const isMediumScreen = width >= 350 && width < 400
    const isTablet = width >= 768

    // Responsive values
    const horizontalPadding = isTablet ? 32 : isSmallScreen ? 12 : 14
    const cardMargin = isTablet ? 24 : 16
    const headerPadding = isTablet ? 24 : 20
    const formPadding = isTablet ? 28 : 20
    const inputHeight = Math.max(height * 0.06, isSmallScreen ? 42 : 45)
    const buttonHeight = Math.max(height * 0.06, isSmallScreen ? 48 : 50)
    const imageSize = isTablet ? 250 : isSmallScreen ? 180 : 200
    const fontSize = isSmallScreen ? 14 : 16
    const titleSize = isTablet ? 24 : isSmallScreen ? 18 : 20

    return StyleSheet.create({
        scrollContainer: {
            flex: 1,
            backgroundColor: "#fff",
        },
        contentContainer: {
            flexGrow: 1,
        },
        container: {
            flex: 1,
            backgroundColor: "#f5f5f5",
            paddingHorizontal: horizontalPadding,
            paddingTop: cardMargin,
        },
        cardContainer: {
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 5,
            overflow: "hidden",
            marginBottom: cardMargin,
            marginHorizontal: 2,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: headerPadding,
            paddingHorizontal: 16,
            backgroundColor: "#FFD24C",
            marginTop: 0,
            marginHorizontal: 0,
        },
        headerTitle: {
            fontSize: titleSize,
            fontWeight: "600",
            color: "#222",
            textAlign: "center",
        },
        formContent: {
            flex: 1,
            backgroundColor: "#fff",
            paddingHorizontal: formPadding,
            paddingVertical: formPadding,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
        },
        label: {
            fontSize: fontSize,
            fontWeight: "500",
            color: "#333",
            marginBottom: 8,
        },
        labelInline: {
            fontSize: fontSize,
            fontWeight: "500",
            color: "#333",
        },
        input: {
            width: "100%",
            height: inputHeight,
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingHorizontal: 15,
            marginBottom: 15,
            fontSize: fontSize,
            borderWidth: 1,
            borderColor: "#A47CF3",
            color: "#222",
        },
        pickerWrapper: {
            marginBottom: 15,
            borderWidth: 1,
            borderColor: "#A47CF3",
            backgroundColor: "#fff",
            borderRadius: 12,
            overflow: "hidden",
        },
        switchRow: {
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 5,
        },
        errorText: {
            color: "#e74c3c",
            fontSize: isSmallScreen ? 11 : 12,
            marginBottom: 8,
            marginTop: -10,
        },
        photoButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            paddingHorizontal: 15,
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#A47CF3",
            gap: 8,
            marginBottom: 20,
        },
        photoButtonText: {
            color: "#A47CF3",
            fontSize: fontSize,
            fontWeight: "500",
        },
        image: {
            width: imageSize,
            height: imageSize,
            marginTop: 16,
            marginBottom: 20,
            borderRadius: 12,
            alignSelf: "center",
        },
        submitButton: {
            width: "100%",
            height: buttonHeight,
            backgroundColor: "#FFD24C",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            marginBottom: 30,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        submitButtonDisabled: {
            backgroundColor: "#E0E0E0",
        },
        submitButtonText: {
            color: "#222",
            fontWeight: "600",
            fontSize: fontSize,
        },
    })
}

export default AddPetScreen
