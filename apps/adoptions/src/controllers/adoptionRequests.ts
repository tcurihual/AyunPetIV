import { Request, Response } from "express"
import {
    AdoptionHistory,
    AppResponse,
    AdoptionRequest,
    AuthenticatedRequest,
    AppError,
} from "@repo/utils"
import { nanoid } from "nanoid"
import { supabase } from "../index"
import { getMultipleEntityImages, getEntityImages } from "../utils/mediaService"

export const validateCode = async (req: Request, res: Response) => {
    try {
        const { code, requestId } = req.body as { code: string; requestId: number }
        if (!code || !requestId) throw new AppError(400, "code y requestId son requeridos")

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
            .eq("id", requestId)
            .single()

        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")
        if (request.requester_id !== vcode.user_id)
            throw new AppError(403, "El código no corresponde a esta solicitud")

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "completed" })
            .eq("id", request.id)
        if (updErr) throw new AppError(500, updErr.message)

        await supabase
            .from("verification_code")
            .update({ used: true })
            .eq("code", code)
            .eq("type", "adoption")

        const payload: AdoptionHistory["Insert"] = {
            from_owner_id: request.post_owner_id,
            to_owner_id: request.requester_id,
            pet_id: request.post_id,
        }
        const { error: histErr } = await supabase.from("adoption_history").insert([payload])
        if (histErr) throw new AppError(500, histErr.message)

        return AppResponse(res, 200, "Adopción validada y cerrada", { status: "completed" })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}
export const listMyRequests = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        const role = req.user.role
        const { data: myCreatedPosts, error: e1 } = await supabase
            .from("post")
            .select("id")
            .eq("creator_id", userId)
        if (e1) throw new AppError(500, e1.message)

        const { data: myPets, error: e2 } = await supabase
            .from("pet")
            .select("id")
            .eq("owner_id", userId)
        if (e2) throw new AppError(500, e2.message)

        let petIds: number[] = (myPets ?? []).map((p) => p.id)
        let postIdsByPets: number[] = []
        if (petIds.length > 0) {
            const { data: postsByPets, error: e3 } = await supabase
                .from("post")
                .select("id")
                .in("pet_id", petIds)
            if (e3) throw new AppError(500, e3.message)
            postIdsByPets = (postsByPets ?? []).map((p) => p.id)
        }

        const postIdSet = new Set<number>([
            ...(myCreatedPosts ?? []).map((p) => p.id),
            ...postIdsByPets,
        ])
        const allPostIds = Array.from(postIdSet)

        if (allPostIds.length === 0) {
            return AppResponse(res, 200, "OK", { as: "giver", requests: [] })
        }

        const { data: requests, error: e4 } = await supabase
            .from("adoption_request")
            .select("*")
            .in("post_id", allPostIds)
            .order("created_at", { ascending: false })
        if (e4) throw new AppError(500, e4.message)

        const requestPostIds = (requests ?? []).map((r: any) => r.post_id).filter(Boolean)
        const postImages = await getMultipleEntityImages("post", requestPostIds)
        const petImages = await getMultipleEntityImages("pet", petIds)

        const requestsWithImages = (requests ?? []).map((r: any) => ({
            ...r,
            postImages: postImages[String(r.post_id)] || [],
            petImages: petImages[String(r.post_id)] || [],
        }))

        return AppResponse(res, 200, "OK", { as: "giver", requests: requestsWithImages })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}

export const confirmAccept = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) throw new AppError(400, "ID inválido")

        const { data: request, error: rErr } = await supabase
            .from("adoption_request")
            .select("id, requester_id, status")
            .eq("id", id)
            .single()
        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "approved" })
            .eq("id", id)
        if (updErr) throw new AppError(500, updErr.message)

        const code = nanoid(8)
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
                postImages = await getEntityImages("post", adoptionRequest.post_id)
            }

            return AppResponse(res, 200, "Solicitud de adopción obtenida exitosamente", {
                ...adoptionRequest,
                postImages,
            })
        } else {
            // Filtrar según rol del usuario
            const userRole = req.user?.role
            const userId = req.user?.id

            // Giver: devolver solicitudes relacionadas con sus posts/pets
            if (userRole === 21) {
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

            // Admin or other roles: mantener comportamiento previo (todas las solicitudes)
            const { data: adoptionRequests, error } = await supabase
                .from("adoption_request")
                .select("*")
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
            status: status || "pending",
            // Guardar el mensaje si viene del cliente (puede ser vacío)
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

export const updateAdoptionRequest = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status } = req.body

    // Allow optional message update from requester
    const { message } = req.body

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new Error("ID debe ser un número válido")
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new Error("Solicitud de adopción no encontrada")

        if (
            (status === "approved" || status === "completed") &&
            existingRequest.post_owner_id !== req.user.id
        ) {
            return AppResponse(
                res,
                403,
                status === "approved"
                    ? "No tienes permiso para aprobar esta solicitud"
                    : "No tienes permiso para marcar esta solicitud como completada",
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

        const payload: AdoptionRequest["Update"] = {
            status: status || existingRequest.status,
            // Only allow updating message if the requester is the one making the change
            ...(typeof message !== "undefined" ? { message } : {}),
            updated_at: new Date().toISOString(),
        }

        const { data: updatedRequest, error: updateError } = await supabase
            .from("adoption_request")
            .update(payload)
            .eq("id", numericId)
            .select()
            .maybeSingle()

        if (updateError || !updatedRequest)
            throw new Error("Error al actualizar la solicitud de adopción")

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
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new Error("Solicitud de adopción no encontrada")

        if (existingRequest.requester_id !== req.user.id) {
            throw new Error("No tienes permiso para eliminar esta solicitud de adopción")
        }

        const { error: deleteError } = await supabase
            .from("adoption_request")
            .delete()
            .eq("id", numericId)

        if (deleteError) throw new Error("Error al eliminar la solicitud de adopción")

        return AppResponse(null as any, 200, "Solicitud de adopción eliminada exitosamente", {})
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(null as any, 500, message, null)
    }
}
