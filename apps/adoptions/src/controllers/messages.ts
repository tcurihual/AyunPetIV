import type { Response } from "express"
import { createSupabaseClient, AppResponse, AppError, AuthenticatedRequest } from "@repo/utils"
import { supabase } from ".."
import { getEntityImages } from "../utils/mediaService"

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    if (id) {
        const { data, error } = await supabase
            .from("message")
            .select("*")
            .eq("id", Number(id))
            .single()

        if (error) throw new AppError(400, "Error al obtener mensaje", { error })
        if (!data) throw new AppError(404, "Mensaje no encontrado")

        return AppResponse(res, 200, "Mensaje obtenido correctamente", data)
    }

    const { data, error } = await supabase.from("message").select("*")

    if (error) throw new AppError(400, "Error al obtener mensajes", { error })
    return AppResponse(res, 200, "Mensajes obtenidos correctamente", data)
}

export const getMessagesByPostId = async (req: AuthenticatedRequest, res: Response) => {
    const { post_id } = req.params

    if (!post_id) {
        throw new AppError(400, "El parámetro post_id es requerido")
    }

    const { data, error } = await supabase
        .from("message")
        .select("*")
        .eq("post_id", Number(post_id))
        .order("created_at", { ascending: false })

    if (error) throw new AppError(400, "Error al obtener mensajes por post_id", { error })

    // Headers para pasar al servicio de media
    const headers = req.user
        ? {
              "x-user-id": String(req.user.id),
              "x-user-role": String(req.user.role ?? ""),
          }
        : undefined

    // Enriquecer cada mensaje con información del usuario creador
    const messagesWithUserInfo = await Promise.all(
        data.map(async (message) => {
            let creator: { id: number; name: string; profilePhoto: string | null } | null = null

            if (message.creator_id) {
                // Obtener información del usuario
                const { data: userData } = await supabase
                    .from("users")
                    .select("id, name")
                    .eq("id", message.creator_id)
                    .single()

                if (userData) {
                    // Obtener foto de perfil del usuario
                    const userPhotos = await getEntityImages(
                        "profile_picture",
                        message.creator_id,
                        headers
                    )
                    creator = {
                        id: userData.id,
                        name: userData.name,
                        profilePhoto: userPhotos.length > 0 ? userPhotos[0] : null,
                    }
                }
            }

            return {
                ...message,
                creator,
            }
        })
    )

    return AppResponse(res, 200, "Mensajes obtenidos correctamente", messagesWithUserInfo)
}

export const createMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { creatorId, postId, description, status } = req.body

    const insertData = {
        creator_id: creatorId,
        post_id: postId ?? null,
        description,
        status: status ?? "active",
    }

    const { data, error } = await supabase.from("message").insert(insertData).select().single()

    if (error) throw new AppError(400, "Error al crear mensaje", { error })
    return AppResponse(res, 201, "Mensaje creado correctamente", data)
}

export const updateMessage = async (req: AuthenticatedRequest, res: Response) => {
    const supabase = createSupabaseClient()
    const { id } = req.params
    const { description, status } = req.body

    const updateData: Record<string, any> = {}
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
        .from("message")
        .update(updateData)
        .eq("id", Number(id))
        .select()
        .single()

    if (error) throw new AppError(400, "Error al actualizar mensaje", { error })
    return AppResponse(res, 200, "Mensaje actualizado correctamente", data)
}

export const deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const { error } = await supabase.from("message").delete().eq("id", Number(id))

    if (error) throw new AppError(400, "Error al eliminar mensaje", { error })
    return AppResponse(res, 200, "Mensaje eliminado correctamente", null)
}
