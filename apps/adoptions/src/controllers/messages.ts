import type { Response } from "express"
import { createSupabaseClient, AppResponse, AppError, AuthenticatedRequest } from "@repo/utils"
import { supabase } from ".."

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    if (id) {
        const { data, error } = await supabase
            .from("message")
            .select("*")
            .eq("id", Number(id))
            .single()

        if (error) throw new AppError(400, "Error al obtener mensaje", { error })
        if (!data) throw new AppError(404, "Mensaje no encontrado")

        return AppResponse(res, 200, "Mensaje obtenido correctamente", data)
    }

    const { data, error } = await supabase.from("message").select("*")

    if (error) throw new AppError(400, "Error al obtener mensajes", { error })
    return AppResponse(res, 200, "Mensajes obtenidos correctamente", data)
}

export const createMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { creatorId, postId, description, status } = req.body

    const insertData = {
        creator_id: creatorId,
        post_id: postId ?? null,
        description,
        status: status ?? "active",
    }

    const { data, error } = await supabase.from("message").insert(insertData).select().single()

    if (error) throw new AppError(400, "Error al crear mensaje", { error })
    return AppResponse(res, 201, "Mensaje creado correctamente", data)
}

export const updateMessage = async (req: AuthenticatedRequest, res: Response) => {
    const supabase = createSupabaseClient()
    const { id } = req.params
    const { description, status } = req.body

    const updateData: Record<string, any> = {}
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
        .from("message")
        .update(updateData)
        .eq("id", Number(id))
        .select()
        .single()

    if (error) throw new AppError(400, "Error al actualizar mensaje", { error })
    return AppResponse(res, 200, "Mensaje actualizado correctamente", data)
}

export const deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const { error } = await supabase.from("message").delete().eq("id", Number(id))

    if (error) throw new AppError(400, "Error al eliminar mensaje", { error })
    return AppResponse(res, 200, "Mensaje eliminado correctamente", null)
}
