import type { Request, Response } from "express"
import axios from "axios"
import {
    MEDIA_URL,
    AppError,
    AppResponse,
    AdoptionHistory,
} from "@repo/utils"
import { supabase } from "../index"

type GiverItem = {
    id: number
    name: string
    email: string
    role: number
    rut: string
    files: string[]
}

export const listGiverRequests = async (_req: Request, res: Response) => {
    const { data: users, error } = await supabase
        .from("users")
        .select("id,name,email,role,rut,validated")
        .eq("validated", false)
        .not("role", "in", "(20,19)")
        .order("id", { ascending: true })

    if (error) {
        return res.status(500).json({ type: "error", message: error.message, data: null })
    }

    const items: GiverItem[] = await Promise.all(
        (users ?? []).map(async (u) => {
            const safeName = typeof u.name === "string" ? u.name : ""
            const safeEmail = typeof u.email === "string" ? u.email : ""
            const safeRut = typeof u.rut === "string" ? u.rut : ""

            let files: string[] = []
            try {
                const { data } = await axios.get<string[] | { data?: string[] }>(
                    `${MEDIA_URL}/files/account-request/${safeRut}`
                )
                files = Array.isArray(data)
                    ? data
                    : Array.isArray((data as any)?.data)
                    ? (data as any).data
                    : []
            } catch {
                files = []
            }

            return {
                id: u.id as number,
                name: safeName,
                email: safeEmail,
                role: u.role as number,
                rut: safeRut,
                files,
            }
        })
    )

    return res.json({ type: "success", message: "OK", data: items })
}

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
        if (!adoptionHistoryData.petid) {
            throw new AppError(400, "petid es un campo requerido")
        }

        if (adoptionHistoryData.fromownerid) {
            const { data: fromOwner, error: fromOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", adoptionHistoryData.fromownerid)
                .single()

            if (fromOwnerError || !fromOwner) {
                throw new AppError(404, "Usuario propietario anterior no encontrado")
            }
        }

        if (adoptionHistoryData.toownerid) {
            const { data: toOwner, error: toOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", adoptionHistoryData.toownerid)
                .single()

            if (toOwnerError || !toOwner) {
                throw new AppError(404, "Usuario nuevo propietario no encontrado")
            }
        }

        const { data: pet, error: petError } = await supabase
            .from("pet")
            .select("id")
            .eq("id", adoptionHistoryData.petid)
            .single()

        if (petError || !pet) {
            throw new AppError(404, "Mascota no encontrada")
        }

        if (adoptionHistoryData.postid) {
            const { data: post, error: postError } = await supabase
                .from("post")
                .select("id")
                .eq("id", adoptionHistoryData.postid)
                .single()

            if (postError || !post) {
                throw new AppError(404, "Post no encontrado")
            }
        }

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

        if (updateData.fromownerid) {
            const { data: fromOwner, error: fromOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", updateData.fromownerid)
                .single()

            if (fromOwnerError || !fromOwner) {
                throw new AppError(404, "Usuario propietario anterior no encontrado")
            }
        }

        if (updateData.toownerid) {
            const { data: toOwner, error: toOwnerError } = await supabase
                .from("users")
                .select("id")
                .eq("id", updateData.toownerid)
                .single()

            if (toOwnerError || !toOwner) {
                throw new AppError(404, "Usuario nuevo propietario no encontrado")
            }
        }

        if (updateData.petid) {
            const { data: pet, error: petError } = await supabase
                .from("pet")
                .select("id")
                .eq("id", updateData.petid)
                .single()

            if (petError || !pet) {
                throw new AppError(404, "Mascota no encontrada")
            }
        }

        if (updateData.postid) {
            const { data: post, error: postError } = await supabase
                .from("post")
                .select("id")
                .eq("id", updateData.postid)
                .single()

            if (postError || !post) {
                throw new AppError(404, "Post no encontrado")
            }
        }

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
