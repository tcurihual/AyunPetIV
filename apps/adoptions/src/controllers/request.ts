import { Request, Response } from "express"
import { AdoptionHistory, AppResponse, AuthenticatedRequest } from "@repo/utils"
import { nanoid } from "nanoid"
import { supabase } from "../index"

export const validateCode = async (req: Request, res: Response) => {
    const { code } = req.body
    // TODO: implementación del uso del codigo correctamente buscandolo
    // en su respectiva tabla
    try {
        const { data: request, error: reqError } = await supabase
            .from("adoption_request")
            .select("id, post_id, requester_id, post_owner_id, status")
            .eq("confirmation_code", code)
            .single()

        if (reqError || !request) throw new Error("Código inválido o no encontrado")

        if (!request.id) throw new Error("Solicitud no asociada a una publicación válida")

        const { error: updateError } = await supabase
            .from("adoption_request")
            .update({ status: "completed" })
            .eq("id", request.id)

        if (updateError) throw new Error(updateError.message)
        // FIXME: se esta guardando en la id del owner el id del post,
        // se debe buscar el post con su id y usar post.creator_id,
        // lo mismo con pet_id
        const payload: AdoptionHistory["Insert"] = {
            from_owner_id: request.post_owner_id,
            to_owner_id: request.requester_id,
            pet_id: request.post_id,
        }

        const { error: historyError } = await supabase.from("adoption_history").insert([payload])

        if (historyError) throw new Error(historyError.message)

        return AppResponse(res, 200, "Adopción validada y cerrada", {
            status: "completed",
        })
    } catch (e) {
        if (e instanceof Error) {
            return AppResponse(res, 500, e.message, null)
        }
        return AppResponse(res, 500, "Error desconocido", null)
    }
}

export const listMyRequests = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id
    const role = req.user.role
    // TODO: ahora esta presente la id de la entidad a la que le hacen
    // las request, usar eso

    // FIXME: porque role 1? no existe ningun role 1 en al bd,
    //  nunca entrara a ese if
    // ademas como tal no deberia de verificar roles si ya existe el middleware
    if (role === 1) {
        const { data, error } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("userid", userId)
            .order("createdat", { ascending: false })
        // FIXME: AppError
        if (error) return AppResponse(res, 500, error.message, null)
        return AppResponse(res, 200, "OK", { as: "adopter", requests: data ?? [] })
    }

    const { data: myCreatedPosts, error: e1 } = await supabase
        .from("post")
        .select("id")
        .eq("creatorid", userId)
    if (e1) return AppResponse(res, 500, e1.message, null)

    const { data: myPets, error: e2 } = await supabase
        .from("pet")
        .select("id")
        .eq("ownerid", userId)
    if (e2) return AppResponse(res, 500, e2.message, null)

    let petIds: number[] = (myPets ?? []).map((p) => p.id)
    let postIdsByPets: number[] = []
    if (petIds.length > 0) {
        const { data: postsByPets, error: e3 } = await supabase
            .from("post")
            .select("id")
            .in("petid", petIds)
        // FIXME
        // se AppResponse se usa para respuestas validas
        // usar AppError
        if (e3) return AppResponse(res, 500, e3.message, null)
        postIdsByPets = (postsByPets ?? []).map((p) => p.id)
    }

    const postIdSet = new Set<number>([
        ...(myCreatedPosts ?? []).map((p) => p.id),
        ...postIdsByPets,
    ])
    const allPostIds = Array.from(postIdSet)

    if (allPostIds.length === 0) {
        return AppResponse(res, 200, "OK", { as: "giver", requests: [] })
    }

    const { data: requests, error: e4 } = await supabase
        .from("adoption_request")
        .select("*")
        .in("postid", allPostIds)
        .order("createdat", { ascending: false })
    // FIXME: AppError
    if (e4) return AppResponse(res, 500, e4.message, null)
    return AppResponse(res, 200, "OK", { as: "giver", requests: requests ?? [] })
}

export const confirmAccept = async (req: Request, res: Response) => {
    try {
        const confirmationCode = nanoid(8)
        const { data, error } = await supabase
            .from("adoption_request")
            .update({ status: "approved", confirmation_code: confirmationCode })
            .single()

        if (error) throw new Error(error.message)

        return AppResponse(res, 200, "Solicitud aceptada", {})
    } catch (e) {
        if (e instanceof Error) {
            // FIXME: AppError
            return AppResponse(res, 500, e.message, null)
        }
        return AppResponse(res, 500, "Error desconocido", null)
    }
}
