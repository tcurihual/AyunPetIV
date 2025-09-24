import React, { useState } from "react"
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

// Mock data para probar
const mockUser = {
    id: "1",
    name: "Alexis Sánchez",
    email: "alexis.sanchez@example.com",
    rut: "12345678-9",
    address: "Mi casa #777, Tacna, Perú",
    description:
        "Dog Lover Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse erat arcu, tincidunt nec urna et, vehicula pretium arcu. Donec porta.",
    avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
}

export default function MyProfileScreen() {
    const [isEditing, setIsEditing] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UserProfileData>({
        resolver: zodResolver(UserProfileSchema),
        defaultValues: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            rut: mockUser.rut,
            address: mockUser.address || "",
            description: mockUser.description || "",
        },
    })

    const onSubmit = async (data: UserProfileData) => {
        try {
            console.log("Datos a actualizar:", data)
            await new Promise((resolve) => setTimeout(resolve, 1000))

            Alert.alert("Éxito", "Perfil actualizado correctamente")
            setIsEditing(false)
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar el perfil")
        }
    }

    const handleCancelEdit = () => {
        reset()
        setIsEditing(false)
    }

    const handleSignOut = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Cerrar Sesión",
                style: "destructive",
                onPress: () => Alert.alert("Sesión cerrada"),
            },
        ])
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
                <Image source={{ uri: mockUser.avatarUrl }} style={styles.profileImage} />

                <Text style={styles.userName}>{mockUser.name}</Text>

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Email: </Text>
                    <Text style={styles.infoText}>{mockUser.email}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>RUT: </Text>
                    <Text style={styles.infoText}>{mockUser.rut}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Descripción: </Text>
                    <Text style={styles.infoText}>{mockUser.description}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Dirección: </Text>
                    <Text style={styles.infoText}>{mockUser.address}</Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Editar Perfil</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={isEditing}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelEdit}
            >
                <KeyboardAvoidingView
                    style={styles.editFormOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={styles.editFormScrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.editForm}>
                            <Text style={styles.editTitle}>Editar Perfil</Text>

                            <Input
                                name="name"
                                control={control}
                                label="Nombre completo"
                                placeholder="Ingresa tu nombre completo"
                            />

                            <Input
                                name="email"
                                control={control}
                                label="Correo electrónico"
                                placeholder="correo@ejemplo.com"
                                type="email"
                            />

                            <Input
                                name="rut"
                                control={control}
                                label="RUT"
                                placeholder="12345678-9"
                            />

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

                            <View style={styles.editButtonSection}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancelEdit}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.saveButtonText}>
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
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    infoSection: {
        width: "100%",
        marginBottom: 15,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    infoText: {
        fontSize: 16,
        color: "#666",
        lineHeight: 22,
        textAlign: "justify",
    },
    buttonSection: {
        flexDirection: "row",
        width: "100%",
        marginTop: 30,
        gap: 15,
    },
    signOutButton: {
        flex: 1,
        backgroundColor: "#ff4757",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    signOutButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    editButton: {
        flex: 1,
        backgroundColor: "#F9C80E",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    editFormOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    editFormScrollContent: {
        flexGrow: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    editForm: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 20,
        minHeight: "60%",
        maxHeight: "90%",
    },
    editTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    editButtonSection: {
        flexDirection: "row",
        gap: 15,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#f1f3f4",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
})
