import { Request, Response } from "express"
import { supabase } from "../index"
import { AppError, AppResponse, AdoptionHistory } from "@repo/utils"

export const getAdoptionHistory = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        if (id) {
            const numericId = Number(id)
            if (!Number.isFinite(numericId)) throw new AppError(400, "ID debe ser un número válido")

            const { data, error } = await supabase
                .from("adoption_history")
                .select("*")
                .eq("id", numericId)
                .single()

            if (error || !data) throw new AppError(404, "Historial de adopción no encontrado")

            return AppResponse(res, 200, "Historial de adopción obtenido exitosamente", data)
        }

        const { data, error } = await supabase
            .from("adoption_history")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw new AppError(500, "Error al obtener el historial de adopciones")

        return AppResponse(res, 200, "Historial de adopciones obtenido exitosamente", data ?? [])
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const createAdoptionHistory = async (
    req: Request<{}, any, AdoptionHistory["Insert"]>,
    res: Response
) => {
    const body = req.body

    try {
        if (!body.pet_id) throw new AppError(400, "pet_id es un campo requerido")

        if (body.from_owner_id != null) {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", body.from_owner_id)
                .single()
            if (error || !data)
                throw new AppError(404, "Usuario propietario anterior no encontrado")
        }

        if (body.to_owner_id != null) {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", body.to_owner_id)
                .single()
            if (error || !data) throw new AppError(404, "Usuario nuevo propietario no encontrado")
        }

        {
            const { data, error } = await supabase
                .from("pet")
                .select("id")
                .eq("id", body.pet_id)
                .single()
            if (error || !data) throw new AppError(404, "Mascota no encontrada")
        }

        const { data, error } = await supabase
            .from("adoption_history")
            .insert([body])
            .select("*")
            .single()

        if (error || !data) throw new AppError(500, "Error al crear el historial de adopción")

        return AppResponse(res, 201, "Historial de adopción creado exitosamente", data)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const updateAdoptionHistory = async (
    req: Request<{ id: string }, any, AdoptionHistory["Update"]>,
    res: Response
) => {
    const { id } = req.params
    const patch = req.body

    try {
        const numericId = Number(id)
        if (!Number.isFinite(numericId)) throw new AppError(400, "ID debe ser un número válido")

        const { data: exists, error: findErr } = await supabase
            .from("adoption_history")
            .select("id")
            .eq("id", numericId)
            .single()
        if (findErr || !exists) throw new AppError(404, "Historial de adopción no encontrado")

        // Validar llaves (si se envían)
        if (patch.from_owner_id != null) {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", patch.from_owner_id)
                .single()
            if (error || !data)
                throw new AppError(404, "Usuario propietario anterior no encontrado")
        }
        if (patch.to_owner_id != null) {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", patch.to_owner_id)
                .single()
            if (error || !data) throw new AppError(404, "Usuario nuevo propietario no encontrado")
        }
        if (patch.pet_id != null) {
            const { data, error } = await supabase
                .from("pet")
                .select("id")
                .eq("id", patch.pet_id)
                .single()
            if (error || !data) throw new AppError(404, "Mascota no encontrada")
        }

        const { data, error } = await supabase
            .from("adoption_history")
            .update(patch)
            .eq("id", numericId)
            .select("*")
            .single()

        if (error || !data) throw new AppError(500, "Error al actualizar el historial de adopción")

        return AppResponse(res, 200, "Historial de adopción actualizado exitosamente", data)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const deleteAdoptionHistory = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const numericId = Number(id)
        if (!Number.isFinite(numericId)) throw new AppError(400, "ID debe ser un número válido")

        const { data: exists, error: findErr } = await supabase
            .from("adoption_history")
            .select("id")
            .eq("id", numericId)
            .single()
        if (findErr || !exists) throw new AppError(404, "Historial de adopción no encontrado")

        const { data, error } = await supabase
            .from("adoption_history")
            .delete()
            .eq("id", numericId)
            .select("*")
            .single()

        if (error || !data) throw new AppError(500, "Error al eliminar el historial de adopción")

        return AppResponse(res, 200, "Historial de adopción eliminado exitosamente", {
            id: data.id,
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}
