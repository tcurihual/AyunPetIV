import { Request, Response } from "express"
import {
    AdoptionHistory,
    AppResponse,
    AdoptionRequest,
    AuthenticatedRequest,
    AppError,
    sendEmail,
} from "@repo/utils"
import { supabase } from "../index"
import { getMultipleEntityImages, getEntityImages } from "../utils/mediaService"
import {
    adoptionApprovedSubject,
    adoptionApprovedTemplate,
} from "../utils/templates/adoptionApprovedTemplate"
import {
    adoptionCompletedSubject,
    adoptionCompletedTemplate,
} from "../utils/templates/adoptionCompletedTemplate"
import {
    sendAdoptionApprovedNotification,
    sendAdoptionRejectedNotification,
} from "../utils/pushNotifications"

const SPECIES_LABELS: Record<string, string> = {
    dog: "Perro",
    cat: "Gato",
    other: "Otra especie",
}

const GENDER_LABELS: Record<string, string> = {
    male: "Macho",
    female: "Hembra",
}

const SIZE_LABELS: Record<string, string> = {
    small: "Pequeño",
    medium: "Mediano",
    large: "Grande",
}

const DEFAULT_PET_NAME = "Tu nueva mascota"
const DEFAULT_ADOPTER_NAME = "Adoptante"
const DEFAULT_SHELTER_NAME = "Equipo AyünPet"

const titleCase = (value: string): string => {
    if (!value) return value
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const formatEnumValue = (
    value: string | null | undefined,
    labels: Record<string, string>
): string | null => {
    if (!value) return null
    const key = String(value).toLowerCase()
    return labels[key] ?? titleCase(key)
}

const formatAge = (
    years: number | null | undefined,
    months: number | null | undefined
): string | null => {
    const parts: string[] = []
    if (typeof years === "number" && years > 0) {
        parts.push(`${years} ${years === 1 ? "año" : "años"}`)
    }
    if (typeof months === "number" && months > 0) {
        parts.push(`${months} ${months === 1 ? "mes" : "meses"}`)
    }
    if (parts.length === 0) return null
    return parts.join(" y ")
}

type AdoptionEmailContext = {
    adopter: {
        name: string
        email: string | null
    }
    pet: {
        name: string
        species?: string | null
        gender?: string | null
        age?: string | null
        size?: string | null
        sterilized?: string | null
    }
    shelter: {
        name: string
        email: string | null
        address?: string | null
    }
}

const buildAdoptionEmailContext = async (request: {
    post_id?: number | null
    requester_id?: number | null
    post_owner_id?: number | null
}): Promise<AdoptionEmailContext> => {
    const context: AdoptionEmailContext = {
        adopter: {
            name: DEFAULT_ADOPTER_NAME,
            email: null,
        },
        pet: {
            name: DEFAULT_PET_NAME,
            species: null,
            gender: null,
            age: null,
            size: null,
            sterilized: null,
        },
        shelter: {
            name: DEFAULT_SHELTER_NAME,
            email: null,
            address: null,
        },
    }

    const requesterId = Number(request.requester_id)
    const shelterId = Number(request.post_owner_id)
    const userIds = [requesterId, shelterId].filter(
        (id) => Number.isFinite(id) && id > 0
    ) as number[]

    if (userIds.length > 0) {
        const { data: userRows, error: userErr } = await supabase
            .from("users")
            .select("id, name, email, address")
            .in("id", userIds)

        if (userErr) {
            console.error("Error fetching users for adoption email context:", userErr)
        } else if (userRows) {
            const userMap = new Map<
                number,
                { id: number; name?: string | null; email?: string | null; address?: string | null }
            >()
            for (const row of userRows) {
                const id = Number(row.id)
                if (Number.isFinite(id)) {
                    userMap.set(id, row)
                }
            }

            const adopterRow = Number.isFinite(requesterId) ? userMap.get(requesterId) : undefined
            if (adopterRow) {
                context.adopter.name = adopterRow.name || context.adopter.name
                context.adopter.email = adopterRow.email ?? context.adopter.email
            }

            const shelterRow = Number.isFinite(shelterId) ? userMap.get(shelterId) : undefined
            if (shelterRow) {
                context.shelter.name = shelterRow.name || context.shelter.name
                context.shelter.email = shelterRow.email ?? context.shelter.email
                context.shelter.address = shelterRow.address ?? context.shelter.address
            }
        }
    }

    let petId: number | null = null
    let postTitle: string | null = null
    if (request.post_id != null) {
        const { data: postRow, error: postErr } = await supabase
            .from("post")
            .select("pet_id, title")
            .eq("id", request.post_id)
            .maybeSingle()

        if (postErr) {
            console.error("Error fetching post for adoption email context:", postErr)
        } else {
            postTitle = typeof postRow?.title === "string" ? postRow.title : null
            if (postRow?.pet_id != null) {
                petId = Number(postRow.pet_id)
                if (postTitle && context.pet.name === DEFAULT_PET_NAME) {
                    context.pet.name = postTitle
                }
            } else if (postTitle && context.pet.name === DEFAULT_PET_NAME) {
                context.pet.name = postTitle
            }
        }
    }

    if (petId != null && Number.isFinite(petId)) {
        const { data: petRow, error: petErr } = await supabase
            .from("pet")
            .select("name, species, gender, age_years, age_months, size, sterilized")
            .eq("id", petId)
            .maybeSingle()

        if (petErr) {
            console.error("Error fetching pet for adoption email context:", petErr)
        } else if (petRow) {
            context.pet.name = petRow.name || context.pet.name
            context.pet.species =
                formatEnumValue(petRow.species, SPECIES_LABELS) ?? context.pet.species
            context.pet.gender = formatEnumValue(petRow.gender, GENDER_LABELS) ?? context.pet.gender
            context.pet.size = formatEnumValue(petRow.size, SIZE_LABELS) ?? context.pet.size
            context.pet.age =
                formatAge(petRow.age_years as number | null, petRow.age_months as number | null) ??
                context.pet.age
            if (typeof petRow.sterilized === "boolean") {
                context.pet.sterilized = petRow.sterilized ? "Sí" : "No"
            }
        }
    }

    if (postTitle && context.pet.name === DEFAULT_PET_NAME) {
        context.pet.name = postTitle
    }

    return context
}

export const validateCode = async (req: Request, res: Response) => {
    try {
        const { code, request_id, requestId } = req.body as {
            code: string
            request_id?: number
            requestId?: number
        }
        const finalRequestId = request_id || requestId

        if (!code || !finalRequestId) throw new AppError(400, "code y request_id son requeridos")

        const { data: vcode, error: vErr } = await supabase
            .from("verification_code")
            .select("user_id, code, type, expires_at, used")
            .eq("code", code)
            .eq("type", "adoption")
            .eq("used", false)
            .maybeSingle()

        if (vErr) throw new AppError(500, vErr.message)
        if (!vcode) throw new AppError(404, "Código no encontrado o ya utilizado")

        if (vcode.expires_at && new Date() > new Date(vcode.expires_at)) {
            await supabase
                .from("verification_code")
                .delete()
                .eq("code", code)
                .eq("type", "adoption")
            throw new AppError(401, "El código ha expirado")
        }

        const { data: request, error: rErr } = await supabase
            .from("adoption_request")
            .select("id, post_id, requester_id, post_owner_id, status")
            .eq("id", finalRequestId)
            .single()

        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")
        if (request.requester_id !== vcode.user_id)
            throw new AppError(403, "El código no corresponde a esta solicitud")

        if (!request.post_id) {
            throw new AppError(400, "La solicitud no tiene un post asociado")
        }

        const { data: postData, error: postErr } = await supabase
            .from("post")
            .select("pet_id")
            .eq("id", request.post_id)
            .single()

        if (postErr || !postData || !postData.pet_id) {
            throw new AppError(500, "No se pudo obtener la información de la mascota")
        }

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "completed" })
            .eq("id", request.id)
        if (updErr) throw new AppError(500, updErr.message)

        const { error: postUpdateErr } = await supabase
            .from("post")
            .update({ status: "closed", updated_at: new Date().toISOString() })
            .eq("id", request.post_id)
        if (postUpdateErr) {
            console.error("Error al actualizar el estado del post:", postUpdateErr)
            throw new AppError(500, "Error al actualizar el estado del post")
        }

        const { error: petUpdateErr } = await supabase
            .from("pet")
            .update({ adopted: true, updated_at: new Date().toISOString() })
            .eq("id", postData.pet_id)
        if (petUpdateErr) {
            console.error("Error al actualizar el estado de la mascota:", petUpdateErr)
            throw new AppError(500, "Error al actualizar el estado de la mascota")
        }

        const { error: rejectErr } = await supabase
            .from("adoption_request")
            .update({ status: "rejected", updated_at: new Date().toISOString() })
            .eq("post_id", request.post_id)
            .eq("status", "pending")
            .neq("id", request.id)

        if (rejectErr) {
            console.error("Error al rechazar otras solicitudes:", rejectErr)
        }

        await supabase
            .from("verification_code")
            .update({ used: true })
            .eq("code", code)
            .eq("type", "adoption")

        const payload: AdoptionHistory["Insert"] = {
            from_owner_id: request.post_owner_id,
            to_owner_id: request.requester_id,
            pet_id: postData.pet_id,
        }
        const { error: histErr } = await supabase.from("adoption_history").insert([payload])
        if (histErr) throw new AppError(500, histErr.message)

        if (request.requester_id == null) {
            throw new AppError(500, "ID del solicitante no disponible")
        }

        let emailContext: AdoptionEmailContext | null = null
        try {
            emailContext = await buildAdoptionEmailContext({
                post_id: request.post_id,
                requester_id: request.requester_id,
                post_owner_id: request.post_owner_id,
            })
        } catch (err) {
            console.error("Error building adoption email context (completed):", err)
        }

        if (emailContext?.adopter.email) {
            const adopterName = emailContext.adopter.name || DEFAULT_ADOPTER_NAME
            const petName = emailContext.pet.name || DEFAULT_PET_NAME
            const shelterName = emailContext.shelter.name || DEFAULT_SHELTER_NAME
            const adoptionDate = new Date().toLocaleDateString("es-CL", {
                dateStyle: "long",
            })

            const html = adoptionCompletedTemplate({
                adopter: { name: adopterName },
                pet: {
                    name: petName,
                    species: emailContext.pet.species,
                    gender: emailContext.pet.gender,
                    age: emailContext.pet.age,
                    size: emailContext.pet.size,
                    sterilized: emailContext.pet.sterilized,
                },
                adoptionCode: code,
                adoptionDate,
                shelter: {
                    name: shelterName,
                    email: emailContext.shelter.email ?? "",
                    address: emailContext.shelter.address ?? undefined,
                },
                support: {
                    resources: [
                        "Guía de adaptación para los primeros días",
                        "Consejos de alimentación y cuidados recomendados",
                        "Lista de veterinarios y centros aliados de AyünPet",
                    ],
                    emergencyContact: emailContext.shelter.email ?? undefined,
                },
            })

            const subject = adoptionCompletedSubject(petName, adopterName)

            sendEmail({
                to: emailContext.adopter.email,
                subject,
                html,
            }).catch((err) => {
                console.error("Error al enviar correo de adopción completada:", err)
            })
        }

        return AppResponse(res, 200, "Adopción validada y cerrada", { status: "completed" })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}
export const listMyRequests = async (req: Request, res: Response) => {
    try {
        const rawUserId = req.user.id
        const numericUserId = Number(rawUserId)
        if (!Number.isFinite(numericUserId)) {
            throw new AppError(400, "ID de usuario inválido")
        }

        const { data: requests, error: e4 } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("post_owner_id", numericUserId)
            .order("created_at", { ascending: false })
        if (e4) throw new AppError(500, e4.message)

        if (!requests || requests.length === 0) {
            return AppResponse(res, 200, "OK", { as: "giver", requests: [] })
        }

        const headers = {
            "x-user-id": String(req.user?.id ?? 0),
            "x-user-role": String(req.user?.role ?? ""),
        }
        const requestPostIds = (requests ?? []).map((r: any) => r.post_id).filter(Boolean)
        const postImages = await getMultipleEntityImages("post", requestPostIds, headers)

        let petImages: Record<string, string[]> = {}
        const postToPet: Record<number, number> = {}

        if (requestPostIds.length > 0) {
            const { data: postsInfo, error: postsErr } = await supabase
                .from("post")
                .select("id, pet_id")
                .in("id", requestPostIds)
            if (postsErr) throw new AppError(500, postsErr.message)

            const petIds = (postsInfo ?? [])
                .map((p: any) => {
                    if (p?.id && p?.pet_id) {
                        postToPet[p.id] = p.pet_id
                        return p.pet_id
                    }
                    return null
                })
                .filter(Boolean) as number[]

            if (petIds.length > 0) {
                petImages = await getMultipleEntityImages("pet", petIds, headers)
            }
        }

        const requesterIds = Array.from(
            new Set((requests ?? []).map((r: any) => Number(r.requester_id)).filter(Boolean))
        )

        let requesterMap: Record<number, string> = {}
        if (requesterIds.length > 0) {
            const { data: requesterRows, error: requesterErr } = await supabase
                .from("users")
                .select("id, name")
                .in("id", requesterIds)
            if (requesterErr) throw new AppError(500, requesterErr.message)
            requesterMap = (requesterRows ?? []).reduce((acc: Record<number, string>, row: any) => {
                const key = Number(row.id)
                if (Number.isFinite(key)) acc[key] = row.name ?? ""
                return acc
            }, {})
        }

        const requestsWithImages = (requests ?? []).map((r: any) => ({
            ...r,
            postImages: postImages[String(r.post_id)] || [],
            petImages:
                postToPet[r.post_id] !== undefined
                    ? petImages[String(postToPet[r.post_id])] || []
                    : [],
            requester_name: requesterMap[Number(r.requester_id)] || "",
        }))

        return AppResponse(res, 200, "OK", { as: "giver", requests: requestsWithImages })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}

export const confirmAccept = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) throw new AppError(400, "ID inválido")

        const { data: request, error: rErr } = await supabase
            .from("adoption_request")
            .select("id, requester_id, status, post_owner_id, post_id")
            .eq("id", id)
            .single()
        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")

        if (!req.user?.id) throw new AppError(401, "Usuario no autenticado")
        if (request.post_owner_id !== req.user.id)
            throw new AppError(403, "No tienes permiso para aceptar esta solicitud")

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "approved" })
            .eq("id", id)
        if (updErr) throw new AppError(500, updErr.message)

        const { error: postErr } = await supabase
            .from("post")
            .update({
                status: "inactive", // o "in_review", "reserved", etc.
                updated_at: new Date().toISOString(),
            })
            .eq("id", request.post_id as number)

        if (postErr) throw new AppError(500, postErr.message)

        const code = String(Math.floor(100000 + Math.random() * 900000))
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        const { error: vErr } = await supabase.from("verification_code").insert([
            {
                user_id: request.requester_id,
                code,
                type: "adoption",
                expires_at: expiresAt,
                used: false,
            },
        ])
        if (vErr) throw new AppError(500, vErr.message)

        let emailContext: AdoptionEmailContext | null = null
        try {
            emailContext = await buildAdoptionEmailContext({
                post_id: request.post_id,
                requester_id: request.requester_id,
                post_owner_id: request.post_owner_id,
            })
        } catch (err) {
            console.error("Error building adoption email context (approved):", err)
        }

        if (emailContext?.adopter.email) {
            const adopterName = emailContext.adopter.name || DEFAULT_ADOPTER_NAME
            const petName = emailContext.pet.name || DEFAULT_PET_NAME
            const shelterName = emailContext.shelter.name || DEFAULT_SHELTER_NAME
            const codeExpiresAt = new Date(expiresAt).toLocaleString("es-CL", {
                dateStyle: "short",
                timeStyle: "short",
            })

            const html = adoptionApprovedTemplate({
                adopter: { name: adopterName },
                pet: {
                    name: petName,
                    species: emailContext.pet.species,
                    gender: emailContext.pet.gender,
                    age: emailContext.pet.age,
                    size: emailContext.pet.size,
                    sterilized: emailContext.pet.sterilized,
                },
                adoptionCode: code,
                shelter: {
                    name: shelterName,
                    email: emailContext.shelter.email ?? "",
                    address: emailContext.shelter.address ?? undefined,
                },
                codeExpiresAt,
            })

            const subject = adoptionApprovedSubject(petName)

            sendEmail({
                to: emailContext.adopter.email,
                subject,
                html,
            }).catch((err) => {
                console.error("Error al enviar correo de confirmación de adopción:", err)
            })

            // 🔔 Enviar notificación push al adoptante
            if (request.requester_id) {
                sendAdoptionApprovedNotification(
                    request.requester_id,
                    petName,
                    request.id,
                    code
                ).catch((err: any) => {
                    console.error("Error al enviar notificación push de aprobación:", err)
                })
            }
        }

        return AppResponse(res, 200, "Solicitud aceptada", {
            id: request.id,
            confirmationCode: code,
            expiresAt,
        })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}

export const getAdoptionRequests = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        if (id) {
            const numericId = parseInt(id)
            if (isNaN(numericId)) {
                throw new Error("ID debe ser un número válido")
            }

            const { data: adoptionRequest, error } = await supabase
                .from("adoption_request")
                .select("*")
                .eq("id", numericId)
                .maybeSingle()

            if (error || !adoptionRequest) throw new Error("Solicitud de adopción no encontrada")

            let postImages: string[] = []
            if (adoptionRequest?.post_id) {
                const headers = {
                    "x-user-id": String(req.user?.id ?? 0),
                    "x-user-role": String(req.user?.role ?? ""),
                }
                postImages = await getEntityImages("post", adoptionRequest.post_id, headers)
            }

            const requesterPromise = adoptionRequest.requester_id
                ? supabase
                      .from("users")
                      .select("id, name")
                      .eq("id", adoptionRequest.requester_id)
                      .maybeSingle()
                : Promise.resolve({ data: null, error: null } as any)

            const postPromise = adoptionRequest.post_id
                ? supabase
                      .from("post")
                      .select("id, pet_id")
                      .eq("id", adoptionRequest.post_id)
                      .maybeSingle()
                : Promise.resolve({ data: null, error: null } as any)

            const [requesterInfo, postInfo] = await Promise.all([requesterPromise, postPromise])

            let petImages: string[] = []
            if (postInfo.data?.pet_id) {
                const headers = {
                    "x-user-id": String(req.user?.id ?? 0),
                    "x-user-role": String(req.user?.role ?? ""),
                }
                petImages = await getEntityImages("pet", postInfo.data.pet_id, headers)
            }

            return AppResponse(res, 200, "Solicitud de adopción obtenida exitosamente", {
                ...adoptionRequest,
                postImages,
                petImages,
                requester_name: requesterInfo?.data?.name ?? null,
            })
        } else {
            // Filtrar según rol del usuario
            const userRole = req.user?.role
            const userId = req.user?.id

            // Giver/Shelter: devolver solicitudes relacionadas con sus posts/pets
            if (userRole === 21 || userRole === 22) {
                // Reutilizar listMyRequests (ya realiza las consultas y responde)
                return await listMyRequests(req as unknown as Request, res)
            }

            // Adopter (usuario normal): devolver solo sus propias solicitudes
            if (userRole === 20) {
                if (!userId) throw new Error("Usuario no autenticado")
                const numericUserId = Number(userId)

                const { data: adoptionRequests, error } = await supabase
                    .from("adoption_request")
                    .select("*")
                    .eq("requester_id", numericUserId)
                    .order("created_at", { ascending: false })

                if (error) throw new Error("Error al obtener las solicitudes de adopción")

                const postIds = (adoptionRequests ?? []).map((r: any) => r.post_id).filter(Boolean)
                const postImages = await getMultipleEntityImages("post", postIds)

                const requestsWithImages = (adoptionRequests ?? []).map((r: any) => ({
                    ...r,
                    postImages: postImages[String(r.post_id)] || [],
                }))

                return AppResponse(
                    res,
                    200,
                    "Solicitudes de adopción obtenidas exitosamente",
                    requestsWithImages
                )
            }

            const { data: adoptionRequests, error } = await supabase
                .from("adoption_request")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw new Error("Error al obtener las solicitudes de adopción")

            const postIds = (adoptionRequests ?? []).map((r: any) => r.post_id).filter(Boolean)
            const headers = {
                "x-user-id": String(req.user?.id ?? 0),
                "x-user-role": String(req.user?.role ?? ""),
            }
            const postImages = await getMultipleEntityImages("post", postIds, headers)

            const requestsWithImages = (adoptionRequests ?? []).map((r: any) => ({
                ...r,
                postImages: postImages[String(r.post_id)] || [],
            }))

            return AppResponse(
                res,
                200,
                "Solicitudes de adopción obtenidas exitosamente",
                requestsWithImages
            )
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}

export const createAdoptionRequest = async (req: Request, res: Response) => {
    const { post_id, status, message } = req.body

    try {
        if (!post_id) {
            throw new Error("post_id es un campo requerido")
        }

        const { data: post, error: postError } = await supabase
            .from("post")
            .select("id, creator_id")
            .eq("id", post_id)
            .maybeSingle()

        if (postError || !post) {
            throw new Error("Post no encontrado")
        }

        const requester_id = req.user.id
        const post_owner_id = post.creator_id

        if (!post_owner_id) {
            throw new Error("No se pudo determinar el dueño del post")
        }

        if (requester_id === post_owner_id) {
            throw new Error("No puedes solicitar adopción de tu propio post")
        }

        const { data: existingRequests, error: existingError } = await supabase
            .from("adoption_request")
            .select("id")
            .eq("requester_id", requester_id)
            .eq("post_owner_id", post_owner_id)
            .eq("post_id", post_id)
            .eq("status", "pending")

        if (existingError) throw new Error("Error al verificar solicitudes existentes")

        if ((existingRequests ?? []).length > 0) {
            throw new Error("Ya existe una solicitud pendiente para este post")
        }

        const payload: AdoptionRequest["Insert"] = {
            requester_id,
            post_id,
            post_owner_id,
            status: "pending",
            message: message || null,
        }

        const { data: newAdoptionRequest, error: insertError } = await supabase
            .from("adoption_request")
            .insert([payload])
            .select()
            .maybeSingle()

        if (insertError || !newAdoptionRequest)
            throw new Error("Error al crear la solicitud de adopción")

        return AppResponse(
            res,
            201,
            "Solicitud de adopción creada exitosamente",
            newAdoptionRequest
        )
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}

export const updateAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { status } = req.body
    const { message } = req.body

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new Error("ID debe ser un número válido")
        }

        if (!req.user?.id) {
            return AppResponse(res, 401, "Usuario no autenticado", null)
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new Error("Solicitud de adopción no encontrada")

        if (typeof status !== "undefined") {
            if (status === "approved" || status === "completed") {
                if (existingRequest.requester_id === req.user.id) {
                    return AppResponse(
                        res,
                        403,
                        "No tienes permiso para cambiar el estado de esta solicitud",
                        null
                    )
                }

                return AppResponse(
                    res,
                    403,
                    "Para aprobar/confirmar una adopción utiliza los endpoints de confirmación (confirmAccept/validate-code)",
                    null
                )
            }

            if (existingRequest.post_owner_id !== req.user.id) {
                return AppResponse(
                    res,
                    403,
                    "No tienes permiso para cambiar el estado de esta solicitud",
                    null
                )
            }
        }

        if (typeof message !== "undefined" && existingRequest.requester_id !== req.user.id) {
            return AppResponse(
                res,
                403,
                "Solo el usuario que hizo la solicitud puede editar el mensaje",
                null
            )
        }

        if (
            existingRequest.requester_id !== req.user.id &&
            existingRequest.post_owner_id !== req.user.id
        ) {
            return AppResponse(
                res,
                403,
                "No tienes permiso para actualizar esta solicitud de adopción",
                null
            )
        }

        const forbiddenIdFields = ["id", "post_id", "requester_id", "post_owner_id"]
        for (const f of forbiddenIdFields) {
            if (
                typeof (req.body as any)[f] !== "undefined" &&
                (req.body as any)[f] !== (existingRequest as any)[f]
            ) {
                return AppResponse(res, 403, `No tienes permiso para editar el campo ${f}`, null)
            }
        }

        const payload: Partial<AdoptionRequest["Update"]> = {}

        if (
            typeof status !== "undefined" &&
            existingRequest.post_owner_id === req.user.id &&
            status !== existingRequest.status
        ) {
            payload.status = status
        }

        if (
            typeof message !== "undefined" &&
            existingRequest.requester_id === req.user.id &&
            message !== existingRequest.message
        ) {
            payload.message = message
        }

        if (Object.keys(payload).length === 0) {
            return AppResponse(res, 200, "No se realizaron cambios", existingRequest)
        }

        payload.updated_at = new Date().toISOString()

        const { data: updatedRequest, error: updateError } = await supabase
            .from("adoption_request")
            .update(payload)
            .eq("id", numericId)
            .select()
            .maybeSingle()

        if (updateError || !updatedRequest)
            throw new Error("Error al actualizar la solicitud de adopción")

        // 🔔 Enviar notificación push si el estado cambió a "rejected"
        if (
            payload.status === "rejected" &&
            existingRequest.requester_id &&
            existingRequest.post_id
        ) {
            try {
                // Obtener el nombre de la mascota para la notificación
                const { data: post } = await supabase
                    .from("post")
                    .select("id")
                    .eq("id", existingRequest.post_id)
                    .single()

                let petName = "la mascota"
                if (post?.id) {
                    const { data: pet } = await supabase
                        .from("pet")
                        .select("name")
                        .eq("post_id", post.id)
                        .maybeSingle()

                    if (pet?.name) {
                        petName = pet.name
                    }
                }

                // Enviar notificación push de rechazo
                sendAdoptionRejectedNotification(
                    existingRequest.requester_id,
                    petName,
                    numericId,
                    message
                ).catch((err: any) => {
                    console.error("Error al enviar notificación push de rechazo:", err)
                })
            } catch (err) {
                console.error("Error al obtener datos para notificación de rechazo:", err)
            }
        }

        return AppResponse(
            res,
            200,
            "Solicitud de adopción actualizada exitosamente",
            updatedRequest
        )
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}

export const deleteAdoptionRequest = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new Error("ID debe ser un número válido")
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("id, requester_id, post_id")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new Error("Solicitud de adopción no encontrada")

        if (!req.user?.id) return AppResponse(res, 401, "Usuario no autenticado", null)

        if (existingRequest.requester_id !== req.user.id) {
            return AppResponse(
                res,
                403,
                "No tienes permiso para eliminar esta solicitud de adopción",
                null
            )
        }

        const { data: postForms, error: postFormErr } = await supabase
            .from("post_form")
            .select("id")
            .eq("post_id", existingRequest.post_id as number)

        if (postFormErr) {
            console.error("Error obteniendo post_form:", postFormErr)
            return AppResponse(res, 500, "Error al obtener formulario asociado", null)
        }

        const postFormIds = postForms.map((p) => p.id)

        if (postFormIds.length > 0) {
            // 2️⃣ Eliminar form_response asociados al post_form y al usuario
            const { error: deleteFormResponsesErr } = await supabase
                .from("form_response")
                .delete()
                .in("id_post_form", postFormIds)
                .eq("id_user", existingRequest.requester_id)

            if (deleteFormResponsesErr) {
                console.error("Error eliminando respuestas del formulario:", deleteFormResponsesErr)
                return AppResponse(res, 500, "Error al eliminar respuestas del formulario", null)
            }
        }

        const { error: deleteError } = await supabase
            .from("adoption_request")
            .delete()
            .eq("id", numericId)

        if (deleteError) {
            console.error("Error eliminando solicitud:", deleteError)
            return AppResponse(res, 500, "Error al eliminar la solicitud de adopción", null)
        }

        const { error: postUpdateErr } = await supabase
            .from("post")
            .update({
                status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", existingRequest.post_id as number)

        if (postUpdateErr) {
            console.error("Error actualizando estado del post:", postUpdateErr)
            return AppResponse(res, 500, "Solicitud eliminada, pero falló reactivar el post", null)
        }

        return AppResponse(res, 200, "Solicitud de adopción eliminada exitosamente", {})
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}
