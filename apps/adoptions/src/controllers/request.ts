import { Request, Response } from "express"
import { AdoptionHistory, AppResponse, AuthenticatedRequest, AppError } from "@repo/utils"
import { nanoid } from "nanoid"
import { supabase } from "../index"
import { getMultipleEntityImages } from "../utils/mediaService"

export const validateCode = async (req: Request, res: Response) => {
    try {
        const { code, requestId } = req.body as { code: string; requestId: number }
        if (!code || !requestId) throw new AppError(400, "code y requestId son requeridos")

        const { data: vcode, error: vErr } = await supabase
            .from("verification_code")
            .select("user_id, code, type, expires_at, used")
            .eq("code", code)
            .eq("type", "adoption")
            .eq("used", false)
            .maybeSingle()

        if (vErr) throw new AppError(500, vErr.message)
        if (!vcode) throw new AppError(404, "Código no encontrado o ya utilizado")

        if (vcode.expires_at && new Date() > new Date(vcode.expires_at)) {
            await supabase
                .from("verification_code")
                .delete()
                .eq("code", code)
                .eq("type", "adoption")
            throw new AppError(401, "El código ha expirado")
        }

        const { data: request, error: rErr } = await supabase
            .from("adoption_request")
            .select("id, post_id, requester_id, post_owner_id, status")
            .eq("id", requestId)
            .single()

        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")
        if (request.requester_id !== vcode.user_id)
            throw new AppError(403, "El código no corresponde a esta solicitud")

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "completed" })
            .eq("id", request.id)
        if (updErr) throw new AppError(500, updErr.message)

        await supabase
            .from("verification_code")
            .update({ used: true })
            .eq("code", code)
            .eq("type", "adoption")

        const payload: AdoptionHistory["Insert"] = {
            from_owner_id: request.post_owner_id,
            to_owner_id: request.requester_id,
            pet_id: request.post_id,
        }
        const { error: histErr } = await supabase.from("adoption_history").insert([payload])
        if (histErr) throw new AppError(500, histErr.message)

        return AppResponse(res, 200, "Adopción validada y cerrada", { status: "completed" })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}

export const listMyRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id

        const { data: myCreatedPosts, error: e1 } = await supabase
            .from("post")
            .select("id")
            .eq("creator_id", userId)
        if (e1) throw new AppError(500, e1.message)

        const { data: myPets, error: e2 } = await supabase
            .from("pet")
            .select("id")
            .eq("owner_id", userId)
        if (e2) throw new AppError(500, e2.message)

        let petIds: number[] = (myPets ?? []).map((p) => p.id)
        let postIdsByPets: number[] = []
        if (petIds.length > 0) {
            const { data: postsByPets, error: e3 } = await supabase
                .from("post")
                .select("id")
                .in("pet_id", petIds)
            if (e3) throw new AppError(500, e3.message)
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
            .in("post_id", allPostIds)
            .order("created_at", { ascending: false })
        if (e4) throw new AppError(500, e4.message)

        const requestPostIds = (requests ?? []).map((r: any) => r.post_id).filter(Boolean)
        const postImages = await getMultipleEntityImages("post", requestPostIds)
        const petImages = await getMultipleEntityImages("pet", petIds)

        const requestsWithImages = (requests ?? []).map((r: any) => ({
            ...r,
            postImages: postImages[String(r.post_id)] || [],
            petImages: petImages[String(r.post_id)] || [],
        }))

        return AppResponse(res, 200, "OK", { as: "giver", requests: requestsWithImages })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}

export const confirmAccept = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) throw new AppError(400, "ID inválido")

        const { data: request, error: rErr } = await supabase
            .from("adoption_request")
            .select("id, requester_id, status")
            .eq("id", id)
            .single()
        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "approved" })
            .eq("id", id)
        if (updErr) throw new AppError(500, updErr.message)

        const code = nanoid(8)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        const { error: vErr } = await supabase.from("verification_code").insert([
            {
                user_id: request.requester_id,
                code,
                type: "adoption",
                expires_at: expiresAt,
                used: false,
            },
        ])
        if (vErr) throw new AppError(500, vErr.message)

        return AppResponse(res, 200, "Solicitud aceptada", {
            id: request.id,
            confirmationCode: code,
            expiresAt,
        })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}
