import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { usePublications } from "@/context/PublicationContext"
import { useAuthContext } from "@/context/AuthContext"
import { Colors } from "@/constants/Colors"

/**
 * Componente de prueba para demostrar la funcionalidad del contexto de publicaciones
 * Este componente muestra cómo usar todas las operaciones CRUD del contexto
 */
export default function PublicationTest() {
    const { 
        publications, 
        loading, 
        error, 
        getPublications, 
        createPublication, 
        updatePublication, 
        deletePublication,
        petsForHome,
        clearError
    } = usePublications()
    
    const { user } = useAuthContext()

    // Función para probar GET - Listar publicaciones
    const testGetPublications = async () => {
        try {
            await getPublications()
            Alert.alert("Éxito", `Se obtuvieron ${publications.length} publicaciones`)
        } catch (error: any) {
            Alert.alert("Error", error.message)
        }
    }

    // Función para probar POST - Crear publicación (solo dadores)
    const testCreatePublication = async () => {
        if (!user || (user.role !== 20 && user.role !== 21)) {
            Alert.alert("Error", "Solo los dadores pueden crear publicaciones")
            return
        }

        const publicationData = {
            pet: {
                species: "dog",
                name: "Firulais Test",
                gender: "male",
                age: 3,
                size: "medium",
                sterilized: true
            },
            post: {
                title: "Firulais busca hogar - Test",
                description: "Esta es una publicación de prueba creada desde el contexto"
            }
        }

        try {
            const newPost = await createPublication(publicationData)
            Alert.alert("Éxito", `Publicación creada con ID: ${newPost.id}`)
        } catch (error: any) {
            Alert.alert("Error", error.message)
        }
    }

    // Función para probar PUT - Actualizar publicación (solo dueños)
    const testUpdatePublication = async () => {
        if (publications.length === 0) {
            Alert.alert("Error", "No hay publicaciones para actualizar")
            return
        }

        const firstPublication = publications[0]
        const updateData = {
            post: {
                title: "Título actualizado - Test",
                description: "Descripción actualizada desde el contexto"
            }
        }

        try {
            const updatedPost = await updatePublication(Number(firstPublication.postId), updateData)
            Alert.alert("Éxito", `Publicación actualizada: ${updatedPost.title}`)
        } catch (error: any) {
            Alert.alert("Error", error.message)
        }
    }

    // Función para probar DELETE - Eliminar publicación (solo dueños)
    const testDeletePublication = async () => {
        if (publications.length === 0) {
            Alert.alert("Error", "No hay publicaciones para eliminar")
            return
        }

        const firstPublication = publications[0]
        
        Alert.alert(
            "Confirmar eliminación",
            `¿Estás seguro de que quieres eliminar la publicación "${firstPublication.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePublication(Number(firstPublication.postId))
                            Alert.alert("Éxito", "Publicación eliminada correctamente")
                        } catch (error: any) {
                            Alert.alert("Error", error.message)
                        }
                    }
                }
            ]
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pruebas del Contexto de Publicaciones</Text>
            
            {/* Estado del contexto */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Usuario: {user?.name || "No autenticado"} (Rol: {user?.role || "N/A"})
                </Text>
                <Text style={styles.statusText}>
                    Publicaciones: {publications.length}
                </Text>
                <Text style={styles.statusText}>
                    Mascotas para home: {petsForHome.length}
                </Text>
                <Text style={styles.statusText}>
                    Cargando: {loading ? "Sí" : "No"}
                </Text>
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Error: {error}</Text>
                        <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
                            <Text style={styles.clearErrorText}>Limpiar Error</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Botones de prueba */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    onPress={testGetPublications} 
                    style={[styles.button, styles.getButton]}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        GET - Obtener Publicaciones
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={testCreatePublication} 
                    style={[styles.button, styles.postButton]}
                    disabled={loading || !user || (user.role !== 20 && user.role !== 21)}
                >
                    <Text style={styles.buttonText}>
                        POST - Crear Publicación
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={testUpdatePublication} 
                    style={[styles.button, styles.putButton]}
                    disabled={loading || publications.length === 0}
                >
                    <Text style={styles.buttonText}>
                        PUT - Actualizar Publicación
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={testDeletePublication} 
                    style={[styles.button, styles.deleteButton]}
                    disabled={loading || publications.length === 0}
                >
                    <Text style={styles.buttonText}>
                        DELETE - Eliminar Publicación
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista de publicaciones */}
            {publications.length > 0 && (
                <View style={styles.publicationsContainer}>
                    <Text style={styles.publicationsTitle}>Publicaciones disponibles:</Text>
                    {publications.slice(0, 3).map((pub, index) => (
                        <View key={pub.id} style={styles.publicationItem}>
                            <Text style={styles.publicationName}>{pub.name}</Text>
                            <Text style={styles.publicationDetails}>
                                {pub.gender} - {pub.age} - Por: {pub.publisher}
                            </Text>
                        </View>
                    ))}
                    {publications.length > 3 && (
                        <Text style={styles.moreText}>
                            Y {publications.length - 3} más...
                        </Text>
                    )}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    statusContainer: {
        backgroundColor: "#e3f2fd",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    statusText: {
        fontSize: 14,
        marginBottom: 5,
        color: "#1565c0",
    },
    errorContainer: {
        backgroundColor: "#ffebee",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 14,
    },
    clearErrorButton: {
        marginTop: 5,
        padding: 5,
        backgroundColor: Colors.danger,
        borderRadius: 5,
        alignSelf: "flex-start",
    },
    clearErrorText: {
        color: "white",
        fontSize: 12,
    },
    buttonContainer: {
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: "center",
    },
    getButton: {
        backgroundColor: "#4caf50",
    },
    postButton: {
        backgroundColor: "#2196f3",
    },
    putButton: {
        backgroundColor: "#ff9800",
    },
    deleteButton: {
        backgroundColor: Colors.danger,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    publicationsContainer: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 8,
    },
    publicationsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    publicationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    publicationName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    publicationDetails: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    moreText: {
        fontSize: 14,
        color: "#999",
        fontStyle: "italic",
        marginTop: 10,
    },
})