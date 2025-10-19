import type { Response } from "express"
import { AppError, AppResponse } from "@repo/utils"
import type {
    AuthenticatedRequest,
    Post,
    Pet,
    PostStatus,
    PetGender,
    PetSpecies,
    PetSize,
} from "@repo/utils"
import { supabase } from "../index"
import { getEntityImages, getMultipleEntityImages } from "../utils/mediaService"

const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21 } as const
const isAdmin = (req: AuthenticatedRequest) => req.user?.role === ROLES.ADMIN
const isSelf = (req: AuthenticatedRequest, userId: number) => req.user?.id === userId

const parseId = (v: string) => {
    const n = Number(v)
    if (isNaN(n)) throw new AppError(400, "ID inválido")
    return n
}

export const listPublications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const ownerId = req.query.ownerId ? Number(req.query.ownerId) : undefined
        const status = req.query.status as PostStatus

        let query = supabase
            .from("post")
            .select("*, pet:pet_id(*)", { count: "exact" })
            .order("id", { ascending: true })

        if (ownerId !== undefined) query = query.eq("creator_id", ownerId)
        if (status) query = query.eq("status", status)

        const page = Math.max(Number(req.query.page ?? 1), 1)
        const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100)
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query.range(from, to)
        if (error) throw new AppError(500, error.message)

        const postIds = (data ?? []).map((row: any) => row.id).filter(Boolean)
        const petIds = (data ?? []).map((row: any) => row.pet_id).filter(Boolean)

        const [postImages, petImages] = await Promise.all([
            getMultipleEntityImages("post", postIds),
            getMultipleEntityImages("pet", petIds),
        ])

        const items = (data ?? []).map((row: any) => ({
            post: {
                id: row.id,
                creator_id: row.creator_id,
                pet_id: row.pet_id,
                title: row.title,
                description: row.description,
                status: row.status,
                created_at: row.created_at,
                updated_at: row.updated_at,
                images: postImages[String(row.id)] || [],
            } as Post["Row"] & { images: string[] },
            pet: {
                ...(row.pet as Pet["Row"]),
                images: petImages[String(row.pet_id)] || [],
            } as Pet["Row"] & { images: string[] },
        }))

        return AppResponse(res, 200, "Listado de publicaciones", {
            items,
            total: count ?? 0,
            page,
            pageSize,
            totalPages: Math.ceil((count ?? 0) / pageSize),
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener publicaciones")
    }
}

export const getPublicationById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)
        const { data, error } = await supabase
            .from("post")
            .select("*, pet:pet_id(*)")
            .eq("id", id)
            .single()

        if (error || !data) throw new AppError(404, "Publicación no encontrada")

        const [postImages, petImages] = await Promise.all([
            getEntityImages("post", data.id),
            data.pet_id ? getEntityImages("pet", data.pet_id) : Promise.resolve([]),
        ])

        const payload = {
            post: {
                id: data.id,
                creator_id: data.creator_id,
                pet_id: data.pet_id,
                title: data.title,
                description: data.description,
                status: data.status,
                created_at: data.created_at,
                updated_at: data.updated_at,
                images: postImages,
            } as Post["Row"] & { images: string[] },
            pet: {
                ...(data.pet as Pet["Row"]),
                images: petImages,
            } as Pet["Row"] & { images: string[] },
        }

        return AppResponse(res, 200, "Publicación", payload)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener la publicación")
    }
}

export const getPetById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)
        const { data, error } = await supabase.from("pet").select("*").eq("id", id).single()

        if (error || !data) throw new AppError(404, "Mascota no encontrada")

        const images = await getEntityImages("pet", data.id)

        const payload = {
            pet: {
                ...(data as Pet["Row"]),
                images,
            } as Pet["Row"] & { images: string[] },
        }

        return AppResponse(res, 200, "Mascota", payload)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener la mascota")
    }
}

export const createPublication = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authedUserId = req.user?.id
        if (!authedUserId) throw new AppError(401, "No autenticado")

        const {
            ownerId,
            title,
            description,
            species,
            gender,
            age_months,
            age_years,
            size,
            sterilized,
            name,
        } = req.body as {
            ownerId: number
            title: string
            description: string
            species: PetSpecies
            gender: PetGender
            age_months: number
            age_years: number
            size: PetSize
            sterilized: boolean
            name?: string | null
        }

        if (
            !ownerId ||
            !title ||
            !description ||
            !species ||
            !gender ||
            size == null ||
            sterilized == null ||
            age_months == null ||
            age_years == null
        ) {
            throw new AppError(400, "Payload inválido")
        }

        if (!isAdmin(req) && !isSelf(req, ownerId))
            throw new AppError(403, "No autorizado para crear publicaciones para otro usuario")

        const petInsert: Pet["Insert"] = {
            owner_id: ownerId,
            name: name ?? null,
            age_months,
            age_years,
            gender,
            size,
            species,
            sterilized,
            adopted: false,
        }
        const { data: pet, error: petErr } = await supabase
            .from("pet")
            .insert([petInsert])
            .select("*")
            .single()
        if (petErr || !pet) throw new AppError(500, petErr?.message ?? "Error al crear la mascota")

        const postInsert: Post["Insert"] = {
            creator_id: ownerId,
            pet_id: pet.id,
            title,
            description,
            status: "active",
        }
        const { data: post, error: postErr } = await supabase
            .from("post")
            .insert([postInsert])
            .select("*")
            .single()

        if (postErr || !post) {
            await supabase.from("pet").delete().eq("id", pet.id)
            throw new AppError(500, postErr?.message ?? "Error al crear la publicación")
        }

        return AppResponse(res, 201, "Publicación creada", { post, pet })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al crear la publicación")
    }
}

export const updatePublication = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)

        const { data: postBefore, error: findErr } = await supabase
            .from("post")
            .select("*")
            .eq("id", id)
            .single()

        if (findErr || !postBefore) throw new AppError(404, "Publicación no encontrada")
        if (!isAdmin(req) && req.user?.id !== postBefore.creator_id)
            throw new AppError(403, "No autorizado para actualizar esta publicación")

        const {
            title,
            description,
            species,
            gender,
            age_months,
            age_years,
            size,
            sterilized,
            name,
        } = req.body as {
            title?: string
            description?: string
            species?: PetSpecies
            gender?: PetGender
            age_months?: number
            age_years?: number
            size?: PetSize
            sterilized?: boolean
            name?: string | null
        }

        const postUpdate: Post["Update"] = {
            title,
            description,
            updated_at: new Date().toISOString(),
        }
        const { data: postAfter, error: postErr } = await supabase
            .from("post")
            .update(postUpdate)
            .eq("id", id)
            .select("*")
            .maybeSingle()

        if (postErr || !postAfter)
            throw new AppError(500, postErr?.message ?? "Error al actualizar el post")

        const petUpdate: Pet["Update"] = {
            name,
            age_months,
            age_years,
            gender,
            size,
            species,
            sterilized,
        }
        const { data: petAfter, error: petErr } = await supabase
            .from("pet")
            .update(petUpdate)
            .eq("id", postBefore.pet_id!)
            .select("*")
            .maybeSingle()

        if (petErr || !petAfter) {
            const restorePost: Post["Update"] = {
                title: postBefore.title,
                description: postBefore.description,
                updated_at: postBefore.updated_at,
                pet_id: postBefore.pet_id,
                status: postBefore.status,
                creator_id: postBefore.creator_id,
                created_at: postBefore.created_at,
            }
            await supabase.from("post").update(restorePost).eq("id", id)
            throw new AppError(500, petErr?.message ?? "Error al actualizar la mascota")
        }

        return AppResponse(res, 200, "Publicación actualizada", {
            post: postAfter,
            pet: petAfter,
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al actualizar la publicación")
    }
}

export const deletePublication = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)

        const { data: postRow, error: postFindErr } = await supabase
            .from("post")
            .select("*")
            .eq("id", id)
            .single()

        if (postFindErr || !postRow) throw new AppError(404, "Publicación no encontrada")
        if (!isAdmin(req) && req.user?.id !== postRow.creator_id)
            throw new AppError(403, "No autorizado para eliminar esta publicación")

        const petId = postRow.pet_id
        let petRow: Pet["Row"] | null = null

        if (petId != null) {
            const { data: pr, error: petFindErr } = await supabase
                .from("pet")
                .select("*")
                .eq("id", petId)
                .single()
            if (petFindErr) throw new AppError(500, petFindErr.message)
            petRow = pr as Pet["Row"]
        }

        const tables = ["adoption_request", "message", "report"] as const
        for (const t of tables) {
            const { error } = await supabase.from(t).delete().eq("post_id", id)
            if (error)
                throw new AppError(500, `Error al eliminar dependencias (${t}): ${error.message}`)
        }

        if (petId != null) {
            const { error: histErr } = await supabase
                .from("adoption_history")
                .delete()
                .eq("pet_id", petId)
            if (histErr)
                throw new AppError(
                    500,
                    `Error al eliminar historial de adopciones: ${histErr.message}`
                )

            const { error: petDelErr } = await supabase.from("pet").delete().eq("id", petId)
            if (petDelErr) throw new AppError(500, petDelErr.message)
        }

        const { error: postDelErr } = await supabase.from("post").delete().eq("id", id)
        if (postDelErr) throw new AppError(500, postDelErr.message)

        return AppResponse(res, 200, "Publicación eliminada", {
            post: postRow as Post["Row"],
            pet: petRow,
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al eliminar la publicación")
    }
}
