import React, { useState, useEffect } from "react"
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
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { Pet, getPetById, updatePet, getPetImage } from "@/services/petAsyncStorage"

type PetFormData = {
    name: string
    species: string
    gender: string
    age: number
    size: string
    description: string
    sterilized: boolean
    status: "active" | "archived"
}

export default function EditPublication() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { user } = useAuthContext()
    const router = useRouter()

    const [formData, setFormData] = useState<PetFormData>({
        name: "",
        species: "Perro",
        gender: "Hembra",
        age: 1,
        size: "Mediano",
        description: "",
        sterilized: false,
        status: "active",
    })

    const [petImage, setPetImage] = useState<number | string>(
        "https://placehold.co/200x200?text=Mascota"
    )
    const [loading, setLoading] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showSpeciesModal, setShowSpeciesModal] = useState(false)
    const [showGenderModal, setShowGenderModal] = useState(false)
    const [showSizeModal, setShowSizeModal] = useState(false)

    useEffect(() => {
        loadPetData()
    }, [id, user?.id])

    const loadPetData = async () => {
        if (!id) return

        try {
            const pet = await getPetById(id)
            if (pet && pet.ownerId === user?.id) {
                setFormData({
                    name: pet.name,
                    species: pet.species,
                    gender: pet.gender,
                    age: pet.age,
                    size: pet.size,
                    description: pet.description,
                    sterilized: pet.sterilized,
                    status: pet.status,
                })
                setPetImage(getPetImage(pet.imageId))
            } else {
                Alert.alert(
                    "Error",
                    "No se encontró la publicación o no tienes permisos para editarla"
                )
                router.back()
            }
        } catch (error) {
            Alert.alert("Error", "Error al cargar los datos de la mascota")
            router.back()
        }
    }

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            Alert.alert("Error", "El nombre y descripción son obligatorios")
            return
        }

        if (!id) return

        setLoading(true)
        try {
            const success = await updatePet(id, {
                name: formData.name,
                species: formData.species,
                gender: formData.gender,
                age: formData.age,
                size: formData.size,
                description: formData.description,
                sterilized: formData.sterilized,
                status: formData.status,
            })

            if (success) {
                Alert.alert("Éxito", "Publicación actualizada correctamente", [
                    { text: "OK", onPress: () => router.back() },
                ])
            } else {
                Alert.alert("Error", "No se pudo actualizar la publicación")
            }
        } catch (error) {
            Alert.alert("Error", "Error al guardar los cambios")
        } finally {
            setLoading(false)
        }
    }

    const statusOptions = [
        { label: "Activo", value: "active" },
        { label: "Archivado", value: "archived" },
    ]

    const speciesOptions = [
        { label: "Perro", value: "Perro" },
        { label: "Gato", value: "Gato" },
    ]

    const genderOptions = [
        { label: "Macho", value: "Macho" },
        { label: "Hembra", value: "Hembra" },
    ]

    const sizeOptions = [
        { label: "Pequeño", value: "Pequeño" },
        { label: "Mediano", value: "Mediano" },
        { label: "Grande", value: "Grande" },
    ]

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={typeof petImage === "string" ? { uri: petImage } : petImage}
                            style={styles.petImage}
                        />
                    </View>
                    <TouchableOpacity style={styles.changePhotoButton}>
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
                            placeholder="Alexis..."
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Genero:</Text>
                            <TouchableOpacity style={styles.dropdown}>
                                <Text style={styles.dropdownText}>{formData.gender}</Text>
                                <Text style={styles.dropdownArrow}>↓</Text>
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
                            <Text style={styles.label}>Raza/Tipo:</Text>
                            <TouchableOpacity style={styles.dropdown}>
                                <Text style={styles.dropdownText}>{formData.species}</Text>
                                <Text style={styles.dropdownArrow}>↓</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Cambiar Estado:</Text>
                            <TouchableOpacity
                                style={[
                                    styles.statusButton,
                                    formData.status === "archived"
                                        ? styles.statusInactive
                                        : styles.statusActive,
                                ]}
                                onPress={() => setShowStatusModal(true)}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        formData.status === "archived"
                                            ? styles.statusTextInactive
                                            : styles.statusTextActive,
                                    ]}
                                >
                                    {formData.status === "archived" ? "Archivado" : "Activo"}
                                </Text>
                                <Text style={styles.dropdownArrow}>↓</Text>
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

            <Modal visible={showStatusModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cambiar Estado</Text>
                        {statusOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        status: option.value as "active" | "archived",
                                    })
                                    setShowStatusModal(false)
                                }}
                            >
                                <Text style={styles.modalOptionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowStatusModal(false)}
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
        backgroundColor: "#f8f9fa",
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
        backgroundColor: "#e0e0e0",
    },
    changePhotoButton: {
        backgroundColor: "#FFB347",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
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
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f8f9fa",
        color: "#333",
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#f8f9fa",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropdownText: {
        fontSize: 16,
        color: "#333",
    },
    dropdownArrow: {
        fontSize: 16,
        color: "#666",
    },
    statusButton: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 48,
    },
    statusActive: {
        backgroundColor: "#FFB347",
    },
    statusInactive: {
        backgroundColor: "#e0e0e0",
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
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    saveButton: {
        backgroundColor: "#007AFF",
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
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
        color: "#007AFF",
        textAlign: "center",
        fontWeight: "600",
    },
})
