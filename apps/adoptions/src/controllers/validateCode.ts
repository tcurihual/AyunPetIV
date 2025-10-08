import { Request, Response } from "express"
import { createSupabaseClient, AppResponse } from "@repo/utils"

export const validateCode = async (req: Request, res: Response) => {
    const { code } = req.body
    const supa = createSupabaseClient()

    const AdoptionStatus = {
        PENDING: "pendiente",
        APPROVED: "aprobado",
        DENIED: "denegado",
        COMPLETED: "completada",
    }

    try {
        const { data: request, error: reqError } = await supa
            .from("adoption_request")
            .select("id, postid, userid, status")
            .eq("confirmation_code", code)
            .single()

        if (reqError || !request) throw new Error("Código inválido o no encontrado")

        if (!request.postid) throw new Error("Solicitud no asociada a una publicación válida")

        const { error: updateError } = await supa
            .from("adoption_request")
            .update({ status: AdoptionStatus.COMPLETED })
            .eq("id", request.id)

        if (updateError) throw new Error(updateError.message)

        const { error: historyError } = await supa.from("adoption_history").insert([
            {
                postid: request.postid,
                fromownerid: request.userid,
                toownerid: request.postid,
            },
        ])

        if (historyError) throw new Error(historyError.message)

        return AppResponse(res, 200, "Adopción validada y cerrada", {
            status: AdoptionStatus.COMPLETED,
        })
    } catch (e) {
        if (e instanceof Error) {
            return AppResponse(res, 500, e.message, null)
        }
        return AppResponse(res, 500, "Error desconocido", null)
    }
}
