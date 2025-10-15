import { Request, Response } from "express"
import { supabase } from "../"
import { AppError, AppResponse, AdoptionRequest, AuthenticatedRequest } from "@repo/utils"
import { getEntityImages, getMultipleEntityImages } from "../utils/mediaService"

export const getAdoptionRequests = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        if (id) {
            const numericId = parseInt(id)
            if (isNaN(numericId)) {
                throw new AppError(400, "ID debe ser un número válido")
            }

            const { data: adoptionRequest, error } = await supabase
                .from("adoption_request")
                .select("*")
                .eq("id", numericId)
                .single()

            if (error) throw new AppError(404, "Solicitud de adopción no encontrada")

            // Obtener imágenes del post si existe
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

            if (error) throw new AppError(500, "Error al obtener las solicitudes de adopción")

            // Obtener imágenes de los posts
            const postIds = (adoptionRequests ?? []).map((req: any) => req.post_id).filter(Boolean)
            const postImages = await getMultipleEntityImages("post", postIds)

            const requestsWithImages = (adoptionRequests ?? []).map((req: any) => ({
                ...req,
                postImages: postImages[String(req.post_id)] || [],
            }))

            return AppResponse(
                res,
                200,
                "Solicitudes de adopción obtenidas exitosamente",
                requestsWithImages
            )
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const createAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const adoptionRequestData: AdoptionRequest["Insert"] = req.body

    try {
        if (
            !adoptionRequestData.requester_id ||
            !adoptionRequestData.post_id ||
            !adoptionRequestData.post_owner_id
        ) {
            throw new AppError(400, "userid y postid son campos requeridos")
        }

        const { data: userExists, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", adoptionRequestData.requester_id)
            .single()

        if (userError) throw new AppError(404, "Usuario no encontrado")

        const { data: postExists, error: postError } = await supabase
            .from("post")
            .select("id")
            .eq("id", adoptionRequestData.post_id)
            .single()

        if (postError) throw new AppError(404, "Post no encontrado")

        const { data: existingRequest, error: existingError } = await supabase
            .from("adoption_request")
            .select("id")
            .eq("requester_id", adoptionRequestData.requester_id)
            .eq("post_owner_id", adoptionRequestData.post_owner_id)
            .eq("post_id", adoptionRequestData.post_id)
            .eq("status", "pending")
            .maybeSingle()

        if (existingError) throw new AppError(500, "Error al verificar solicitudes existentes")

        if (existingRequest) {
            throw new AppError(409, "Ya existe una solicitud pendiente para este post")
        }

        const payload: AdoptionRequest["Insert"] = {
            requester_id: adoptionRequestData.requester_id,
            post_id: adoptionRequestData.post_id,
            post_owner_id: adoptionRequestData.post_owner_id,
            status: adoptionRequestData.status || "pending",
        }

        const { data: newAdoptionRequest, error: insertError } = await supabase
            .from("adoption_request")
            .insert([payload])
            .select()
            .single()

        if (insertError) throw new AppError(500, "Error al crear la solicitud de adopción")

        return AppResponse(
            res,
            201,
            "Solicitud de adopción creada exitosamente",
            newAdoptionRequest
        )
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const updateAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const updateData: AdoptionRequest["Update"] = req.body

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .single()

        if (findError) throw new AppError(404, "Solicitud de adopción no encontrada")

        const payload: AdoptionRequest["Update"] = {
            ...updateData,
            updated_at: new Date().toISOString(),
        }

        if (payload.requester_id) {
            const { data: userExists, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("id", payload.requester_id)
                .single()

            if (userError) throw new AppError(404, "Usuario no encontrado")
        }

        if (payload.post_id) {
            const { data: postExists, error: postError } = await supabase
                .from("post")
                .select("id")
                .eq("id", payload.post_id)
                .single()

            if (postError) throw new AppError(404, "Post no encontrado")
        }

        const { data: updatedRequest, error: updateError } = await supabase
            .from("adoption_request")
            .update(payload)
            .eq("id", numericId)
            .select()
            .single()

        if (updateError) throw new AppError(500, "Error al actualizar la solicitud de adopción")

        return AppResponse(
            res,
            200,
            "Solicitud de adopción actualizada exitosamente",
            updatedRequest
        )
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const deleteAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("id")
            .eq("id", numericId)
            .single()

        if (findError) throw new AppError(404, "Solicitud de adopción no encontrada")

        const { error: deleteError } = await supabase
            .from("adoption_request")
            .delete()
            .eq("id", numericId)

        if (deleteError) throw new AppError(500, "Error al eliminar la solicitud de adopción")

        return AppResponse(res, 200, "Solicitud de adopción eliminada exitosamente", {})
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}
