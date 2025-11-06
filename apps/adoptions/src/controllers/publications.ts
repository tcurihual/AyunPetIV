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
import axios from "axios"
import { supabase } from "../index"
import { getEntityImages, getMultipleEntityImages } from "../utils/mediaService"
import { MEDIA_URL, MEDIA_PUBLIC_URL } from "@repo/utils"

const normalizeMediaUrls = (list: any[] | undefined) => {
    const arr = Array.isArray(list) ? list : []
    return arr.map((u) => {
        try {
            if (!u) return u
            const idx = String(u).indexOf("/uploads/")
            if (idx !== -1) {
                const rel = String(u).substring(idx + 1)
                return `${MEDIA_PUBLIC_URL}/${rel}`
            }
            return u
        } catch (e) {
            return u
        }
    })
}

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
            .select(
                `
        *,
        pet:pet_id (
            id,
            name,
            species,
            gender,
            size,
            sterilized,
            adopted,
            age_years,
            age_months
        )
    `,
                { count: "exact" }
            )
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
        const creatorIds = [
            ...new Set((data ?? []).map((row: any) => row.creator_id).filter(Boolean)),
        ]

        // Usar únicamente el entityType "publications" para las imágenes
        const headers = req.user
            ? {
                  "x-user-id": String(req.user.id),
                  "x-user-role": String(req.user.role ?? ""),
              }
            : undefined
        const postImages = await getMultipleEntityImages("publications", postIds, headers)

        // Obtener información de los creadores
        const creatorsMap: Record<
            string,
            { id: number; name: string; profilePhoto: string | null }
        > = {}
        if (creatorIds.length > 0) {
            const { data: creators } = await supabase
                .from("users")
                .select("id, name")
                .in("id", creatorIds)

            if (creators) {
                // foto de perfil
                const userPhotos = await getMultipleEntityImages("user", creatorIds, headers)

                creators.forEach((creator: any) => {
                    const photos = userPhotos[String(creator.id)] || []
                    creatorsMap[String(creator.id)] = {
                        id: creator.id,
                        name: creator.name,
                        profilePhoto: photos.length > 0 ? photos[0] : null,
                    }
                })
            }
        }

        const items = (data ?? []).map((row: any) => {
            const pImages = postImages[String(row.id)] || []
            const creator = creatorsMap[String(row.creator_id)] || null

            return {
                post: {
                    id: row.id,
                    creator_id: row.creator_id,
                    pet_id: row.pet_id,
                    title: row.title,
                    description: row.description,
                    status: row.status,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    images: pImages,
                } as Post["Row"] & { images: string[] },
                pet: {
                    ...(row.pet as Pet["Row"]),
                    images: pImages, // también exponer las imágenes de la publicación en la mascota
                } as Pet["Row"] & { images: string[] },
                creator: creator,
            }
        })

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
            .select(
                `
      id,
      creator_id,
      pet_id,
      title,
      description,
      status,
      created_at,
      updated_at,
      pet:pet_id (
          id,
          name,
          species,
          gender,
          size,
          sterilized,
          adopted,
          age_years,
          age_months
      )
  `
            )
            .eq("id", id)
            .maybeSingle()

        if (error || !data) throw new AppError(404, "Publicación no encontrada")

        // Obtener imágenes asociadas a la publicación (entityType = "publications")
        const headers = req.user
            ? {
                  "x-user-id": String(req.user.id),
                  "x-user-role": String(req.user.role ?? ""),
              }
            : undefined
        // pasar headers para que el servicio media permita la consulta
        const postImages = await getEntityImages("publications", data.id, headers)

        // Obtener información del creador
        let creator: { id: number; name: string; profilePhoto: string | null } | null = null
        if (data.creator_id) {
            const { data: creatorData } = await supabase
                .from("users")
                .select("id, name")
                .eq("id", data.creator_id)
                .single()

            if (creatorData) {
                const userPhotos = await getEntityImages("user", data.creator_id, headers)
                creator = {
                    id: creatorData.id,
                    name: creatorData.name,
                    profilePhoto: userPhotos.length > 0 ? userPhotos[0] : null,
                }
            }
        }

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
                images: postImages, // también exponer las imágenes de la publicación en la mascota
            } as Pet["Row"] & { images: string[] },
            creator: creator,
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
            owner_id,
            title,
            description,
            species,
            gender,
            age_months,
            age_years,
            size,
            sterilized,
            name,
        } = req.body as any

        const ownerIdNumFromBody = owner_id !== undefined ? Number(owner_id) : undefined
        const ageMonthsNum = age_months !== undefined ? Number(age_months) : undefined
        const ageYearsNum = age_years !== undefined ? Number(age_years) : undefined

        const ownerIdFinal = ownerIdNumFromBody ?? authedUserId

        if (!isAdmin(req) && ownerIdFinal !== authedUserId) {
            throw new AppError(403, "No autorizado para crear publicaciones para otro usuario")
        }

        // Validación mínima de payload: ahora ownerIdFinal siempre existe (porque al menos tenemos authedUserId)
        if (
            !ownerIdFinal ||
            !title ||
            !description ||
            !species ||
            !gender ||
            size == null ||
            sterilized == null ||
            ageMonthsNum == null ||
            ageYearsNum == null
        ) {
            throw new AppError(400, "Payload inválido")
        }

        const { data: ownerRow, error: ownerErr } = await supabase
            .from("users")
            .select("id")
            .eq("id", ownerIdFinal)
            .maybeSingle()

        if (ownerErr) {
            console.error("Error al verificar owner en BD:", ownerErr)
            throw new AppError(500, "Error al verificar propietario")
        }
        if (!ownerRow) {
            throw new AppError(404, "Usuario propietario (owner) no encontrado")
        }

        // Validar que se hayan enviado archivos (imágenes obligatorias)
        const files = req.files as Express.Multer.File[] | undefined

        if (!files || files.length === 0) {
            throw new AppError(400, "Se debe proporcionar al menos una imagen de la mascota")
        }

        const petInsert: Pet["Insert"] = {
            owner_id: ownerIdFinal,
            name: name ?? null,
            age_months: ageMonthsNum,
            age_years: ageYearsNum,
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
            creator_id: ownerIdFinal,
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

        let uploadedImages: any[] = []
        try {
            // Los archivos ya fueron validados antes, así que siempre hay files aquí
            if (files && files.length > 0) {
                const FormDataNode = (await import("form-data")).default
                const formData = new FormDataNode()

                files.forEach((file) => {
                    formData.append("files", file.buffer, {
                        filename: file.originalname,
                        contentType: file.mimetype,
                    })
                })

                const mediaResponse = await axios.post(
                    `${MEDIA_URL}/uploads/publications/${post.id}`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            "x-user-id": String(req.user?.id ?? 0),
                            "x-user-role": String(req.user?.role ?? ""),
                        },
                        timeout: 10000,
                    }
                )

                uploadedImages = normalizeMediaUrls(mediaResponse.data.data || [])
            }
        } catch (mediaError: any) {
            console.error("Error al subir imágenes de la publicación:", mediaError?.message)
            try {
                await supabase.from("post").delete().eq("id", post.id)
                await supabase.from("pet").delete().eq("id", pet.id)
            } catch (cleanupErr) {
                console.error("Error limpiando BD tras fallo de media:", cleanupErr)
            }
            throw new AppError(500, "Error al subir las imágenes de la publicación")
        }

        return AppResponse(res, 201, "Publicación creada", { post, pet, images: uploadedImages })
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

        // Cuando el request viene como multipart/form-data (con files) los
        // valores en req.body son strings. Normalizar y filtrar los campos
        // para no enviar empty-strings o valores mal tipados a Supabase.
        const rawBody = req.body as Record<string, any>

        const parseNumber = (v: any) => {
            if (v === undefined || v === null || v === "") return undefined
            const n = Number(v)
            return Number.isNaN(n) ? undefined : n
        }
        const parseBoolean = (v: any) => {
            if (v === undefined || v === null || v === "") return undefined
            if (typeof v === "boolean") return v
            if (v === "1" || v === "true") return true
            if (v === "0" || v === "false") return false
            return undefined
        }

        const title = rawBody.title as string | undefined
        const description = rawBody.description as string | undefined
        const species = (rawBody.species as PetSpecies | undefined) || undefined
        const gender = (rawBody.gender as PetGender | undefined) || undefined
        const age_months = parseNumber(rawBody.age_months)
        const age_years = parseNumber(rawBody.age_years)
        const size = (rawBody.size as PetSize | undefined) || undefined
        const sterilized = parseBoolean(rawBody.sterilized)
        const name = rawBody.name as string | undefined

        const postUpdate: Post["Update"] = {
            // si title/description vienen como empty-string los convertimos a undefined
            ...(title !== undefined && title !== "" ? { title } : {}),
            ...(description !== undefined && description !== "" ? { description } : {}),
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

        // Construir objeto de actualización sólo con campos presentes y válidos
        const petUpdate: Pet["Update"] = {}
        if (name !== undefined && name !== "") petUpdate.name = name
        if (age_months !== undefined) petUpdate.age_months = age_months
        if (age_years !== undefined) petUpdate.age_years = age_years
        if (gender !== undefined) petUpdate.gender = gender
        if (size !== undefined) petUpdate.size = size
        if (species !== undefined) petUpdate.species = species
        if (sterilized !== undefined) petUpdate.sterilized = sterilized

        // Si no hay campos para actualizar en la mascota, no ejecutar update
        // y obtener la fila actual para devolverla.
        let petAfter: Pet["Row"] | null = null

        try {
            if (postBefore.pet_id == null) {
                petAfter = null
            } else if (Object.keys(petUpdate).length === 0) {
                const { data: pr, error: petFindErr } = await supabase
                    .from("pet")
                    .select("*")
                    .eq("id", postBefore.pet_id)
                    .single()
                if (petFindErr || !pr) {
                    console.error(
                        "Error al obtener la mascota después de actualización (no hubo cambios):",
                        petFindErr
                    )
                    throw new AppError(500, petFindErr?.message ?? "Error al obtener la mascota")
                }
                petAfter = pr as Pet["Row"]
            } else {
                const { data: petData, error: petErr } = await supabase
                    .from("pet")
                    .update(petUpdate)
                    .eq("id", postBefore.pet_id!)
                    .select("*")
                    .maybeSingle()

                if (petErr || !petData) {
                    // Loguear detalle para depuración antes de intentar restaurar
                    console.error("Error al actualizar la mascota (supabase):", petErr)
                    console.error("petUpdate:", petUpdate)
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

                petAfter = petData as Pet["Row"]
            }
        } catch (err) {
            // Re-throw AppError
            if (err instanceof AppError) throw err
            console.error("Error inesperado al manejar la mascota:", err)
            throw new AppError(500, "Error al actualizar la mascota")
        }

        // Subir nuevas imágenes si existen
        let uploadedImages: any[] = []
        try {
            const files = req.files as Express.Multer.File[] | undefined
            if (files && files.length > 0) {
                const FormDataNode = (await import("form-data")).default
                const formData = new FormDataNode()

                files.forEach((file) => {
                    formData.append("files", file.buffer, {
                        filename: file.originalname,
                        contentType: file.mimetype,
                    })
                })

                const mediaResponse = await axios.post(
                    `${MEDIA_URL}/uploads/publications/${id}`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            "x-user-id": String(req.user?.id ?? 0),
                            "x-user-role": String(req.user?.role ?? ""),
                        },
                    }
                )

                uploadedImages = mediaResponse.data.data || []
            }
        } catch (mediaError: any) {
            console.error(
                "❌ Error al subir nuevas imágenes de la publicación:",
                mediaError?.message
            )
            // No revertimos la actualización, solo registramos
        }

        // Obtener todas las imágenes actuales
        let allImages: string[] = []
        try {
            const mediaResponse = await axios.get(`${MEDIA_URL}/uploads/publications/${id}`, {
                headers: {
                    "x-user-id": String(req.user?.id ?? 0),
                    "x-user-role": String(req.user?.role ?? ""),
                },
            })
            allImages = normalizeMediaUrls(mediaResponse.data.data || [])
        } catch (err) {
            // continuar si no hay imágenes
        }

        return AppResponse(res, 200, "Publicación actualizada", {
            post: postAfter,
            pet: petAfter,
            images: allImages,
            newImages: uploadedImages,
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

        // Antes de eliminar la publicación, obtener imágenes asociadas y pedir al servicio media que las borre
        let imagesToDelete: string[] = []
        try {
            const mediaResponse = await axios.get(`${MEDIA_URL}/uploads/publications/${id}`, {
                headers: {
                    "x-user-id": String(req.user?.id ?? 0),
                    "x-user-role": String(req.user?.role ?? ""),
                },
            })
            const imageUrls = normalizeMediaUrls(mediaResponse.data.data || [])
            imagesToDelete = imageUrls.map((url: string) => url.split("/").pop() || "")
        } catch (err) {
            // continuar aunque no haya imágenes
        }

        if (imagesToDelete.length > 0) {
            try {
                await axios.delete(`${MEDIA_URL}/uploads/publications/${id}`, {
                    data: { fileNamesArray: imagesToDelete },
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": String(req.user?.id ?? 0),
                        "x-user-role": String(req.user?.role ?? ""),
                    },
                })
            } catch (mediaError: any) {
                console.error("Error al eliminar imágenes en media:", mediaError?.message)
                // continuamos con la eliminación en BD
            }
        }

        const { error: postDelErr } = await supabase.from("post").delete().eq("id", id)
        if (postDelErr) throw new AppError(500, postDelErr.message)

        return AppResponse(res, 200, "Publicación eliminada", {
            post: postRow as Post["Row"],
            pet: petRow,
            deletedImages: imagesToDelete.length,
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al eliminar la publicación")
    }
}
