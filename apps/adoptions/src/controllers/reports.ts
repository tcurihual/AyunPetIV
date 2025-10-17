import type { Response } from "express"
import { createSupabaseClient, AppResponse, AppError, AuthenticatedRequest } from "@repo/utils"
import { supabase } from ".."

export const getReports = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    if (id) {
        const { data, error } = await supabase
            .from("report")
            .select("*")
            .eq("id", Number(id))
            .single()

        if (error) throw new AppError(400, "Error al obtener el reporte", { error })
        if (!data) throw new AppError(404, "Reporte no encontrado")

        return AppResponse(res, 200, "Reporte obtenido correctamente", data)
    }

    const { data, error } = await supabase.from("report").select("*")

    if (error) throw new AppError(400, "Error al obtener reports", { error })
    return AppResponse(res, 200, "Reports obtenidos correctamente", data)
}
export const createReport = async (req: AuthenticatedRequest, res: Response) => {
    const supabase = createSupabaseClient()
    const { userId, postId, description, resolved } = req.body

    const insertData = {
        user_id: userId,
        post_id: postId,
        description,
        resolved: resolved ?? false,
    }

    const { data, error } = await supabase.from("report").insert(insertData).select().single()

    if (error) throw new AppError(400, "Error al crear report", { error })
    return AppResponse(res, 201, "Report creado correctamente", data)
}

export const updateReport = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { description, resolved } = req.body

    const updateData = {
        description,
        resolved,
        updatedat: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from("report")
        .update(updateData)
        .eq("id", Number(id))
        .select()
        .single()

    if (error) throw new AppError(400, "Error al actualizar report", { error })
    return AppResponse(res, 200, "Report actualizado correctamente", data)
}

export const deleteReport = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const { error } = await supabase.from("report").delete().eq("id", Number(id))

    if (error) throw new AppError(400, "Error al eliminar report", { error })
    return AppResponse(res, 200, "Report eliminado correctamente", null)
}
