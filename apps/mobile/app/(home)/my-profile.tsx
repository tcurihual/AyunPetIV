import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from "react-native"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserProfileSchema } from "@/utils/schemas"
import type { UserProfileData } from "@/utils/schemas"
import Input from "@/components/ui/Input"
import { useAuthContext } from "@/context/AuthContext"
import { userService } from "@/services/user"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/Colors"
import { useThemeColor } from "@/hooks/useThemeColor"
import * as ImagePicker from "expo-image-picker"
import type { ImagePickerAsset } from "expo-image-picker"

export default function MyProfileScreen() {
    const { user, signOut, updateUser } = useAuthContext()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(null)

    // Colores dinámicos
    const bgColor = useThemeColor({}, "background")
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const tintColor = useThemeColor({}, "tint")
    const dangerColor = useThemeColor({}, "danger")
    const borderColor = useThemeColor({}, "border")
    const disabledColor = useThemeColor({}, "disabled")

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled) {
            setSelectedImage(result.assets[0])
        }
    }

    const placeholderImage = require("@images/pp_placeholder.png")

    useEffect(() => {
        const loadProfilePicture = async () => {
            if (user?.id) {
                const url = await userService.getProfilePicture(user.id)
                setProfilePictureUrl(url)
            }
        }

        loadProfilePicture()
    }, [user?.id])

    const getAvatarSource = () => {
        if (profilePictureUrl) return { uri: profilePictureUrl }
        if (user?.avatar && !user.avatar.includes("randomuser.me")) return { uri: user.avatar }
        return placeholderImage
    }

    const userData = {
        id: user?.id || "1",
        name: user?.name || "Usuario",
        email: user?.email || "usuario@example.com",
        rut: user?.rut || "No especificado",
        address: user?.address || "No especificada",
        description: user?.description || "Descripción no disponible",
    }

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UserProfileData>({
        resolver: zodResolver(UserProfileSchema),
        defaultValues: {
            id: userData.id,
            name: userData.name,
            address: userData.address || "",
            description: userData.description || "",
        },
    })

    const onSubmit = async (data: UserProfileData) => {
        try {
            const formData = new FormData()

            formData.append("name", data.name ?? "")
            formData.append("address", data.address ?? "")
            formData.append("description", data.description ?? "")

            if (selectedImage) {
                formData.append("image", {
                    uri: selectedImage.uri,
                    name: "profile.jpg",
                    type: "image/jpeg",
                } as any)
            }

            formData.append("mural", "")

            await userService.updateProfile(formData)

            await updateUser({
                name: data.name,
                address: data.address,
                description: data.description,
            })

            Alert.alert("Éxito", "Perfil actualizado")
            setIsEditing(false)
        } catch (error) {
            console.error("Error en onSubmit:", error)
            Alert.alert("Error", "No se pudo actualizar el perfil")
        }
    }

    const handleCancelEdit = () => {
        reset()
        setIsEditing(false)
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
            <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
                <Image source={getAvatarSource()} style={styles.profileImage} />

                <Text style={[styles.userName, { color: textColor }]}>{userData.name}</Text>

                <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Email: </Text>
                    <Text style={[styles.infoText, { color: textColor }]}>{userData.email}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>RUT: </Text>
                    <Text style={[styles.infoText, { color: textColor }]}>{userData.rut}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Descripción: </Text>
                    <Text style={[styles.infoText, { color: textColor }]}>{userData.description}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Dirección: </Text>
                    <Text style={[styles.infoText, { color: textColor }]}>{userData.address}</Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity style={[styles.editButton, { backgroundColor: tintColor }]} onPress={() => setIsEditing(true)}>
                        <Text style={[styles.editButtonText, { color: "#000" }]}>Editar Perfil</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* MODAL DE EDICIÓN */}
            <Modal
                visible={isEditing}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelEdit}
            >
                <KeyboardAvoidingView
                    style={[styles.editFormOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={styles.editFormScrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.editForm, { backgroundColor: cardColor }]}>
                            <Text style={[styles.editTitle, { color: textColor }]}>Editar Perfil</Text>

                            <Input
                                name="name"
                                control={control}
                                label="Nombre completo"
                                placeholder="Ingresa tu nombre completo"
                            />

                            <View style={[styles.readOnlyField, { backgroundColor: bgColor }]}>
                                <Text style={[styles.readOnlyLabel, { color: textSecondaryColor }]}>Correo electrónico</Text>
                                <Text style={[styles.readOnlyValue, { color: textColor }]}>{userData.email}</Text>
                                <Text style={[styles.readOnlyHelper, { color: textMutedColor }]}>
                                    El correo electrónico no puede ser modificado
                                </Text>
                            </View>

                            <Input
                                name="address"
                                control={control}
                                label="Dirección"
                                placeholder="Tu dirección"
                                inputProps={{
                                    multiline: true,
                                    numberOfLines: 2,
                                }}
                            />

                            <Input
                                name="description"
                                control={control}
                                label="Descripción"
                                placeholder="Cuéntanos sobre ti..."
                                inputProps={{
                                    multiline: true,
                                    numberOfLines: 4,
                                }}
                            />

                            <View style={{ marginTop: 20, alignItems: "center" }}>
                                <Text style={{ fontWeight: "600", marginBottom: 10, color: textColor }}>
                                    Foto de Perfil
                                </Text>

                                <TouchableOpacity onPress={pickImage}>
                                    <Image
                                        source={
                                            selectedImage
                                                ? { uri: selectedImage.uri }
                                                : getAvatarSource()
                                        }
                                        style={{ width: 120, height: 120, borderRadius: 16 }}
                                    />
                                </TouchableOpacity>

                                <Text style={{ marginTop: 10, color: textMutedColor }}>
                                    Toca la imagen para cambiarla
                                </Text>
                            </View>

                            <View style={styles.editButtonSection}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { borderColor: borderColor }]}
                                    onPress={handleCancelEdit}
                                >
                                    <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: tintColor }]}
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={isSubmitting}
                                >
                                    <Text style={[styles.saveButtonText, { color: "#000" }]}>
                                        {isSubmitting ? "Guardando..." : "Guardar"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    profileCard: {
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 16,
        marginBottom: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    infoSection: {
        width: "100%",
        marginBottom: 15,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    infoText: {
        fontSize: 16,
        textAlign: "justify",
    },
    buttonSection: {
        flexDirection: "row",
        width: "100%",
        marginTop: 20,
        gap: 10,
    },
    signOutButton: {
        flex: 1,
        backgroundColor: Colors.danger,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    signOutButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    editButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    editButtonText: {
        fontWeight: "700",
    },

    // MODAL
    editFormOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    editFormScrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    editForm: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    editTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    readOnlyField: {
        marginVertical: 10,
        padding: 12,
        borderRadius: 8,
    },
    readOnlyLabel: {
        fontSize: 14,
        fontWeight: "600",
    },
    readOnlyValue: {
        fontSize: 16,
        marginTop: 4,
    },
    readOnlyHelper: {
        fontSize: 12,
        marginTop: 2,
    },
    editButtonSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
    },
    cancelButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        marginRight: 10,
        alignItems: "center",
        borderWidth: 1,
    },
    cancelButtonText: {
        fontWeight: "700",
    },
    saveButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        marginLeft: 10,
        alignItems: "center",
    },
    saveButtonText: {
        fontWeight: "700",
    },
})
