import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import * as ImagePicker from "expo-image-picker"
import { useAuthContext } from "./AuthContext"
import { Post, Pet, User } from "@/utils/types"
import { toMediaUrl } from "@/utils/mediaUrl"

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
    // Opcional: imágenes seleccionadas desde la app (antes de enviarlas al microservicio)
    images?: ImagePicker.ImagePickerAsset[]
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
    getPublicationByPostId: (postId: number) => Promise<PublicationItem | null>
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

    const buildPublicationItem = React.useCallback((post: any, pet: any): PublicationItem => {
        const postImages: string[] = Array.isArray(post?.images) ? post.images : []
        const petImages: string[] = Array.isArray(pet?.images) ? pet.images : []

        const imageUri =
            postImages[0] || petImages[0] || "https://placehold.co/400x400?text=Mascota"

        return {
            id: String(post?.id ?? ""),
            name: pet?.name || "Sin nombre",
            gender: pet?.gender ?? "",
            age: typeof pet?.age === "number" ? `${pet.age} años` : "",
            publisher: "Usuario",
            description: post?.description ?? "",
            image: { uri: imageUri },
            species: pet?.species,
            size: pet?.size,
            sterilized: pet?.sterilized,
            status: post?.status,
            postId: post?.id,
            petId: pet?.id,
            creatorId: post?.creator_id,
        }
    }, [])

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
            // Llamar al endpoint de publicaciones
            const response = await http.get<{
                status: number
                message: string
                data: {
                    items: Array<{
                        post: {
                            id: number
                            creator_id: number
                            pet_id: number
                            title: string
                            description: string
                            status: string
                            created_at: string
                            updated_at: string
                            images?: string[]
                        }
                        pet: {
                            id: number
                            ownerid: number
                            name: string | null
                            species: string
                            gender: string
                            age: number
                            size: string
                            sterilized: boolean
                            adopted: boolean
                            created_at: string
                            updated_at: string
                            images?: string[]
                        }
                    }>
                    total: number
                    page: number
                    pageSize: number
                    totalPages: number
                }
            }>("/v1/adoptions/publications")

            // Transformar los datos de la API para el frontend
            const transformedPublications: PublicationItem[] = response.data.data.items.map(
                (item) => ({
                    id: String(item.post.id),
                    name: item.pet.name || "Sin nombre",
                    gender: item.pet.gender,
                    age: `${item.pet.age} años`,
                    publisher: "Usuario", // Por ahora no viene info del creador en la respuesta
                    description: item.post.description,
                    image:
                        item.post.images && item.post.images.length > 0
                            ? { uri: toMediaUrl(item.post.images[0]) }
                            : item.pet.images && item.pet.images.length > 0
                            ? { uri: toMediaUrl(item.pet.images[0]) }
                            : { uri: "https://placehold.co/400x400?text=Mascota" },
                    species: item.pet.species,
                    size: item.pet.size,
                    sterilized: item.pet.sterilized,
                    status: item.post.status,
                    postId: item.post.id,
                    petId: item.pet.id,
                    creatorId: item.post.creator_id,
                })
            )

            setPublications(transformedPublications)
        } catch (e: any) {
            console.error("Error al obtener publicaciones:", e)
            setError(e?.response?.data?.message || "Error al cargar las publicaciones")
            setPublications([])
        } finally {
            setLoading(false)
        }
    }

    const getPublicationByPostId = React.useCallback(
        async (postId: number): Promise<PublicationItem | null> => {
            if (!postId) return null

            const numericId = Number(postId)
            if (!Number.isFinite(numericId) || numericId <= 0) return null

            const existing = publications.find((pub) => Number(pub.postId ?? pub.id) === numericId)
            if (existing) {
                return existing
            }

            try {
                const response = await http.get<{
                    data: {
                        post: any
                        pet: any
                    }
                }>(`/v1/adoptions/publications/${numericId}`)

                const { post, pet } = response.data.data || {}
                if (!post || !pet) {
                    return null
                }

                const mapped = buildPublicationItem(post, pet)
                setPublications((prev) => {
                    const hasPublication = prev.some(
                        (pub) => Number(pub.postId ?? pub.id) === numericId
                    )
                    return hasPublication ? prev : [...prev, mapped]
                })
                return mapped
            } catch (e: any) {
                console.error("Error al obtener publicación por postId:", e)
                return null
            }
        },
        [buildPublicationItem, publications]
    )

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
            throw new Error(
                "No tienes permisos para crear publicaciones. Solo los dadores pueden hacerlo."
            )
        }

        setLoading(true)
        setError(null)

        try {
            // Preparar el payload según la API
            const payload = {
                ownerId: Number(user.id),
                title: data.post.title,
                description: data.post.description,
                species: (String(data.pet.species) ?? "").toLowerCase(),
                gender: (String(data.pet.gender) ?? "").toLowerCase(),
                // backend expects age_years and age_months
                age_years: data.pet.age,
                age_months: 0,
                size: (String(data.pet.size) ?? "").toLowerCase(),
                sterilized: data.pet.sterilized,
                name: data.pet.name,
            }

            let response

            // Si se enviaron imágenes, construir FormData y enviar multipart/form-data
            if (data.images && data.images.length > 0) {
                const form = new FormData()

                // Añadir campos del payload al formData
                Object.entries(payload).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) form.append(k, String(v))
                })

                // Añadir archivos
                data.images.forEach((a, idx) => {
                    form.append("files", {
                        uri: (a as any).uri,
                        name: (a as any).fileName ?? `photo-${Date.now()}-${idx}.jpg`,
                        type: (a as any).mimeType ?? "image/jpeg",
                    } as any)
                })

                response = await http.post("/v1/adoptions/publications", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            } else {
                response = await http.post<{
                    status: number
                    message: string
                    data: {
                        post: any
                        pet: any
                    }
                }>("/v1/adoptions/publications", payload)
            }

            // Refrescar la lista de publicaciones
            await getPublications()

            // Retornar en el formato Post esperado
            const post: Post = {
                id: response.data.data.post.id,
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
                    createdAt: new Date(response.data.data.post.createdat),
                    updatedAt: new Date(
                        response.data.data.post.updatedat || response.data.data.post.createdat
                    ),
                },
                pet: {
                    id: response.data.data.pet.id,
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
                        updatedAt: new Date(),
                    },
                    species: response.data.data.pet.species,
                    name: response.data.data.pet.name,
                    gender: response.data.data.pet.gender,
                    age: response.data.data.pet.age,
                    size: response.data.data.pet.size,
                    sterilized: response.data.data.pet.sterilized,
                    adopted: response.data.data.pet.adopted,
                    createdAt: new Date(response.data.data.pet.createdat),
                    updatedAt: new Date(
                        response.data.data.pet.updatedat || response.data.data.pet.createdat
                    ),
                },
                title: response.data.data.post.title,
                description: response.data.data.post.description,
                status: response.data.data.post.status,
                createdAt: new Date(response.data.data.post.createdat),
                updatedAt: new Date(
                    response.data.data.post.updatedat || response.data.data.post.createdat
                ),
            }

            return post
        } catch (e: any) {
            console.error("Error al crear publicación:", e)
            const errorMessage = e?.response?.data?.message || "Error al crear la publicación"
            setError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    /**
     * PATCH: Actualizar una publicación existente
     * Solo los dueños de la publicación pueden actualizarla
     */
    async function updatePublication(id: number, data: UpdatePublicationPayload): Promise<Post> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            // Preparar el payload según la API (campos opcionales)
            const payload: any = {}

            if (data.post?.title) payload.title = data.post.title
            if (data.post?.description) payload.description = data.post.description
            if (data.pet?.species) payload.species = String(data.pet.species).toLowerCase()
            if (data.pet?.gender) payload.gender = String(data.pet.gender).toLowerCase()
            if (data.pet?.age !== undefined) {
                // backend expects age_years / age_months
                payload.age_years = data.pet.age
                payload.age_months = 0
            }
            if (data.pet?.size) payload.size = String(data.pet.size).toLowerCase()
            if (data.pet?.sterilized !== undefined) payload.sterilized = data.pet.sterilized
            if (data.pet?.name !== undefined) payload.name = data.pet.name

            const response = await http.patch<{
                status: number
                message: string
                data: {
                    post: any
                    pet: any
                }
            }>(`/v1/adoptions/publications/${id}`, payload)

            // Refrescar la lista de publicaciones
            await getPublications()

            // Retornar en el formato Post esperado
            const post: Post = {
                id: response.data.data.post.id,
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
                    createdAt: new Date(response.data.data.post.createdat),
                    updatedAt: new Date(
                        response.data.data.post.updatedat || response.data.data.post.createdat
                    ),
                },
                pet: {
                    id: response.data.data.pet.id,
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
                        updatedAt: new Date(),
                    },
                    species: response.data.data.pet.species,
                    name: response.data.data.pet.name,
                    gender: response.data.data.pet.gender,
                    age: response.data.data.pet.age,
                    size: response.data.data.pet.size,
                    sterilized: response.data.data.pet.sterilized,
                    adopted: response.data.data.pet.adopted,
                    createdAt: new Date(response.data.data.pet.createdat),
                    updatedAt: new Date(
                        response.data.data.pet.updatedat || response.data.data.pet.createdat
                    ),
                },
                title: response.data.data.post.title,
                description: response.data.data.post.description,
                status: response.data.data.post.status,
                createdAt: new Date(response.data.data.post.createdat),
                updatedAt: new Date(
                    response.data.data.post.updatedat || response.data.data.post.createdat
                ),
            }

            return post
        } catch (e: any) {
            console.error("Error al actualizar publicación:", e)

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
            await http.delete(`/v1/adoptions/publications/${id}`)

            // Refrescar la lista de publicaciones
            await getPublications()
        } catch (e: any) {
            console.error("Error al eliminar publicación:", e)

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
        return publications.filter(
            (pub) =>
                pub.status === "ACTIVE" ||
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
            getPublicationByPostId,
            getPublications,
            createPublication,
            updatePublication,
            deletePublication,
            refreshPublications,
            clearError,
            petsForHome,
        }),
        [publications, loading, error, petsForHome, getPublicationByPostId]
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
