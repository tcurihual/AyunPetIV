import { Request, Response } from "express"
import { AdoptionHistory, AppResponse, AdoptionRequest, AuthenticatedRequest } from "@repo/utils"
import { nanoid } from "nanoid"
import { supabase } from "../index"
import { getMultipleEntityImages, getEntityImages } from "../utils/mediaService"

export const validateCode = async (req: Request, res: Response) => {
    const { code } = req.body
    // TODO: implementación del uso del codigo correctamente buscandolo
    // en su respectiva tabla
    try {
        const { data: request, error: reqError } = await supabase
            .from("adoption_request")
            .select("id, post_id, requester_id, post_owner_id, status")
            .eq("confirmation_code", code)
            .single()

        if (reqError || !request) throw new Error("Código inválido o no encontrado")

        if (!request.id) throw new Error("Solicitud no asociada a una publicación válida")

        const { error: updateError } = await supabase
            .from("adoption_request")
            .update({ status: "completed" })
            .eq("id", request.id)

        if (updateError) throw new Error(updateError.message)
        // FIXME: se esta guardando en la id del owner el id del post,
        // se debe buscar el post con su id y usar post.creator_id,
        // lo mismo con pet_id
        const payload: AdoptionHistory["Insert"] = {
            from_owner_id: request.post_owner_id,
            to_owner_id: request.requester_id,
            pet_id: request.post_id,
        }

        const { error: historyError } = await supabase.from("adoption_history").insert([payload])

        if (historyError) throw new Error(historyError.message)

        return AppResponse(res, 200, "Adopción validada y cerrada", {
            status: "completed",
        })
    } catch (e) {
        if (e instanceof Error) {
            return AppResponse(res, 500, e.message, null)
        }
        return AppResponse(res, 500, "Error desconocido", null)
    }
}

export const listMyRequests = async (req: Request, res: Response) => {
    const userId = req.user.id
    const role = req.user.role
    // TODO: ahora esta presente la id de la entidad a la que le hacen
    // las request, usar eso

    // FIXME: porque role 1? no existe ningun role 1 en al bd,
    //  nunca entrara a ese if
    // ademas como tal no deberia de verificar roles si ya existe el middleware
    if (role === 1) {
        const { data, error } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("userid", userId)
            .order("createdat", { ascending: false })
        // FIXME: AppError
        if (error) return AppResponse(res, 500, error.message, null)
        return AppResponse(res, 200, "OK", { as: "adopter", requests: data ?? [] })
    }

    const { data: myCreatedPosts, error: e1 } = await supabase
        .from("post")
        .select("id")
        .eq("creator_id", userId)
    if (e1) return AppResponse(res, 500, e1.message, null)

    const { data: myPets, error: e2 } = await supabase
        .from("pet")
        .select("id")
        .eq("owner_id", userId)
    if (e2) return AppResponse(res, 500, e2.message, null)

    let petIds: number[] = (myPets ?? []).map((p) => p.id)
    let postIdsByPets: number[] = []
    if (petIds.length > 0) {
        const { data: postsByPets, error: e3 } = await supabase
            .from("post")
            .select("id")
            .in("pet_id", petIds)
        // FIXME
        // se AppResponse se usa para respuestas validas
        // usar AppError
        if (e3) return AppResponse(res, 500, e3.message, null)
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
    // FIXME: AppError
    if (e4) return AppResponse(res, 500, e4.message, null)

    // Obtener imágenes de los posts y pets asociados
    const requestPostIds = (requests ?? []).map((r: any) => r.post_id).filter(Boolean)
    const postImages = await getMultipleEntityImages("post", requestPostIds)
    const petImages = await getMultipleEntityImages("pet", petIds)

    const requestsWithImages = (requests ?? []).map((r: any) => ({
        ...r,
        postImages: postImages[String(r.post_id)] || [],
        petImages: petImages[String(r.post_id)] || [], // usar post_id para obtener pet asociado
    }))

    return AppResponse(res, 200, "OK", { as: "giver", requests: requestsWithImages })
}

export const confirmAccept = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const numericId = parseInt(id as any)
        if (isNaN(numericId)) {
            return AppResponse(res, 400, "ID debe ser un número válido", null)
        }

        // Buscar la solicitud para validar permisos
        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) {
            return AppResponse(res, 404, "Solicitud de adopción no encontrada", null)
        }

        if (existingRequest.post_owner_id !== req.user.id) {
            return AppResponse(res, 403, "No tienes permiso para aceptar esta solicitud", null)
        }

        const confirmationCode = nanoid(8)
        const { error: updateError } = await supabase
            .from("adoption_request")
            .update({ status: "approved", confirmation_code: confirmationCode })
            .eq("id", numericId)

        if (updateError) {
            return AppResponse(res, 500, updateError.message, null)
        }

        return AppResponse(res, 200, "Solicitud aceptada", { confirmation_code: confirmationCode })
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error desconocido"
        return AppResponse(res, 500, message, null)
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
    const { post_id, status } = req.body

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
