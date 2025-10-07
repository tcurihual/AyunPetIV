import { Request, Response } from "express"
import { supabase } from "../"
import { AppError, AppResponse, AdoptionRequest } from "@repo/utils"

export const getAdoptionRequests = async (req: Request, res: Response) => {
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

            return AppResponse(
                res,
                200,
                "Solicitud de adopción obtenida exitosamente",
                adoptionRequest
            )
        } else {
            const { data: adoptionRequests, error } = await supabase
                .from("adoption_request")
                .select("*")
                .order("createdat", { ascending: false })

            if (error) throw new AppError(500, "Error al obtener las solicitudes de adopción")

            return AppResponse(
                res,
                200,
                "Solicitudes de adopción obtenidas exitosamente",
                adoptionRequests
            )
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const createAdoptionRequest = async (
    req: Request<{}, any, AdoptionRequest["Insert"]>,
    res: Response
) => {
    const adoptionRequestData = req.body

    try {
        if (!adoptionRequestData.userid || !adoptionRequestData.postid) {
            throw new AppError(400, "userid y postid son campos requeridos")
        }

        const { data: userExists, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", adoptionRequestData.userid)
            .single()

        if (userError) throw new AppError(404, "Usuario no encontrado")

        const { data: postExists, error: postError } = await supabase
            .from("post")
            .select("id")
            .eq("id", adoptionRequestData.postid)
            .single()

        if (postError) throw new AppError(404, "Post no encontrado")

        const { data: existingRequest, error: existingError } = await supabase
            .from("adoption_request")
            .select("id")
            .eq("userid", adoptionRequestData.userid)
            .eq("postid", adoptionRequestData.postid)
            .eq("status", "pending")
            .maybeSingle()

        if (existingError) throw new AppError(500, "Error al verificar solicitudes existentes")

        if (existingRequest) {
            throw new AppError(409, "Ya existe una solicitud pendiente para este post")
        }

        const payload: AdoptionRequest["Insert"] = {
            userid: adoptionRequestData.userid,
            postid: adoptionRequestData.postid,
            status: adoptionRequestData.status || "pending",
            message: adoptionRequestData.message || null,
            createdat: adoptionRequestData.createdat || new Date().toISOString(),
            updatedat: adoptionRequestData.updatedat || new Date().toISOString(),
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

export const updateAdoptionRequest = async (
    req: Request<{ id: string }, any, AdoptionRequest["Update"]>,
    res: Response
) => {
    const { id } = req.params
    const updateData = req.body

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
            updatedat: new Date().toISOString(),
        }

        if (payload.userid) {
            const { data: userExists, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("id", payload.userid)
                .single()

            if (userError) throw new AppError(404, "Usuario no encontrado")
        }

        if (payload.postid) {
            const { data: postExists, error: postError } = await supabase
                .from("post")
                .select("id")
                .eq("id", payload.postid)
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

export const deleteAdoptionRequest = async (req: Request, res: Response) => {
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
