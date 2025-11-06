import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import * as ImagePicker from "expo-image-picker"
import { useAuthContext } from "./AuthContext"
import { Post } from "@/utils/types"
import { toMediaUrl } from "@/utils/mediaUrl"

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

export interface PublicationItem {
    id: string
    name: string
    gender: string
    age: string
    publisher: string
    publisherPhoto?: string | null
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
    getPublications: () => Promise<void>
    createPublication: (data: CreatePublicationPayload) => Promise<Post>
    updatePublication: (id: number, data: UpdatePublicationPayload) => Promise<Post>
    deletePublication: (id: number) => Promise<void>
    refreshPublications: () => Promise<void>
    clearError: () => void
    petsForHome: PublicationItem[]
}

const PublicationContext = createContext<PublicationContextType | null>(null)

export const PublicationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [publications, setPublications] = useState<PublicationItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user, status } = useAuthContext()

    const buildPublicationItem = React.useCallback(
        (post: any, pet: any, creator?: any): PublicationItem => {
            const postImages: string[] = Array.isArray(post?.images) ? post.images : []
            const petImages: string[] = Array.isArray(pet?.images) ? pet.images : []
            const imageUri =
                postImages[0] || petImages[0] || "https://placehold.co/400x400?text=Mascota"

            const years = Number(pet?.age_years ?? 0)
            const months = Number(pet?.age_months ?? 0)
            const ageText =
                years > 0 && months > 0
                    ? `${years} ${years === 1 ? "año" : "años"} y ${months} ${
                          months === 1 ? "mes" : "meses"
                      }`
                    : years > 0
                    ? `${years} ${years === 1 ? "año" : "años"}`
                    : months > 0
                    ? `${months} ${months === 1 ? "mes" : "meses"}`
                    : "Desconocida"

            return {
                id: String(post?.id ?? ""),
                name: pet?.name || "Sin nombre",
                gender: pet?.gender ?? "",
                age: ageText,
                publisher: creator?.name || "Usuario",
                publisherPhoto: creator?.profilePhoto || null,
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
        },
        []
    )

    useEffect(() => {
        if (status === "authenticated") {
            getPublications()
        }
    }, [status])

    async function getPublications(): Promise<void> {
        setLoading(true)
        setError(null)

        try {
            const response = await http.get<{
                status: number
                message: string
                data: {
                    items: Array<{
                        post: any
                        pet: any
                        creator: { id: number; name: string; profilePhoto: string | null } | null
                    }>
                }
            }>("/v1/adoptions/publications?status=active")

            const transformed: PublicationItem[] = response.data.data.items.map((item) =>
                buildPublicationItem(item.post, item.pet, item.creator)
            )

            setPublications(transformed)
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
            if (existing) return existing

            try {
                const response = await http.get<{ data: { post: any; pet: any; creator: any } }>(
                    `/v1/adoptions/publications/${numericId}`
                )

                const { post, pet, creator } = response.data.data || {}
                if (!post || !pet) return null

                const mapped = buildPublicationItem(post, pet, creator)
                setPublications((prev) => {
                    const exists = prev.some((pub) => Number(pub.postId ?? pub.id) === numericId)
                    return exists ? prev : [...prev, mapped]
                })

                return mapped
            } catch (e) {
                console.error("Error al obtener publicación por postId:", e)
                return null
            }
        },
        [publications, buildPublicationItem]
    )

    async function createPublication(data: CreatePublicationPayload): Promise<Post> {
        if (!user) throw new Error("Usuario no autenticado")
        if (user.role !== 20 && user.role !== 21)
            throw new Error("No tienes permisos para crear publicaciones.")

        setLoading(true)
        setError(null)

        try {
            const payload = {
                ownerId: Number(user.id),
                title: data.post.title,
                description: data.post.description,
                species: (String(data.pet.species) ?? "").toLowerCase(),
                gender: (String(data.pet.gender) ?? "").toLowerCase(),
                age_years: data.pet.age,
                age_months: 0,
                size: (String(data.pet.size) ?? "").toLowerCase(),
                sterilized: data.pet.sterilized,
                name: data.pet.name,
            }

            let response
            if (data.images && data.images.length > 0) {
                const form = new FormData()
                Object.entries(payload).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) form.append(k, String(v))
                })
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
                response = await http.post("/v1/adoptions/publications", payload)
            }

            await getPublications()
            return response.data.data.post
        } catch (e: any) {
            console.error("Error al crear publicación:", e)
            const msg = e?.response?.data?.message || "Error al crear la publicación"
            setError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }

    async function updatePublication(id: number, data: UpdatePublicationPayload): Promise<Post> {
        if (!user) throw new Error("Usuario no autenticado")
        setLoading(true)
        setError(null)

        try {
            const payload: any = {}
            if (data.post?.title) payload.title = data.post.title
            if (data.post?.description) payload.description = data.post.description
            if (data.pet?.species) payload.species = String(data.pet.species).toLowerCase()
            if (data.pet?.gender) payload.gender = String(data.pet.gender).toLowerCase()
            if (data.pet?.age !== undefined) {
                payload.age_years = data.pet.age
                payload.age_months = 0
            }
            if (data.pet?.size) payload.size = String(data.pet.size).toLowerCase()
            if (data.pet?.sterilized !== undefined) payload.sterilized = data.pet.sterilized
            if (data.pet?.name !== undefined) payload.name = data.pet.name

            const response = await http.patch(`/v1/adoptions/publications/${id}`, payload)
            await getPublications()
            return response.data.data.post
        } catch (e: any) {
            console.error("Error al actualizar publicación:", e)
            const msg = e?.response?.data?.message || "Error al actualizar la publicación"
            setError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }

    async function deletePublication(id: number): Promise<void> {
        if (!user) throw new Error("Usuario no autenticado")
        setLoading(true)
        setError(null)

        try {
            await http.delete(`/v1/adoptions/publications/${id}`)
            await getPublications()
        } catch (e: any) {
            console.error("Error al eliminar publicación:", e)
            const msg = e?.response?.data?.message || "Error al eliminar la publicación"
            setError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }

    async function refreshPublications(): Promise<void> {
        await getPublications()
    }

    function clearError(): void {
        setError(null)
    }

    const petsForHome = useMemo(
        () =>
            publications.filter(
                (pub) =>
                    pub.status === "ACTIVE" ||
                    pub.status === "active" ||
                    pub.status === "activo" ||
                    !pub.status
            ),
        [publications]
    )

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
    if (!ctx) throw new Error("usePublicationContext must be used within PublicationProvider")
    return ctx
}

export const usePublications = usePublicationContext
