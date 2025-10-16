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
                .maybeSingle()

            if (error || !adoptionRequest) throw new AppError(404, "Solicitud de adopción no encontrada")

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
    const { post_id, status } = req.body

    try {
        if (!post_id) {
            throw new AppError(400, "post_id es un campo requerido")
        }

        // Obtener el post y su owner desde la BD (no confiar en el cliente)
        const { data: post, error: postError } = await supabase
            .from("post")
            .select("id, creator_id")
            .eq("id", post_id)
            .maybeSingle()

        if (postError || !post) {
            throw new AppError(404, "Post no encontrado")
        }

        // Usar el ID del usuario autenticado (no confiar en el cliente)
        const requester_id = req.user.id
        // El dueño del post viene del campo creator_id
        const post_owner_id = post.creator_id

        if (!post_owner_id) {
            throw new AppError(500, "No se pudo determinar el dueño del post")
        }

        // Verificar que el usuario no esté solicitando su propio post
        if (requester_id === post_owner_id) {
            throw new AppError(400, "No puedes solicitar adopción de tu propio post")
        }

        // Verificar si ya existe una solicitud pendiente
        const { data: existingRequests, error: existingError } = await supabase
            .from("adoption_request")
            .select("id")
            .eq("requester_id", requester_id)
            .eq("post_owner_id", post_owner_id)
            .eq("post_id", post_id)
            .eq("status", "pending")

        if (existingError) throw new AppError(500, "Error al verificar solicitudes existentes")

        if ((existingRequests ?? []).length > 0) {
            throw new AppError(409, "Ya existe una solicitud pendiente para este post")
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

        if (insertError || !newAdoptionRequest) throw new AppError(500, "Error al crear la solicitud de adopción")

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
    const { status } = req.body

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new AppError(404, "Solicitud de adopción no encontrada")

        // Verificar propiedad: solo el solicitante o el dueño del post pueden modificar
        if (
            existingRequest.requester_id !== req.user.id &&
            existingRequest.post_owner_id !== req.user.id
        ) {
            throw new AppError(
                403,
                "No tienes permiso para actualizar esta solicitud de adopción"
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

        if (updateError || !updatedRequest) throw new AppError(500, "Error al actualizar la solicitud de adopción")

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
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new AppError(404, "Solicitud de adopción no encontrada")

        // Verificar propiedad: solo el solicitante puede eliminar su solicitud
        if (existingRequest.requester_id !== req.user.id) {
            throw new AppError(
                403,
                "No tienes permiso para eliminar esta solicitud de adopción"
            )
        }

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
