import type { Response } from "express"
import { AppError, AppResponse } from "@repo/utils"
import type { AuthenticatedRequest, Post, Pet } from "@repo/utils"
import { supabase } from "../index"

const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21 } as const
const isAdmin = (req: AuthenticatedRequest) => req.user?.role === ROLES.ADMIN
const isSelf = (req: AuthenticatedRequest, userId: number) => req.user?.id === userId

const parseId = (v: string) => {
    const n = Number(v)
    if (!Number.isFinite(n)) throw new AppError(400, "ID inválido")
    return n
}

export const listPublications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const ownerId = req.query.ownerId ? Number(req.query.ownerId) : undefined
        const status = req.query.status ? String(req.query.status) : undefined

        let query = supabase
            .from("post")
            .select("*, pet:petid(*)", { count: "exact" })
            .order("id", { ascending: true })

        if (ownerId !== undefined) query = query.eq("creatorid", ownerId)
        if (status) query = query.eq("status", status)

        const page = Math.max(Number(req.query.page ?? 1), 1)
        const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100)
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query.range(from, to)
        if (error) throw new AppError(500, error.message)

        const items = (data ?? []).map((row: any) => ({
            post: {
                id: row.id,
                creatorid: row.creatorid,
                petid: row.petid,
                title: row.title,
                description: row.description,
                status: row.status,
                createdat: row.createdat,
                updatedat: row.updatedat,
            } as Post["Row"],
            pet: row.pet as Pet["Row"],
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
            .select("*, pet:petid(*)")
            .eq("id", id)
            .single()

        if (error || !data) throw new AppError(404, "Publicación no encontrada")

        const payload = {
            post: {
                id: data.id,
                creatorid: data.creatorid,
                petid: data.petid,
                title: data.title,
                description: data.description,
                status: data.status,
                createdat: data.createdat,
                updatedat: data.updatedat,
            } as Post["Row"],
            pet: data.pet as Pet["Row"],
        }

        return AppResponse(res, 200, "Publicación", payload)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener la publicación")
    }
}

export const createPublication = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authedUserId = req.user?.id
        if (!authedUserId) throw new AppError(401, "No autenticado")

        const { ownerId, title, description, species, gender, age, size, sterilized, name } =
            req.body as {
                ownerId: number
                title: string
                description: string
                species: string
                gender: string
                age: number
                size: string
                sterilized: boolean
                name?: string | null
            }

        if (
            !ownerId ||
            !title ||
            !description ||
            !species ||
            !gender ||
            age == null ||
            !size ||
            sterilized == null
        ) {
            throw new AppError(400, "Payload inválido")
        }
        if (!isAdmin(req) && !isSelf(req, ownerId)) {
            throw new AppError(403, "No autorizado para crear publicaciones para otro usuario")
        }

        const petInsert: Pet["Insert"] = {
            ownerid: ownerId,
            name: name ?? null,
            age,
            gender,
            size,
            species,
            sterilized,
            adopted: false,
            createdat: new Date().toISOString(),
            updatedat: null,
        }
        const { data: pet, error: petErr } = await supabase
            .from("pet")
            .insert([petInsert])
            .select("*")
            .single()
        if (petErr || !pet) throw new AppError(500, petErr?.message ?? "Error al crear la mascota")

        const postInsert: Post["Insert"] = {
            creatorid: ownerId,
            petid: pet.id,
            title,
            description,
            status: "ACTIVE",
            createdat: new Date().toISOString(),
            updatedat: null,
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
        if (!isAdmin(req) && req.user?.id !== postBefore.creatorid) {
            throw new AppError(403, "No autorizado para actualizar esta publicación")
        }

        const { title, description, species, gender, age, size, sterilized, name } = req.body as {
            title?: string
            description?: string
            species?: string
            gender?: string
            age?: number
            size?: string
            sterilized?: boolean
            name?: string | null
        }

        const postUpdate: Post["Update"] = {
            title,
            description,
            updatedat: new Date().toISOString(),
        }
        const { data: postAfter, error: postErr } = await supabase
            .from("post")
            .update(postUpdate)
            .eq("id", id)
            .select("*")
            .single()

        if (postErr || !postAfter)
            throw new AppError(500, postErr?.message ?? "Error al actualizar el post")

        const petUpdate: Pet["Update"] = {
            name: name ?? undefined,
            age,
            gender,
            size,
            species,
            sterilized,
            updatedat: new Date().toISOString(),
        }
        const { data: petAfter, error: petErr } = await supabase
            .from("pet")
            .update(petUpdate)
            .eq("id", postBefore.petid!)
            .select("*")
            .single()

        if (petErr || !petAfter) {
            // rollback: restaurar post previo
            const restorePost: Post["Update"] = {
                title: postBefore.title,
                description: postBefore.description,
                updatedat: postBefore.updatedat,
                petid: postBefore.petid,
                status: postBefore.status,
                creatorid: postBefore.creatorid,
                createdat: postBefore.createdat,
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
        if (!isAdmin(req) && req.user?.id !== postRow.creatorid) {
            throw new AppError(403, "No autorizado para eliminar esta publicación")
        }

        const petId = postRow.petid
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

        const { error: unlinkErr } = await supabase
            .from("post")
            .update({ petid: null, updatedat: new Date().toISOString() })
            .eq("id", id)
        if (unlinkErr) throw new AppError(500, unlinkErr.message)

        if (petId != null) {
            const { error: petDelErr } = await supabase.from("pet").delete().eq("id", petId)
            if (petDelErr) {
                await supabase.from("post").update({ petid: petId }).eq("id", id)
                throw new AppError(500, petDelErr.message)
            }
        }

        const tables = ["adoption_request", "message", "report", "adoption_history"] as const
        for (const t of tables) {
            const { error } = await supabase.from(t).delete().eq("postid", id)
            if (error) {
                if (petRow && petId != null) {
                    await supabase.from("pet").insert([
                        {
                            id: petRow.id,
                            ownerid: petRow.ownerid,
                            name: petRow.name,
                            age: petRow.age,
                            gender: petRow.gender,
                            size: petRow.size,
                            species: petRow.species,
                            sterilized: petRow.sterilized,
                            adopted: petRow.adopted,
                            createdat: petRow.createdat,
                            updatedat: petRow.updatedat,
                        } as Pet["Insert"],
                    ])
                    await supabase.from("post").update({ petid: petId }).eq("id", id)
                }
                throw new AppError(500, `Error al eliminar dependencias (${t}): ${error.message}`)
            }
        }

        const { error: postDelErr } = await supabase.from("post").delete().eq("id", id)
        if (postDelErr) {
            if (petRow && petId != null) {
                await supabase.from("pet").insert([
                    {
                        id: petRow.id,
                        ownerid: petRow.ownerid,
                        name: petRow.name,
                        age: petRow.age,
                        gender: petRow.gender,
                        size: petRow.size,
                        species: petRow.species,
                        sterilized: petRow.sterilized,
                        adopted: petRow.adopted,
                        createdat: petRow.createdat,
                        updatedat: petRow.updatedat,
                    } as Pet["Insert"],
                ])
                await supabase.from("post").update({ petid: petId }).eq("id", id)
            }
            throw new AppError(500, postDelErr.message)
        }

        return AppResponse(res, 200, "Publicación eliminada", {
            post: postRow as Post["Row"],
            pet: petRow,
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al eliminar la publicación")
    }
}
