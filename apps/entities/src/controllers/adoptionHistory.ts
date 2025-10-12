import { Request, Response } from "express"
import { supabase } from "../"
import { AppError, AppResponse, AdoptionHistory } from "@repo/utils"

export const getAdoptionHistory = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        if (id) {
            const numericId = parseInt(id)
            if (isNaN(numericId)) {
                throw new AppError(400, "ID debe ser un número válido")
            }

            const { data: adoptionHistory, error } = await supabase
                .from("adoption_history")
                .select("*")
                .eq("id", numericId)
                .single()

            if (error) throw new AppError(404, "Historial de adopción no encontrado")

            return AppResponse(
                res,
                200,
                "Historial de adopción obtenido exitosamente",
                adoptionHistory
            )
        } else {
            const { data: adoptionHistories, error } = await supabase
                .from("adoption_history")
                .select("*")
                .order("createdat", { ascending: false })

            if (error) throw new AppError(500, "Error al obtener el historial de adopciones")

            return AppResponse(
                res,
                200,
                "Historial de adopciones obtenido exitosamente",
                adoptionHistories
            )
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const createAdoptionHistory = async (
    req: Request<{}, any, AdoptionHistory["Insert"]>,
    res: Response
) => {
    const adoptionHistoryData = req.body

    try {
        if (!adoptionHistoryData.pet_id) {
            throw new AppError(400, "petid es un campo requerido")
        }

        if (adoptionHistoryData.from_owner_id) {
            const { data: fromOwner, error: fromOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", adoptionHistoryData.from_owner_id)
                .single()

            if (fromOwnerError || !fromOwner) {
                throw new AppError(404, "Usuario propietario anterior no encontrado")
            }
        }

        if (adoptionHistoryData.to_owner_id) {
            const { data: toOwner, error: toOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", adoptionHistoryData.to_owner_id)
                .single()

            if (toOwnerError || !toOwner) {
                throw new AppError(404, "Usuario nuevo propietario no encontrado")
            }
        }

        const { data: pet, error: petError } = await supabase
            .from("pet")
            .select("id")
            .eq("id", adoptionHistoryData.pet_id)
            .single()

        if (petError || !pet) {
            throw new AppError(404, "Mascota no encontrada")
        }

        // TODO: es necesario este bloque?
        // if (adoptionHistoryData.) {
        //     const { data: post, error: postError } = await supabase
        //         .from("post")
        //         .select("id")
        //         .eq("id", adoptionHistoryData.post_id)
        //         .single()

        //     if (postError || !post) {
        //         throw new AppError(404, "Post no encontrado")
        //     }
        // }

        const { data: newAdoptionHistory, error: insertError } = await supabase
            .from("adoption_history")
            .insert([adoptionHistoryData])
            .select()
            .single()

        if (insertError) {
            throw new AppError(500, "Error al crear el historial de adopción")
        }

        return AppResponse(
            res,
            201,
            "Historial de adopción creado exitosamente",
            newAdoptionHistory
        )
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
    const updateData = req.body

    try {
        if (!id) {
            throw new AppError(400, "ID es requerido")
        }

        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        const { data: existingRecord, error: findError } = await supabase
            .from("adoption_history")
            .select("id")
            .eq("id", numericId)
            .single()

        if (findError || !existingRecord) {
            throw new AppError(404, "Historial de adopción no encontrado")
        }

        if (updateData.from_owner_id) {
            const { data: fromOwner, error: fromOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", updateData.from_owner_id)
                .single()

            if (fromOwnerError || !fromOwner) {
                throw new AppError(404, "Usuario propietario anterior no encontrado")
            }
        }

        if (updateData.to_owner_id) {
            const { data: toOwner, error: toOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", updateData.to_owner_id)
                .single()

            if (toOwnerError || !toOwner) {
                throw new AppError(404, "Usuario nuevo propietario no encontrado")
            }
        }

        if (updateData.pet_id) {
            const { data: pet, error: petError } = await supabase
                .from("pet")
                .select("id")
                .eq("id", updateData.pet_id)
                .single()

            if (petError || !pet) {
                throw new AppError(404, "Mascota no encontrada")
            }
        }

        // TODO: es necesario este bloque?
        // if (updateData.post_id) {
        //     const { data: post, error: postError } = await supabase
        //         .from("post")
        //         .select("id")
        //         .eq("id", updateData.post_id)
        //         .single()

        //     if (postError || !post) {
        //         throw new AppError(404, "Post no encontrado")
        //     }
        // }

        const { data: updatedAdoptionHistory, error: updateError } = await supabase
            .from("adoption_history")
            .update(updateData)
            .eq("id", numericId)
            .select()
            .single()

        if (updateError) {
            throw new AppError(500, "Error al actualizar el historial de adopción")
        }

        return AppResponse(
            res,
            200,
            "Historial de adopción actualizado exitosamente",
            updatedAdoptionHistory
        )
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

export const deleteAdoptionHistory = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        if (!id) {
            throw new AppError(400, "ID es requerido")
        }

        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        const { data: existingRecord, error: findError } = await supabase
            .from("adoption_history")
            .select("id")
            .eq("id", numericId)
            .single()

        if (findError || !existingRecord) {
            throw new AppError(404, "Historial de adopción no encontrado")
        }

        const { error: deleteError } = await supabase
            .from("adoption_history")
            .delete()
            .eq("id", numericId)

        if (deleteError) {
            throw new AppError(500, "Error al eliminar el historial de adopción")
        }

        return AppResponse(res, 200, "Historial de adopción eliminado exitosamente", {
            id: numericId,
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}
