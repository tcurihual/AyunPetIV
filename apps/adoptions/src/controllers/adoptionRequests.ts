import { Request, Response } from "express"
import {
    AdoptionHistory,
    AppResponse,
    AdoptionRequest,
    AuthenticatedRequest,
    AppError,
    sendEmail,
} from "@repo/utils"
import { supabase } from "../index"
import { getMultipleEntityImages, getEntityImages } from "../utils/mediaService"

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

        if (request.requester_id == null) {
            throw new AppError(500, "ID del solicitante no disponible")
        }

        const { data: requesterUser, error: requesterLookupErr } = await supabase
            .from("users")
            .select("email, name")
            .eq("id", request.requester_id)
            .maybeSingle()
        if (requesterLookupErr) throw new AppError(500, requesterLookupErr.message)

        if (requesterUser?.email) {
            const adopterName = requesterUser.name || "Adoptante"
            const html = `
                <div style="font-family: Arial, sans-serif; color:#333;">
                    <h2 style="color:#2E8B57;">¡Adopción completada! 🐾</h2>
                    <p>Hola ${adopterName},</p>
                    <p>
                        Felicitaciones, la adopción ha sido confirmada exitosamente.
                        Gracias por brindarle un nuevo hogar a tu nueva mascota.
                    </p>
                    <p style="margin-top:24px;">Con cariño,<br/>Equipo Ayün Pet</p>
                </div>
            `

            sendEmail({
                to: requesterUser.email,
                subject: "¡Felicitaciones! Tu adopción fue confirmada",
                html,
            }).catch((err) => {
                console.error("Error al enviar correo de adopción completada:", err)
            })
        }

        return AppResponse(res, 200, "Adopción validada y cerrada", { status: "completed" })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}
export const listMyRequests = async (req: Request, res: Response) => {
    try {
        const rawUserId = req.user.id
        const numericUserId = Number(rawUserId)
        if (!Number.isFinite(numericUserId)) {
            throw new AppError(400, "ID de usuario inválido")
        }

        const { data: requests, error: e4 } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("post_owner_id", numericUserId)
            .order("created_at", { ascending: false })
        if (e4) throw new AppError(500, e4.message)

        if (!requests || requests.length === 0) {
            return AppResponse(res, 200, "OK", { as: "giver", requests: [] })
        }

        const headers = {
            "x-user-id": String(req.user?.id ?? 0),
            "x-user-role": String(req.user?.role ?? ""),
        }
        const requestPostIds = (requests ?? []).map((r: any) => r.post_id).filter(Boolean)
        const postImages = await getMultipleEntityImages("post", requestPostIds, headers)

        let petImages: Record<string, string[]> = {}
        const postToPet: Record<number, number> = {}

        if (requestPostIds.length > 0) {
            const { data: postsInfo, error: postsErr } = await supabase
                .from("post")
                .select("id, pet_id")
                .in("id", requestPostIds)
            if (postsErr) throw new AppError(500, postsErr.message)

            const petIds = (postsInfo ?? [])
                .map((p: any) => {
                    if (p?.id && p?.pet_id) {
                        postToPet[p.id] = p.pet_id
                        return p.pet_id
                    }
                    return null
                })
                .filter(Boolean) as number[]

            if (petIds.length > 0) {
                petImages = await getMultipleEntityImages("pet", petIds, headers)
            }
        }

        const requesterIds = Array.from(
            new Set((requests ?? []).map((r: any) => Number(r.requester_id)).filter(Boolean))
        )

        let requesterMap: Record<number, string> = {}
        if (requesterIds.length > 0) {
            const { data: requesterRows, error: requesterErr } = await supabase
                .from("users")
                .select("id, name")
                .in("id", requesterIds)
            if (requesterErr) throw new AppError(500, requesterErr.message)
            requesterMap = (requesterRows ?? []).reduce(
                (acc: Record<number, string>, row: any) => {
                    const key = Number(row.id)
                    if (Number.isFinite(key)) acc[key] = row.name ?? ""
                    return acc
                },
                {}
            )
        }

        const requestsWithImages = (requests ?? []).map((r: any) => ({
            ...r,
            postImages: postImages[String(r.post_id)] || [],
            petImages:
                postToPet[r.post_id] !== undefined
                    ? petImages[String(postToPet[r.post_id])] || []
                    : [],
            requester_name: requesterMap[Number(r.requester_id)] || "",
        }))

        return AppResponse(res, 200, "OK", { as: "giver", requests: requestsWithImages })
    } catch (e: any) {
        if (e instanceof AppError) return AppResponse(res, e.statusCode ?? 500, e.message, null)
        return AppResponse(res, 500, e?.message ?? "Error desconocido", null)
    }
}

export const confirmAccept = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) throw new AppError(400, "ID inválido")

        const { data: request, error: rErr } = await supabase
            .from("adoption_request")
            .select("id, requester_id, status, post_owner_id")
            .eq("id", id)
            .single()
        if (rErr || !request) throw new AppError(404, "Solicitud no encontrada")

        if (!req.user?.id) throw new AppError(401, "Usuario no autenticado")
        if (request.post_owner_id !== req.user.id) throw new AppError(403, "No tienes permiso para aceptar esta solicitud")

        const { error: updErr } = await supabase
            .from("adoption_request")
            .update({ status: "approved" })
            .eq("id", id)
        if (updErr) throw new AppError(500, updErr.message)

        const code = String(Math.floor(100000 + Math.random() * 900000))
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

        let requesterUser: { email?: string | null; name?: string | null } | null = null
        if (request.requester_id != null) {
            const { data, error: requesterErr } = await supabase
                .from("users")
                .select("email, name")
                .eq("id", request.requester_id)
                .maybeSingle()
            if (requesterErr) throw new AppError(500, requesterErr.message)
            requesterUser = data
        }

        if (requesterUser?.email) {
            const adopterName = requesterUser.name || "Adoptante"
            const html = `
                <div style="font-family: Arial, sans-serif; color:#333;">
                    <h2 style="color:#2E8B57;">¡Solicitud aceptada! 🐾</h2>
                    <p>Hola ${adopterName},</p>
                    <p>
                        Tu solicitud de adopción ha sido aceptada. Para completar el proceso,
                        comparte el siguiente código con el dador cuando te reúnas:
                    </p>
                    <div style="margin:20px 0; padding:16px; border:1px solid #FFD24C; border-radius:8px; text-align:center;">
                        <span style="font-size:28px; font-weight:bold; letter-spacing:4px;">${code}</span>
                    </div>
                    <p>El código expira el <strong>${new Date(expiresAt).toLocaleString()}</strong>.</p>
                    <p style="margin-top:24px;">¡Gracias por dar un hogar lleno de amor!</p>
                    <p>Equipo Ayün Pet</p>
                </div>
            `

            sendEmail({
                to: requesterUser.email,
                subject: "Tu código de adopción - Ayün Pet",
                html,
            }).catch((err) => {
                console.error("Error al enviar correo de confirmación de adopción:", err)
            })
        }

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

export const getAdoptionRequests = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        if (id) {
            const numericId = parseInt(id)
            if (isNaN(numericId)) {
                throw new Error("ID debe ser un número válido")
            }

            const { data: adoptionRequest, error } = await supabase
                .from("adoption_request")
                .select("*")
                .eq("id", numericId)
                .maybeSingle()

            if (error || !adoptionRequest) throw new Error("Solicitud de adopción no encontrada")

            let postImages: string[] = []
            if (adoptionRequest?.post_id) {
                const headers = {
                    "x-user-id": String(req.user?.id ?? 0),
                    "x-user-role": String(req.user?.role ?? ""),
                }
                postImages = await getEntityImages("post", adoptionRequest.post_id, headers)
            }

            const requesterPromise = adoptionRequest.requester_id
                ? supabase
                      .from("users")
                      .select("id, name")
                      .eq("id", adoptionRequest.requester_id)
                      .maybeSingle()
                : Promise.resolve({ data: null, error: null } as any)

            const postPromise = adoptionRequest.post_id
                ? supabase
                      .from("post")
                      .select("id, pet_id")
                      .eq("id", adoptionRequest.post_id)
                      .maybeSingle()
                : Promise.resolve({ data: null, error: null } as any)

            const [requesterInfo, postInfo] = await Promise.all([requesterPromise, postPromise])

            let petImages: string[] = []
            if (postInfo.data?.pet_id) {
                const headers = {
                    "x-user-id": String(req.user?.id ?? 0),
                    "x-user-role": String(req.user?.role ?? ""),
                }
                petImages = await getEntityImages("pet", postInfo.data.pet_id, headers)
            }

            return AppResponse(res, 200, "Solicitud de adopción obtenida exitosamente", {
                ...adoptionRequest,
                postImages,
                petImages,
                requester_name: requesterInfo?.data?.name ?? null,
            })
        } else {
            // Filtrar según rol del usuario
            const userRole = req.user?.role
            const userId = req.user?.id

            // Giver: devolver solicitudes relacionadas con sus posts/pets
            if (userRole === 21) {
                // Reutilizar listMyRequests (ya realiza las consultas y responde)
                return await listMyRequests(req as unknown as Request, res)
            }

            // Adopter (usuario normal): devolver solo sus propias solicitudes
            if (userRole === 20) {
                if (!userId) throw new Error("Usuario no autenticado")
                const numericUserId = Number(userId)

                const { data: adoptionRequests, error } = await supabase
                    .from("adoption_request")
                    .select("*")
                    .eq("requester_id", numericUserId)
                    .order("created_at", { ascending: false })

                if (error) throw new Error("Error al obtener las solicitudes de adopción")

                const postIds = (adoptionRequests ?? []).map((r: any) => r.post_id).filter(Boolean)
                const postImages = await getMultipleEntityImages("post", postIds)

                const requestsWithImages = (adoptionRequests ?? []).map((r: any) => ({
                    ...r,
                    postImages: postImages[String(r.post_id)] || [],
                }))

                return AppResponse(
                    res,
                    200,
                    "Solicitudes de adopción obtenidas exitosamente",
                    requestsWithImages
                )
            }

            const { data: adoptionRequests, error } = await supabase
                .from("adoption_request")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw new Error("Error al obtener las solicitudes de adopción")

            const postIds = (adoptionRequests ?? []).map((r: any) => r.post_id).filter(Boolean)
            const headers = {
                "x-user-id": String(req.user?.id ?? 0),
                "x-user-role": String(req.user?.role ?? ""),
            }
            const postImages = await getMultipleEntityImages("post", postIds, headers)

            const requestsWithImages = (adoptionRequests ?? []).map((r: any) => ({
                ...r,
                postImages: postImages[String(r.post_id)] || [],
            }))

            return AppResponse(
                res,
                200,
                "Solicitudes de adopción obtenidas exitosamente",
                requestsWithImages
            )
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}

export const createAdoptionRequest = async (req: Request, res: Response) => {
    const { post_id, status, message } = req.body

    try {
        if (!post_id) {
            throw new Error("post_id es un campo requerido")
        }

        const { data: post, error: postError } = await supabase
            .from("post")
            .select("id, creator_id")
            .eq("id", post_id)
            .maybeSingle()

        if (postError || !post) {
            throw new Error("Post no encontrado")
        }

        const requester_id = req.user.id
        const post_owner_id = post.creator_id

        if (!post_owner_id) {
            throw new Error("No se pudo determinar el dueño del post")
        }

        if (requester_id === post_owner_id) {
            throw new Error("No puedes solicitar adopción de tu propio post")
        }

        const { data: existingRequests, error: existingError } = await supabase
            .from("adoption_request")
            .select("id")
            .eq("requester_id", requester_id)
            .eq("post_owner_id", post_owner_id)
            .eq("post_id", post_id)
            .eq("status", "pending")

        if (existingError) throw new Error("Error al verificar solicitudes existentes")

        if ((existingRequests ?? []).length > 0) {
            throw new Error("Ya existe una solicitud pendiente para este post")
        }

        const payload: AdoptionRequest["Insert"] = {
            requester_id,
            post_id,
            post_owner_id,
            status: "pending",
            message: message || null,
        }

        const { data: newAdoptionRequest, error: insertError } = await supabase
            .from("adoption_request")
            .insert([payload])
            .select()
            .maybeSingle()

        if (insertError || !newAdoptionRequest)
            throw new Error("Error al crear la solicitud de adopción")

        return AppResponse(
            res,
            201,
            "Solicitud de adopción creada exitosamente",
            newAdoptionRequest
        )
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}

export const updateAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { status } = req.body
    const { message } = req.body

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new Error("ID debe ser un número válido")
        }

        if (!req.user?.id) {
            return AppResponse(res, 401, "Usuario no autenticado", null)
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new Error("Solicitud de adopción no encontrada")

        if (typeof status !== "undefined") {
            if (status === "approved" || status === "completed") {
                if (existingRequest.requester_id === req.user.id) {
                    return AppResponse(res, 403, "No tienes permiso para cambiar el estado de esta solicitud", null)
                }

                return AppResponse(
                    res,
                    403,
                    "Para aprobar/confirmar una adopción utiliza los endpoints de confirmación (confirmAccept/validate-code)",
                    null
                )
            }

            if (existingRequest.post_owner_id !== req.user.id) {
                return AppResponse(res, 403, "No tienes permiso para cambiar el estado de esta solicitud", null)
            }
        }

        if (typeof message !== "undefined" && existingRequest.requester_id !== req.user.id) {
            return AppResponse(res, 403, "Solo el usuario que hizo la solicitud puede editar el mensaje", null)
        }

        if (existingRequest.requester_id !== req.user.id && existingRequest.post_owner_id !== req.user.id) {
            return AppResponse(res, 403, "No tienes permiso para actualizar esta solicitud de adopción", null)
        }

        const forbiddenIdFields = ["id", "post_id", "requester_id", "post_owner_id"]
        for (const f of forbiddenIdFields) {
            if (typeof (req.body as any)[f] !== "undefined" && (req.body as any)[f] !== (existingRequest as any)[f]) {
                return AppResponse(res, 403, `No tienes permiso para editar el campo ${f}`, null)
            }
        }

        const payload: Partial<AdoptionRequest["Update"]> = {}

        if (typeof status !== "undefined" && existingRequest.post_owner_id === req.user.id && status !== existingRequest.status) {
            payload.status = status
        }

        if (typeof message !== "undefined" && existingRequest.requester_id === req.user.id && message !== existingRequest.message) {
            payload.message = message
        }

        if (Object.keys(payload).length === 0) {
            return AppResponse(res, 200, "No se realizaron cambios", existingRequest)
        }

        payload.updated_at = new Date().toISOString()

        const { data: updatedRequest, error: updateError } = await supabase
            .from("adoption_request")
            .update(payload)
            .eq("id", numericId)
            .select()
            .maybeSingle()

        if (updateError || !updatedRequest) throw new Error("Error al actualizar la solicitud de adopción")

        return AppResponse(res, 200, "Solicitud de adopción actualizada exitosamente", updatedRequest)
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}

export const deleteAdoptionRequest = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new Error("ID debe ser un número válido")
        }

        const { data: existingRequest, error: findError } = await supabase
            .from("adoption_request")
            .select("*")
            .eq("id", numericId)
            .maybeSingle()

        if (findError || !existingRequest) throw new Error("Solicitud de adopción no encontrada")

        if (!req.user?.id) return AppResponse(res, 401, "Usuario no autenticado", null)

        if (existingRequest.requester_id !== req.user.id) {
            return AppResponse(res, 403, "No tienes permiso para eliminar esta solicitud de adopción", null)
        }

        const { error: deleteError } = await supabase
            .from("adoption_request")
            .delete()
            .eq("id", numericId)

        if (deleteError) throw new Error("Error al eliminar la solicitud de adopción")

        return AppResponse(res, 200, "Solicitud de adopción eliminada exitosamente", {})
    } catch (e) {
        const message = e instanceof Error ? e.message : "Error interno del servidor"
        return AppResponse(res, 500, message, null)
    }
}
