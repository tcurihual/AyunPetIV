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
import { Ionicons } from "@expo/vector-icons"
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
    status: "activo" | "inactivo" | "cerrado"
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
        status: "activo",
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
        { label: "Activo", value: "activo" },
        { label: "Inactivo", value: "inactivo" },
        { label: "Cerrado", value: "cerrado" },
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
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowGenderModal(true)}
                            >
                                <View style={styles.dropdownContent}>
                                    <Ionicons
                                        name="male-female"
                                        size={18}
                                        color="#007AFF"
                                        style={styles.dropdownIcon}
                                    />
                                    <Text style={styles.dropdownText}>{formData.gender}</Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="#007AFF" />
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
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowSpeciesModal(true)}
                            >
                                <View style={styles.dropdownContent}>
                                    <Ionicons
                                        name="paw"
                                        size={18}
                                        color="#007AFF"
                                        style={styles.dropdownIcon}
                                    />
                                    <Text style={styles.dropdownText}>{formData.species}</Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Cambiar Estado:</Text>
                            <TouchableOpacity
                                style={[
                                    styles.statusButton,
                                    formData.status === "activo"
                                        ? styles.statusActive
                                        : formData.status === "inactivo"
                                        ? styles.statusInactive
                                        : styles.statusClosed,
                                ]}
                                onPress={() => setShowStatusModal(true)}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        formData.status === "activo"
                                            ? styles.statusTextActive
                                            : formData.status === "inactivo"
                                            ? styles.statusTextInactive
                                            : styles.statusTextClosed,
                                    ]}
                                >
                                    {formData.status === "activo"
                                        ? "Activo"
                                        : formData.status === "inactivo"
                                        ? "Inactivo"
                                        : "Cerrado"}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={20}
                                    color={
                                        formData.status === "activo"
                                            ? "#000"
                                            : formData.status === "inactivo"
                                            ? "#666"
                                            : "#d32f2f"
                                    }
                                />
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
                                        status: option.value as "activo" | "inactivo" | "cerrado",
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
        backgroundColor: "#FFD24C",
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
        borderWidth: 2,
        borderColor: "#FFD24C",
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
        color: "#FFD24C",
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
        backgroundColor: "#FFB347",
        borderColor: "#FF9800",
    },
    statusInactive: {
        backgroundColor: "#e0e0e0",
        borderColor: "#bdbdbd",
    },
    statusClosed: {
        backgroundColor: "#ffcdd2",
        borderColor: "#d32f2f",
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
        color: "#d32f2f",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    saveButton: {
        backgroundColor: "#FFD24C",
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
        color: "#007AFF",
        textAlign: "center",
        fontWeight: "600",
    },
})
