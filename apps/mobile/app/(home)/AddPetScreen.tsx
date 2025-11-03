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
import { usePublications } from "@/context/PublicationContext"
import { addLocalPet, LocalPet } from "@/services/petStorage"
import {
    SpeciesTranslations,
    GenderTranslations,
    SizeTranslations,
    translateSpeciesToSpanish,
    translateGenderToSpanish,
    translateSizeToSpanish,
} from "@/utils/petTranslations"
import { Colors } from "@/constants/Colors"
import { QuestionSelector } from "@/components/common/QuestionSelector"
import { usePostFormContext } from "@/context/PostFormContext"

type PetFormInput = z.input<typeof PetFormSchema>
type PetFormOutput = z.output<typeof PetFormSchema>

const AddPetScreen = () => {
    const router = useRouter()
    const [photo, setPhoto] = useState<string | null>(null)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])
    const { createPublication } = usePublications()
    const { create: createPostForm } = usePostFormContext()
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

            // 1) Resolver nombre del publicador desde los mocks
            const owner = (ayunData.users ?? []).find((u) => u.id === data.ownerId)
            const ownerName = owner?.name ?? owner?.email ?? "Fundación Demo"

            // 2) Crear publicación vía API; el PublicationContext se encargará de subir
            //    las imágenes al microservicio Media usando el id que retorne la BD.
            const imageAsset = [
                { uri: photo, fileName: `pet-${Date.now()}.jpg`, mimeType: "image/jpeg" } as any,
            ]

            const payload = {
                pet: {
                    species: data.species,
                    name: data.name,
                    gender: data.gender,
                    age: data.age,
                    size: data.size,
                    sterilized: data.sterilized,
                },
                post: {
                    title: `${data.name} en adopción`,
                    // El backend requiere description no vacío. Generamos una descripción por defecto.
                    description: `${data.name} está buscando un nuevo hogar. Publicado desde la app.`,
                },
                images: imageAsset,
            }

            const newPost = await createPublication(payload as any)
            console.log("📝 Publicación creada:", newPost)
            console.log("📝 Post ID:", newPost.id)

            // 3) Guardar post_form (asociar preguntas seleccionadas a la publicación)
            if (selectedQuestionIds.length > 0) {
                try {
                    console.log(
                        `📋 Asociando ${selectedQuestionIds.length} preguntas al post ${newPost.id}`
                    )
                    for (const questionId of selectedQuestionIds) {
                        console.log(`   → Asociando pregunta ${questionId}...`)
                        await createPostForm({
                            post_id: newPost.id,
                            question_id: questionId,
                        })
                        console.log(`   ✅ Pregunta ${questionId} asociada`)
                    }
                    console.log(
                        `✅ ${selectedQuestionIds.length} preguntas asociadas a la publicación`
                    )
                } catch (error) {
                    console.error("⚠️ Error al asociar preguntas:", error)
                    console.error("⚠️ Error completo:", JSON.stringify(error, null, 2))
                    // No bloqueamos la creación de la publicación si falla esto
                }
            }

            // 4) Guardar publicación local (AsyncStorage) como referencia rápida en mobile
            const petLocal: LocalPet = {
                id: String(newPost.pet.id ?? Date.now()),
                ownerName,
                name: data.name,
                gender: translateGenderToSpanish(data.gender),
                ageYears: data.age,
                species: translateSpeciesToSpanish(data.species) ?? "Otro",
                description: "",
                imageUrls: [], // las URLs de media se resuelven luego desde el servicio Media cuando se consulten
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nueva Mascota</Text>
            </View>
            <KeyboardAwareScrollView
                style={styles.scrollContainer}
                scrollEnabled={true}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20}
                keyboardOpeningTime={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cardWrapper}>
                    <View style={styles.cardContainer}>
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
                                        returnKeyType="next"
                                        blurOnSubmit={false}
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
                                        maxLength={2}
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
                                <Text style={styles.errorText}>
                                    {String(errors.species.message)}
                                </Text>
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
                                <Text style={styles.errorText}>
                                    {String(errors.gender.message)}
                                </Text>
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

                            <QuestionSelector
                                selectedIds={selectedQuestionIds}
                                onSelectionChange={setSelectedQuestionIds}
                                disabled={isSubmitting}
                            />

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
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

const getResponsiveStyles = (width: number, height: number) => {
    const isSmallScreen = width < 350
    const isMediumScreen = width >= 350 && width < 400
    const isTablet = width >= 768

    const containerPadding = 20
    const headerPadding = isTablet ? 24 : 20
    const formPadding = isTablet ? 28 : 20
    const inputHeight = Math.max(height * 0.06, isSmallScreen ? 42 : 45)
    const buttonHeight = Math.max(height * 0.06, isSmallScreen ? 48 : 50)
    const imageSize = isTablet ? 250 : isSmallScreen ? 180 : 200
    const fontSize = isSmallScreen ? 14 : 16
    const titleSize = isTablet ? 24 : isSmallScreen ? 18 : 20

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#f5f5f5",
        },
        scrollContainer: {
            flex: 1,
            backgroundColor: "#f5f5f5",
        },
        cardWrapper: {
            padding: containerPadding,
        },
        cardContainer: {
            backgroundColor: "#fff",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            overflow: "hidden",
            marginBottom: 20, // Espacio para que se vean las sombras
        },
        header: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: headerPadding,
            paddingHorizontal: 16,
            backgroundColor: `${Colors.yellow}`,
            marginTop: 0,
            marginBottom: 0,
        },
        headerTitle: {
            fontSize: titleSize,
            fontWeight: "600",
            color: "#222",
            textAlign: "center",
        },
        formContent: {
            backgroundColor: "#fff",
            paddingHorizontal: formPadding,
            paddingVertical: formPadding,
            borderRadius: 16,
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
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#A47CF3",
            gap: 8,
            marginBottom: 20,
        },
        photoButtonText: {
            color: "#666",
            fontSize: 14,
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
            backgroundColor: `${Colors.yellow}`,
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
