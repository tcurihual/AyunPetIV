import React, { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    Image,
    Modal,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { usePublicationContext } from "@/context/PublicationContext"
import * as ImagePicker from "expo-image-picker"
import { Colors } from "@/constants/Colors"

type PetFormData = {
    name: string
    species: string
    gender: string
    age: number
    size: string
    description: string
    sterilized: boolean
}

export default function EditPublication() {
    const { postId, petId } = useLocalSearchParams<{ postId: string; petId: string }>()
    const { user } = useAuthContext()
    const { publications, getPublicationByPostId, updatePublication } = usePublicationContext()
    const router = useRouter()

    const [formData, setFormData] = useState<PetFormData>({
        name: "",
        species: "dog",
        gender: "male",
        age: 1,
        size: "medium",
        description: "",
        sterilized: false,
    })

    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [newImage, setNewImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
    const newImageRef = useRef<ImagePicker.ImagePickerAsset | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showSpeciesModal, setShowSpeciesModal] = useState(false)
    const [showGenderModal, setShowGenderModal] = useState(false)
    const [showSizeModal, setShowSizeModal] = useState(false)

    useEffect(() => {
        loadPublicationData()
    }, [postId, user?.id])

    const loadPublicationData = async () => {
        if (!postId) {
            Alert.alert("Error", "No se proporcionó un ID de publicación")
            router.back()
            return
        }

        try {
            setLoading(true)
            const publication = await getPublicationByPostId(Number(postId))

            if (!publication) {
                Alert.alert("Error", "No se encontró la publicación")
                router.back()
                return
            }

            // Verificar que el usuario sea el dueño
            if (Number(publication.creatorId) !== Number(user?.id)) {
                Alert.alert("Error", "No tienes permisos para editar esta publicación")
                router.back()
                return
            }

            // Cargar los datos en el formulario
            setFormData({
                name: publication.name || "",
                species: publication.species || "dog",
                gender: publication.gender || "male",
                age: parseInt(publication.age || "0") || 1,
                size: publication.size || "medium",
                description: publication.description || "",
                sterilized: publication.sterilized || false,
            })

            // Cargar la imagen actual
            if (publication.image?.uri) {
                setCurrentImage(publication.image.uri)
            }
        } catch (error) {
            console.error("Error loading publication:", error)
            Alert.alert("Error", "Error al cargar los datos de la publicación")
            router.back()
        } finally {
            setLoading(false)
        }
    }

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (status !== "granted") {
                Alert.alert("Permiso requerido", "Se necesita permiso para acceder a la galería")
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setNewImage(result.assets[0])
                newImageRef.current = result.assets[0]
            }
        } catch (error) {
            console.error("❌ Error picking image:", error)
            Alert.alert("Error", "Error al seleccionar la imagen")
        }
    }

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            Alert.alert("Error", "El nombre y descripción son obligatorios")
            return
        }

        if (!postId) {
            Alert.alert("Error", "No se puede guardar sin un ID de publicación")
            return
        }

        setSaving(true)
        try {
            const updateData: any = {
                pet: {
                    name: formData.name,
                    species: formData.species,
                    gender: formData.gender,
                    age: formData.age,
                    size: formData.size,
                    sterilized: formData.sterilized,
                },
                post: {
                    description: formData.description,
                },
            }

            // Si hay una nueva imagen, agregarla
            const imageToSend = newImage || newImageRef.current
            if (imageToSend) {
                updateData.images = [imageToSend]
            }

            await updatePublication(Number(postId), updateData)

            Alert.alert("Éxito", "Publicación actualizada correctamente", [
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ])
        } catch (error: any) {
            console.error("Error updating publication:", error)
            Alert.alert("Error", error?.message || "Error al actualizar la publicación")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.secondary} />
                <Text style={styles.loadingText}>Cargando publicación...</Text>
            </View>
        )
    }

    const speciesOptions = [
        { label: "Perro", value: "dog" },
        { label: "Gato", value: "cat" },
    ]

    const genderOptions = [
        { label: "Macho", value: "male" },
        { label: "Hembra", value: "female" },
    ]

    const sizeOptions = [
        { label: "Pequeño", value: "small" },
        { label: "Mediano", value: "medium" },
        { label: "Grande", value: "large" },
    ]

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Sección de Imagen */}
                <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                        {newImage || newImageRef.current || currentImage ? (
                            <Image
                                source={{
                                    uri:
                                        newImage?.uri ||
                                        newImageRef.current?.uri ||
                                        currentImage ||
                                        "",
                                }}
                                style={styles.petImage}
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="paw" size={60} color="#999" />
                            </View>
                        )}
                    </View>
                    <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
                        <Ionicons name="camera" size={20} color="#000" style={{ marginRight: 8 }} />
                        <Text style={styles.changePhotoText}>Cambiar Foto</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Nombre:</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Nombre de la mascota..."
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Género:</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowGenderModal(true)}
                            >
                                <View style={styles.dropdownContent}>
                                    <Ionicons
                                        name="male-female"
                                        size={18}
                                        color="Colors.primary"
                                        style={styles.dropdownIcon}
                                    />
                                    <Text style={styles.dropdownText}>
                                        {formData.gender === "male" ? "Macho" : "Hembra"}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="Colors.primary" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Edad:</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.age.toString()}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, age: parseInt(text) || 1 })
                                }
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Especie:</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowSpeciesModal(true)}
                            >
                                <View style={styles.dropdownContent}>
                                    <Ionicons
                                        name="paw"
                                        size={18}
                                        color="Colors.primary"
                                        style={styles.dropdownIcon}
                                    />
                                    <Text style={styles.dropdownText}>
                                        {formData.species === "dog" ? "Perro" : "Gato"}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="Colors.primary" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Tamaño:</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowSizeModal(true)}
                            >
                                <View style={styles.dropdownContent}>
                                    <Ionicons
                                        name="resize"
                                        size={18}
                                        color="Colors.primary"
                                        style={styles.dropdownIcon}
                                    />
                                    <Text style={styles.dropdownText}>
                                        {formData.size === "small"
                                            ? "Pequeño"
                                            : formData.size === "medium"
                                            ? "Mediano"
                                            : "Grande"}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="Colors.primary" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Descripción:</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Este perro es muy bueno para jugar, se levanta a puro lesear este ...."
                            multiline
                            numberOfLines={6}
                        />
                    </View>
                </View>
            </ScrollView>

            <Modal visible={showSpeciesModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Especie</Text>
                        {speciesOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        species: option.value,
                                    })
                                    setShowSpeciesModal(false)
                                }}
                            >
                                <Text style={styles.modalOptionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowSpeciesModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showGenderModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Género</Text>
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        gender: option.value,
                                    })
                                    setShowGenderModal(false)
                                }}
                            >
                                <Text style={styles.modalOptionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowGenderModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showSizeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Tamaño</Text>
                        {sizeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        size: option.value,
                                    })
                                    setShowSizeModal(false)
                                }}
                            >
                                <Text style={styles.modalOptionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowSizeModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    imageSection: {
        alignItems: "center",
        marginBottom: 30,
    },
    imageContainer: {
        position: "relative",
        marginBottom: 15,
    },
    petImage: {
        width: 180,
        height: 180,
        borderRadius: 20,
        backgroundColor: Colors.light.background,
    },
    placeholderImage: {
        width: 180,
        height: 180,
        borderRadius: 20,
        backgroundColor: Colors.light.background,
        justifyContent: "center",
        alignItems: "center",
    },
    changePhotoButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    changePhotoText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
    form: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    halfField: {
        flex: 0.48,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: Colors.light.background,
        color: "#333",
    },
    dropdown: {
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    dropdownIcon: {
        marginRight: 8,
    },
    dropdownText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    dropdownArrow: {
        fontSize: 18,
        color: Colors.primary,
        fontWeight: "bold",
    },
    statusButton: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 48,
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusActive: {
        backgroundColor: Colors.light.warning,
        borderColor: Colors.light.warning,
    },
    statusInactive: {
        backgroundColor: Colors.light.background,
        borderColor: "#bdbdbd",
    },
    statusClosed: {
        backgroundColor: "#ffcdd2",
        borderColor: Colors.danger,
    },
    statusText: {
        fontSize: 16,
        fontWeight: "600",
    },
    statusTextActive: {
        color: "#000",
    },
    statusTextInactive: {
        color: "#666",
    },
    statusTextClosed: {
        color: Colors.danger,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonDisabled: {
        backgroundColor: "#ccc",
    },
    saveButtonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: "80%",
        maxHeight: "60%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
        color: "#333",
    },
    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    modalOptionText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },
    modalCancelButton: {
        paddingVertical: 15,
        marginTop: 10,
    },
    modalCancelText: {
        fontSize: 16,
        color: Colors.primary,
        textAlign: "center",
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 16,
        color: "#666",
        fontSize: 16,
    },
})
