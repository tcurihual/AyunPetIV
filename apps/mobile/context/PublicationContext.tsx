import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { Post, Pet, User } from "@/utils/types"

// Interfaces para los payloads de las operaciones
interface CreatePublicationPayload {
    pet: {
        species: string
        name: string
        gender: string
        age: number
        size: string
        sterilized: boolean
    }
    post: {
        title: string
        description: string
    }
}

interface UpdatePublicationPayload {
    pet?: {
        species?: string
        name?: string
        gender?: string
        age?: number
        size?: string
        sterilized?: boolean
    }
    post?: {
        title?: string
        description?: string
        status?: string
    }
}

// Interface para la respuesta de publicaciones transformada para el frontend
export interface PublicationItem {
    id: string
    name: string
    gender: string
    age: string
    publisher: string
    description: string
    image: { uri: string } | any
    species?: string
    size?: string
    sterilized?: boolean
    status?: string
    postId?: number
    petId?: number
    creatorId?: number
}

interface PublicationContextType {
    publications: PublicationItem[]
    loading: boolean
    error: string | null
    // Operaciones CRUD
    getPublications: () => Promise<void>
    createPublication: (data: CreatePublicationPayload) => Promise<Post>
    updatePublication: (id: number, data: UpdatePublicationPayload) => Promise<Post>
    deletePublication: (id: number) => Promise<void>
    // Utilidades
    refreshPublications: () => Promise<void>
    clearError: () => void
    // Lista para el home
    petsForHome: PublicationItem[]
}

const PublicationContext = createContext<PublicationContextType | null>(null)

export const PublicationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [publications, setPublications] = useState<PublicationItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user, status } = useAuthContext()

    // Cargar publicaciones automáticamente cuando el usuario esté autenticado
    useEffect(() => {
        if (status === "authenticated") {
            getPublications()
        }
    }, [status])

    /**
     * GET: Obtener todas las publicaciones disponibles
     * Permite a todos los usuarios listar mascotas disponibles para adopción
     */
    async function getPublications(): Promise<void> {
        setLoading(true)
        setError(null)
        
        try {
            // Intentar usar el endpoint real primero
            let response;
            try {
                response = await http.get<{
                    status: number
                    message: string
                    data: any[]
                }>("/v1/adoptions/posts")
            } catch (apiError) {
                console.warn("API no disponible, usando datos de prueba:", apiError)
                
                // Fallback: usar datos de prueba si la API no está disponible
                const mockPublications: PublicationItem[] = [
                    {
                        id: "1",
                        name: "Firulais",
                        gender: "Macho",
                        age: "3 años",
                        publisher: "Fundación Patitas Felices",
                        description: "Perro muy juguetón y cariñoso que busca una familia amorosa",
                        image: { uri: "https://placehold.co/400x400?text=Firulais" },
                        species: "Perro",
                        size: "Mediano",
                        sterilized: false,
                        status: "active",
                        postId: 1,
                        petId: 101,
                        creatorId: 1
                    },
                    {
                        id: "2",
                        name: "Michi",
                        gender: "Hembra",
                        age: "2 años",
                        publisher: "Refugio Esperanza",
                        description: "Gata tranquila perfecta para departamentos",
                        image: { uri: "https://placehold.co/400x400?text=Michi" },
                        species: "Gato",
                        size: "Pequeño",
                        sterilized: true,
                        status: "active",
                        postId: 2,
                        petId: 102,
                        creatorId: 2
                    },
                    {
                        id: "3",
                        name: "Rocky",
                        gender: "Macho",
                        age: "1 año",
                        publisher: "Protectora Animal",
                        description: "Perro joven muy energético, ideal para familias activas",
                        image: { uri: "https://placehold.co/400x400?text=Rocky" },
                        species: "Perro",
                        size: "Grande",
                        sterilized: false,
                        status: "active",
                        postId: 3,
                        petId: 103,
                        creatorId: 3
                    }
                ]
                
                setPublications(mockPublications)
                return
            }
            
            // Transformar los datos de la API para el frontend
            const transformedPublications: PublicationItem[] = response.data.data.map((item: any) => ({
                id: String(item.post?.id || item.id),
                name: item.pet?.name || "Sin nombre",
                gender: item.pet?.gender || "No especificado",
                age: item.pet?.age ? `${item.pet.age} años` : "No especificado",
                publisher: item.creator?.name || item.user?.name || "Usuario desconocido",
                description: item.post?.description || item.description || "",
                image: { uri: "https://placehold.co/400x400?text=Mascota" },
                species: item.pet?.species,
                size: item.pet?.size,
                sterilized: item.pet?.sterilized,
                status: item.post?.status || item.status,
                postId: item.post?.id || item.id,
                petId: item.pet?.id,
                creatorId: item.creator?.id || item.creatorid
            }))
            
            setPublications(transformedPublications)
        } catch (e: any) {
            console.error("Error al obtener publicaciones:", e)
            setError(e?.response?.data?.message || "Error al cargar las publicaciones")
            setPublications([])
        } finally {
            setLoading(false)
        }
    }

    /**
     * POST: Crear una nueva publicación
     * Solo los dadores (rol 20, 21) pueden crear publicaciones
     */
    async function createPublication(data: CreatePublicationPayload): Promise<Post> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        // Verificar permisos - solo dadores pueden crear publicaciones
        if (user.role !== 20 && user.role !== 21) {
            throw new Error("No tienes permisos para crear publicaciones. Solo los dadores pueden hacerlo.")
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.post<{
                status: number
                message: string
                values: {
                    post: Post
                    pet: Pet
                }
            }>("/v1/adoptions/posts", data)

            // Refrescar la lista de publicaciones
            await getPublications()

            return response.data.values.post
        } catch (e: any) {
            console.error("Error al crear publicación:", e)
            
            // Para demostración, simular creación exitosa si la API no está disponible
            if (e?.code === "ECONNREFUSED" || e?.message?.includes("Network Error")) {
                console.warn("API no disponible, simulando creación de publicación")
                
                // Crear una publicación simulada
                const mockPost: Post = {
                    id: Date.now(),
                    creator: {
                        id: Number(user.id),
                        role: { id: user.role, roletype: user.role === 20 ? "dador" : "shelter" },
                        rut: user.rut || "",
                        email: user.email || "",
                        name: user.name || "",
                        password: "",
                        validated: true,
                        address: null,
                        description: null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    pet: {
                        id: Date.now() + 1,
                        owner: {
                            id: Number(user.id),
                            role: { id: user.role, roletype: user.role === 20 ? "dador" : "shelter" },
                            rut: user.rut || "",
                            email: user.email || "",
                            name: user.name || "",
                            password: "",
                            validated: true,
                            address: null,
                            description: null,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        species: data.pet.species,
                        name: data.pet.name,
                        gender: data.pet.gender,
                        age: data.pet.age,
                        size: data.pet.size,
                        sterilized: data.pet.sterilized,
                        adopted: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    title: data.post.title,
                    description: data.post.description,
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                
                // Agregar a la lista local
                const newPublication: PublicationItem = {
                    id: String(mockPost.id),
                    name: data.pet.name,
                    gender: data.pet.gender,
                    age: `${data.pet.age} años`,
                    publisher: user.name || "Usuario",
                    description: data.post.description,
                    image: { uri: "https://placehold.co/400x400?text=Nueva+Mascota" },
                    species: data.pet.species,
                    size: data.pet.size,
                    sterilized: data.pet.sterilized,
                    status: "active",
                    postId: mockPost.id,
                    petId: mockPost.pet.id,
                    creatorId: Number(user.id)
                }
                
                setPublications(prev => [newPublication, ...prev])
                return mockPost
            }
            
            const errorMessage = e?.response?.data?.message || "Error al crear la publicación"
            setError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    /**
     * PUT: Actualizar una publicación existente
     * Solo los dueños de la publicación pueden actualizarla
     */
    async function updatePublication(id: number, data: UpdatePublicationPayload): Promise<Post> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.put<{
                status: number
                message: string
                data: Post
            }>(`/v1/adoptions/posts/${id}`, data)

            // Refrescar la lista de publicaciones
            await getPublications()

            return response.data.data
        } catch (e: any) {
            console.error("Error al actualizar publicación:", e)
            
            // Para demostración, simular actualización exitosa si la API no está disponible
            if (e?.code === "ECONNREFUSED" || e?.message?.includes("Network Error")) {
                console.warn("API no disponible, simulando actualización de publicación")
                
                // Actualizar en la lista local
                setPublications(prev => prev.map(pub => {
                    if (pub.postId === id) {
                        return {
                            ...pub,
                            name: data.pet?.name || pub.name,
                            description: data.post?.description || pub.description,
                            gender: data.pet?.gender || pub.gender,
                            species: data.pet?.species || pub.species,
                            size: data.pet?.size || pub.size,
                            sterilized: data.pet?.sterilized ?? pub.sterilized,
                            status: data.post?.status || pub.status
                        }
                    }
                    return pub
                }))
                
                // Crear mock del post actualizado
                const mockPost: Post = {
                    id: id,
                    creator: {
                        id: Number(user.id),
                        role: { id: user.role, roletype: user.role === 20 ? "dador" : "shelter" },
                        rut: user.rut || "",
                        email: user.email || "",
                        name: user.name || "",
                        password: "",
                        validated: true,
                        address: null,
                        description: null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    pet: {
                        id: id + 1000,
                        owner: {
                            id: Number(user.id),
                            role: { id: user.role, roletype: user.role === 20 ? "dador" : "shelter" },
                            rut: user.rut || "",
                            email: user.email || "",
                            name: user.name || "",
                            password: "",
                            validated: true,
                            address: null,
                            description: null,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        species: data.pet?.species || "dog",
                        name: data.pet?.name || "Mascota actualizada",
                        gender: data.pet?.gender || "male",
                        age: data.pet?.age || 1,
                        size: data.pet?.size || "medium",
                        sterilized: data.pet?.sterilized || false,
                        adopted: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    title: data.post?.title || "Título actualizado",
                    description: data.post?.description || "Descripción actualizada",
                    status: data.post?.status || "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                
                return mockPost
            }
            
            const errorMessage = e?.response?.data?.message || "Error al actualizar la publicación"
            
            // Manejar errores específicos de permisos
            if (e?.response?.status === 403) {
                setError("No tienes permisos para actualizar esta publicación")
            } else if (e?.response?.status === 404) {
                setError("Publicación no encontrada")
            } else {
                setError(errorMessage)
            }
            
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    /**
     * DELETE: Eliminar una publicación
     * Solo los dueños de la publicación pueden eliminarla
     */
    async function deletePublication(id: number): Promise<void> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            await http.delete(`/v1/adoptions/posts/${id}`)

            // Refrescar la lista de publicaciones
            await getPublications()
        } catch (e: any) {
            console.error("Error al eliminar publicación:", e)
            
            // Para demostración, simular eliminación exitosa si la API no está disponible
            if (e?.code === "ECONNREFUSED" || e?.message?.includes("Network Error")) {
                console.warn("API no disponible, simulando eliminación de publicación")
                
                // Eliminar de la lista local
                setPublications(prev => prev.filter(pub => pub.postId !== id))
                return
            }
            
            const errorMessage = e?.response?.data?.message || "Error al eliminar la publicación"
            
            // Manejar errores específicos de permisos
            if (e?.response?.status === 403) {
                setError("No tienes permisos para eliminar esta publicación")
            } else if (e?.response?.status === 404) {
                setError("Publicación no encontrada")
            } else {
                setError(errorMessage)
            }
            
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Refrescar publicaciones (útil para pull-to-refresh)
     */
    async function refreshPublications(): Promise<void> {
        await getPublications()
    }

    /**
     * Limpiar errores
     */
    function clearError(): void {
        setError(null)
    }

    // Lista de mascotas filtrada para el home (solo activas y disponibles)
    const petsForHome = useMemo(() => {
        return publications.filter(pub => 
            pub.status === "active" || 
            pub.status === "activo" || 
            !pub.status // Si no tiene status, asumimos que está activo
        )
    }, [publications])

    const value = useMemo(
        () => ({
            publications,
            loading,
            error,
            getPublications,
            createPublication,
            updatePublication,
            deletePublication,
            refreshPublications,
            clearError,
            petsForHome,
        }),
        [publications, loading, error, petsForHome]
    )

    return <PublicationContext.Provider value={value}>{children}</PublicationContext.Provider>
}

export function usePublicationContext() {
    const ctx = useContext(PublicationContext)
    if (!ctx) {
        throw new Error("usePublicationContext must be used within PublicationProvider")
    }
    return ctx
}

// Hook de conveniencia
export const usePublications = usePublicationContext