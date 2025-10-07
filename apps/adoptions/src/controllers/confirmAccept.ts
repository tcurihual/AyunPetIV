import { Request, Response } from "express"
import { createSupabaseClient, AppResponse } from "@repo/utils"
import { nanoid } from "nanoid"

export const confirmAccept = async (req: Request, res: Response) => {
    const { id } = req.params
    const supa = createSupabaseClient()

    const AdoptionStatus = {
        PENDING: "pendiente",
        APPROVED: "aprobado",
        DENIED: "denegado",
        COMPLETED: "completada",
    }

    try {
        const confirmationCode = nanoid(8)
        const { data, error } = await supa
            .from("adoption_request")
            .update({ status: AdoptionStatus.APPROVED, confirmation_code: confirmationCode })
            .single()

        if (error) throw new Error(error.message)

        return AppResponse(res, 200, "Solicitud aceptada", {})
    } catch (e) {
        if (e instanceof Error) {
            return AppResponse(res, 500, e.message, null)
        }
        return AppResponse(res, 500, "Error desconocido", null)
    }
}
