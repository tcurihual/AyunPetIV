import { Request, Response } from "express"
import { supabase } from "../"
import {
    AppError,
    AppResponse,
    AdoptionRequest,
    AuthenticatedRequest,
    AdoptionStatus,
} from "@repo/utils"

import { getEntityImages, getMultipleEntityImages } from "../utils/mediaService"

const toNum = (v: unknown, name: string): number => {
    const n = Number(v)
    if (!Number.isFinite(n)) throw new AppError(400, `${name} inválido`)
    return n
}

const isValidStatus = (s: any): s is AdoptionStatus =>
    ["pending", "approved", "rejected", "completed"].includes(s)

// ----------------- GET (lista o por id) -----------------
export const getAdoptionRequests = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        // -------- GET /adoption-requests/:id
        if (id) {
            const numericId = toNum(id, "id")

            const { data: adoptionRequest, error } = await supabase
                .from("adoption_request")
                .select("*")
                .eq("id", numericId)
                .maybeSingle()

            if (error || !adoptionRequest)
                throw new AppError(404, "Solicitud de adopción no encontrada")

            const uid = req.user?.id ?? null
            const isAdmin = req.user?.role === 19
            const isRequester = uid != null && adoptionRequest.requester_id === uid
            const isOwner = uid != null && adoptionRequest.post_owner_id === uid
            if (!isAdmin && !isRequester && !isOwner) {
                throw new AppError(403, "No autorizado para ver esta solicitud")
            }

            const postImages = adoptionRequest.post_id
                ? await getEntityImages("post", adoptionRequest.post_id)
                : []

            return AppResponse(res, 200, "Solicitud de adopción obtenida exitosamente", {
                ...adoptionRequest,
                postImages,
            })
        }

        // -------- GET /adoption-requests (lista, con filtros opcionales)
        const requesterId =
            typeof req.query.requesterId !== "undefined" &&
            String(req.query.requesterId).trim() !== ""
                ? toNum(req.query.requesterId, "requesterId")
                : undefined

        const postOwnerId =
            typeof req.query.postOwnerId !== "undefined" &&
            String(req.query.postOwnerId).trim() !== ""
                ? toNum(req.query.postOwnerId, "postOwnerId")
                : undefined

        const postId =
            typeof req.query.postId !== "undefined" && String(req.query.postId).trim() !== ""
                ? toNum(req.query.postId, "postId")
                : undefined

        const statusParamRaw = req.query.status
        let statusParam: AdoptionStatus | undefined = undefined
        if (typeof statusParamRaw !== "undefined" && String(statusParamRaw).trim() !== "") {
            const candidate = String(statusParamRaw).trim()
            if (!isValidStatus(candidate)) throw new AppError(400, "status inválido")
            statusParam = candidate as AdoptionStatus
        }

        let query = supabase.from("adoption_request").select("*", { count: "exact" })

        if (typeof requesterId !== "undefined") query = query.eq("requester_id", requesterId)
        if (typeof postOwnerId !== "undefined") query = query.eq("post_owner_id", postOwnerId)
        if (typeof postId !== "undefined") query = query.eq("post_id", postId)
        if (typeof statusParam !== "undefined") query = query.eq("status", statusParam)

        if (
            typeof requesterId === "undefined" &&
            typeof postOwnerId === "undefined" &&
            typeof postId === "undefined" &&
            typeof statusParam === "undefined" &&
            req.user?.id
        ) {
            query = query.or(`requester_id.eq.${req.user.id},post_owner_id.eq.${req.user.id}`)
        }

        const page = Math.max(Number(req.query.page ?? 1), 1)
        const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100)
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, to)

        if (error) throw new AppError(500, "Error al obtener las solicitudes de adopción")

        const postIds = (data ?? []).map((r: any) => r.post_id).filter(Boolean)
        const imagesByPost = await getMultipleEntityImages("post", postIds)

        const items = (data ?? []).map((r: any) => ({
            ...r,
            postImages: imagesByPost[String(r.post_id)] || [],
        }))

        return AppResponse(res, 200, "Solicitudes de adopción obtenidas exitosamente", {
            items,
            total: count ?? 0,
            page,
            pageSize,
            totalPages: Math.ceil((count ?? 0) / pageSize),
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

// ----------------- POST -----------------
export const createAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const body: AdoptionRequest["Insert"] = req.body

    try {
        const requesterId = toNum(body.requester_id, "requester_id")
        const postId = toNum(body.post_id, "post_id")

        const status: AdoptionStatus = isValidStatus(body.status) ? body.status : "pending"

        {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", requesterId)
                .single()
            if (error || !data) throw new AppError(404, "Usuario solicitante no encontrado")
        }

        const { data: postRow, error: postErr } = await supabase
            .from("post")
            .select("id, creator_id")
            .eq("id", postId)
            .single()
        if (postErr || !postRow) throw new AppError(404, "Post no encontrado")

        const postOwnerId = toNum(postRow.creator_id, "post_owner_id")

        {
            const { data, error } = await supabase
                .from("adoption_request")
                .select("id")
                .eq("requester_id", requesterId)
                .eq("post_owner_id", postOwnerId)
                .eq("post_id", postId)
                .eq("status", "pending")
                .maybeSingle()

            if (error) throw new AppError(500, "Error al verificar solicitudes existentes")
            if (data) throw new AppError(409, "Ya existe una solicitud pendiente para este post")
        }

        const payload: AdoptionRequest["Insert"] = {
            requester_id: requesterId,
            post_id: postId,
            post_owner_id: postOwnerId,
            status,
        }

        const { data, error } = await supabase
            .from("adoption_request")
            .insert([payload])
            .select("*")
            .single()

        if (error || !data) throw new AppError(500, "Error al crear la solicitud de adopción")

        return AppResponse(res, 201, "Solicitud de adopción creada exitosamente", data)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

// ----------------- PATCH -----------------
export const updateAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const patch: AdoptionRequest["Update"] = req.body

    try {
        const numericId = toNum(id, "id")

        const { data: existing, error: findErr } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .single()
        if (findErr || !existing) throw new AppError(404, "Solicitud de adopción no encontrada")

        const uid = req.user?.id ?? null
        const isAdmin = req.user?.role === 19
        const isRequester = uid != null && existing.requester_id === uid
        const isOwner = uid != null && existing.post_owner_id === uid
        if (!isAdmin && !isRequester && !isOwner) {
            throw new AppError(403, "No autorizado para actualizar esta solicitud")
        }

        if (typeof patch.status !== "undefined" && patch.status !== null) {
            if (!isValidStatus(patch.status)) throw new AppError(400, "status inválido")
        }

        if (patch.requester_id != null) {
            const rid = toNum(patch.requester_id, "requester_id")
            const { data, error } = await supabase.from("users").select("id").eq("id", rid).single()
            if (error || !data) throw new AppError(404, "Usuario solicitante no encontrado")
        }
        if (patch.post_owner_id != null) {
            const oid = toNum(patch.post_owner_id, "post_owner_id")
            const { data, error } = await supabase.from("users").select("id").eq("id", oid).single()
            if (error || !data) throw new AppError(404, "Propietario del post no encontrado")
        }
        if (patch.post_id != null) {
            const pid = toNum(patch.post_id, "post_id")
            const { data, error } = await supabase.from("post").select("id").eq("id", pid).single()
            if (error || !data) throw new AppError(404, "Post no encontrado")
        }

        const payload: AdoptionRequest["Update"] = {
            ...patch,
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from("adoption_request")
            .update(payload)
            .eq("id", numericId)
            .select("*")
            .single()

        if (error || !data) throw new AppError(500, "Error al actualizar la solicitud de adopción")

        return AppResponse(res, 200, "Solicitud de adopción actualizado exitosamente", data)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

// ----------------- DELETE -----------------
export const deleteAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        const numericId = toNum(id, "id")

        const { data: existing, error: findErr } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .single()
        if (findErr || !existing) throw new AppError(404, "Solicitud de adopción no encontrada")

        const uid = req.user?.id ?? null
        const isAdmin = req.user?.role === 19
        const isRequester = uid != null && existing.requester_id === uid
        const isOwner = uid != null && existing.post_owner_id === uid
        if (!isAdmin && !isRequester && !isOwner) {
            throw new AppError(403, "No autorizado para eliminar esta solicitud")
        }

        const { data, error } = await supabase
            .from("adoption_request")
            .delete()
            .eq("id", numericId)
            .select("*")
            .single()

        if (error || !data) throw new AppError(500, "Error al eliminar la solicitud de adopción")

        return AppResponse(res, 200, "Solicitud de adopción eliminada exitosamente", {
            id: data.id,
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}
