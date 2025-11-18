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
import { Camera } from "expo-camera"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useTheme } from "@/context/ThemeContext"

type PetFormInput = z.input<typeof PetFormSchema>
type PetFormOutput = z.output<typeof PetFormSchema>

const AddPetScreen = () => {
    const router = useRouter()
    const [photo, setPhoto] = useState<string | null>(null)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])
    const { createPublication } = usePublications()
    const { create: createPostForm } = usePostFormContext()
    const { width, height } = Dimensions.get("window")
    const { theme } = useTheme()
    
    // Theme colors
    const bgColor = useThemeColor({}, 'background')
    const cardColor = useThemeColor({}, 'card')
    const textColor = useThemeColor({}, 'text')
    const textSecondaryColor = useThemeColor({}, 'textSecondary')
    const textMutedColor = useThemeColor({}, 'textMuted')
    const borderColor = useThemeColor({}, 'border')
    const tintColor = useThemeColor({}, 'tint')
    
    // Para el Picker: usamos gris oscuro que se vea en ambos fondos
    const pickerItemColor = '#333333'
    
    const styles = getResponsiveStyles(width, height, bgColor, cardColor, textColor, textSecondaryColor, textMutedColor, borderColor, tintColor)

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
            age_years: 0,
            age_months: 0,
            sterilized: false,
            description: "",
        } as PetFormInput,
        mode: "onTouched",
    })

    const pickImage = async () => {
        Alert.alert("Seleccionar imagen", "Elige una opción", [
            {
                text: "Tomar foto",
                onPress: async () => {
                    const { status } = await Camera.requestCameraPermissionsAsync()
                    if (status !== "granted") {
                        Alert.alert("Error", "Se necesita permiso para acceder a la cámara.")
                        return
                    }

                    const result = await ImagePicker.launchCameraAsync({
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.9,
                    })

                    if (!result.canceled && result.assets?.length) {
                        setPhoto(result.assets[0].uri)
                    } else {
                        Alert.alert("Sin captura", "No se tomó ninguna foto.")
                    }
                },
            },
            {
                text: "Elegir de galería",
                onPress: async () => {
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

                    if (!result.canceled && result.assets?.length) {
                        setPhoto(result.assets[0].uri)
                    } else {
                        Alert.alert("Sin selección", "No se seleccionó ninguna imagen.")
                    }
                },
            },
            { text: "Cancelar", style: "cancel" },
        ])
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
                    age_years: data.age_years,
                    age_months: data.age_months,
                    size: data.size,
                    sterilized: data.sterilized,
                },
                post: {
                    title: `${data.name} en adopción`,
                    description:
                        data.description ||
                        `${data.name} está buscando un nuevo hogar. Publicado desde la app.`,
                },
                images: imageAsset,
            }

            const newPost = await createPublication(payload as any)
            console.log("📝 Publicación creada:", newPost)
            console.log("📝 Post completo:", JSON.stringify(newPost, null, 2))

            // El API retorna { post, pet, images }
            const postId = newPost.post?.id
            const petId = newPost.pet?.id

            console.log("📝 Post ID:", postId)
            console.log("📝 Pet ID:", petId)

            // 3) Guardar post_form (asociar preguntas seleccionadas a la publicación)
            if (selectedQuestionIds.length > 0 && postId) {
                try {
                    console.log(
                        `📋 Asociando ${selectedQuestionIds.length} preguntas al post ${postId}`
                    )
                    for (const questionId of selectedQuestionIds) {
                        console.log(`   → Asociando pregunta ${questionId}...`)
                        await createPostForm({
                            post_id: postId,
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
                id: String(petId ?? Date.now()),
                ownerName,
                name: data.name,
                gender: translateGenderToSpanish(data.gender),
                ageYears: data.age_years,
                ageMonths: data.age_months,
                species: translateSpeciesToSpanish(data.species) ?? "Otro",
                description: "",
                imageUrls: [], // las URLs de media se resuelven luego desde el servicio Media cuando se consulten
                createdAt: new Date().toISOString(),
            }
            await addLocalPet(petLocal)

            // Navegar a la pantalla de éxito con los datos de la publicación
            router.replace({
                pathname: "/(shelter)/publication-success",
                params: {
                    petName: data.name,
                    postId: String(postId ?? ""),
                    petId: String(petId ?? ""),
                },
            })
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
                                        placeholderTextColor={textMutedColor}
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
                            <View style={styles.ageContainer}>
                                <View style={styles.ageInput}>
                                    <Text style={styles.ageLabel}>Años</Text>
                                    <Controller
                                        control={control}
                                        name="age_years"
                                        render={({ field: { onChange, value, onBlur } }) => (
                                            <TextInput
                                                style={styles.input}
                                                value={(value as number) > 0 ? String(value) : ""}
                                                onChangeText={(txt) => {
                                                    const numericValue = txt.replace(/[^\d]/g, "")
                                                    onChange(numericValue ? parseInt(numericValue, 10) : 0)
                                                }}
                                                onBlur={onBlur}
                                                placeholder="0"
                                                placeholderTextColor={textMutedColor}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={styles.ageInput}>
                                    <Text style={styles.ageLabel}>Meses</Text>
                                    <Controller
                                        control={control}
                                        name="age_months"
                                        render={({ field: { onChange, value, onBlur } }) => (
                                            <TextInput
                                                style={styles.input}
                                                value={(value as number) > 0 ? String(value) : ""}
                                                onChangeText={(txt) => {
                                                    const numericValue = txt.replace(/[^\d]/g, "")
                                                    onChange(numericValue ? parseInt(numericValue, 10) : 0)
                                                }}
                                                onBlur={onBlur}
                                                placeholder="0"
                                                placeholderTextColor={textMutedColor}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                            />
                                        )}
                                    />
                                </View>
                            </View>
                            {errors.age_years && (
                                <Text style={styles.errorText}>{String(errors.age_years.message)}</Text>
                            )}
                            {errors.age_months && (
                                <Text style={styles.errorText}>{String(errors.age_months.message)}</Text>
                            )}

                            <Text style={styles.label}>Especie</Text>
                            <Controller
                                control={control}
                                name="species"
                                render={({ field: { onChange, value } }) => (
                                    <View style={styles.pickerWrapper}>
                                        <Picker 
                                            selectedValue={value} 
                                            onValueChange={onChange}
                                            style={{ color: textColor }}
                                            dropdownIconColor={textColor}
                                        >
                                            {SpeciesTranslations.options.map((option) => (
                                                <Picker.Item
                                                    key={option.value}
                                                    label={option.label}
                                                    value={option.value}
                                                    color={pickerItemColor}
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
                                        <Picker 
                                            selectedValue={value} 
                                            onValueChange={onChange}
                                            style={{ color: textColor }}
                                            dropdownIconColor={textColor}
                                        >
                                            {GenderTranslations.options.map((option) => (
                                                <Picker.Item
                                                    key={option.value}
                                                    label={option.label}
                                                    value={option.value}
                                                    color={pickerItemColor}
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
                                        <Picker 
                                            selectedValue={value} 
                                            onValueChange={onChange}
                                            style={{ color: textColor }}
                                            dropdownIconColor={textColor}
                                        >
                                            {SizeTranslations.options.map((option) => (
                                                <Picker.Item
                                                    key={option.value}
                                                    label={option.label}
                                                    value={option.value}
                                                    color={pickerItemColor}
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

                            <Text style={styles.label}>Descripción</Text>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={String(value ?? "")}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholder="Describe a la mascota, su personalidad, comportamiento..."
                                        placeholderTextColor={textMutedColor}
                                        multiline
                                        numberOfLines={6}
                                        textAlignVertical="top"
                                        maxLength={500}
                                    />
                                )}
                            />
                            {errors.description && (
                                <Text style={styles.errorText}>
                                    {String(errors.description.message)}
                                </Text>
                            )}

                            <QuestionSelector
                                selectedIds={selectedQuestionIds}
                                onSelectionChange={setSelectedQuestionIds}
                                disabled={isSubmitting}
                            />


                            <TouchableOpacity
                                style={[styles.photoButton, { flex: 1, marginLeft: 6 }]}
                                onPress={pickImage}
                            >
                                <Ionicons name="image-outline" size={20} color={Colors.secondary} />
                                <Text style={styles.photoButtonText}>Galería</Text>
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

const getResponsiveStyles = (
    width: number, 
    height: number,
    bgColor: string,
    cardColor: string,
    textColor: string,
    textSecondaryColor: string,
    textMutedColor: string,
    borderColor: string,
    tintColor: string
) => {
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
            backgroundColor: bgColor,
        },
        scrollContainer: {
            flex: 1,
            backgroundColor: bgColor,
        },
        cardWrapper: {
            padding: containerPadding,
        },
        cardContainer: {
            backgroundColor: cardColor,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            overflow: "hidden",
            marginBottom: 20,
        },
        header: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: headerPadding,
            paddingHorizontal: 16,
            backgroundColor: tintColor,
            marginTop: 0,
            marginBottom: 0,
        },
        headerTitle: {
            fontSize: titleSize,
            fontWeight: "600",
            color: "#000",
            textAlign: "center",
        },
        formContent: {
            backgroundColor: cardColor,
            paddingHorizontal: formPadding,
            paddingVertical: formPadding,
            borderRadius: 16,
        },
        label: {
            fontSize: fontSize,
            fontWeight: "500",
            color: textColor,
            marginBottom: 8,
        },
        labelInline: {
            fontSize: fontSize,
            fontWeight: "500",
            color: textColor,
        },
        ageContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 15,
        },
        ageInput: {
            flex: 1,
        },
        ageLabel: {
            fontSize: fontSize - 2,
            fontWeight: "500",
            color: textMutedColor,
            marginBottom: 4,
        },
        input: {
            width: "100%",
            height: inputHeight,
            backgroundColor: cardColor,
            borderRadius: 12,
            paddingHorizontal: 15,
            marginBottom: 15,
            fontSize: fontSize,
            borderWidth: 1,
            borderColor: borderColor,
            color: textColor,
        },
        textArea: {
            height: 120,
            paddingTop: 12,
            textAlignVertical: "top",
        },
        pickerWrapper: {
            marginBottom: 15,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: cardColor,
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
            color: Colors.danger,
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
            backgroundColor: cardColor,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: borderColor,
            gap: 8,
            marginBottom: 20,
        },
        photoButtonText: {
            color: textMutedColor,
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
            backgroundColor: tintColor,
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
            backgroundColor: borderColor,
        },
        submitButtonText: {
            color: "#000",
            fontWeight: "600",
            fontSize: fontSize,
        },
    })
}

export default AddPetScreen
