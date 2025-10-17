import type { Response, NextFunction } from "express"
import { AppError } from "@repo/utils"
import type { AuthenticatedRequest } from "@repo/utils"
import { supabase } from "../index"

const ADMIN_ROLE_ID = 19

export const requireSavedPostOwnership = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id
        const userRole = req.user?.role
        const savedPostId = req.params.id

        if (!userId) {
            throw new AppError(401, "No autenticado")
        }

        // Admins can manage any saved post
        if (userRole === ADMIN_ROLE_ID) {
            return next()
        }

        if (!savedPostId) {
            throw new AppError(400, "ID de publicación guardada requerido")
        }

        const savedPostIdNum = Number(savedPostId)
        if (!Number.isFinite(savedPostIdNum)) {
            throw new AppError(400, "ID de publicación guardada inválido")
        }

        const { data: savedPost, error } = await supabase
            .from("saved_post")
            .select("user_id")
            .eq("id", savedPostIdNum)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                throw new AppError(404, "Publicación guardada no encontrada")
            }
            throw new AppError(500, "Error al verificar la propiedad de la publicación guardada")
        }

        const savedPostUserId = savedPost?.user_id
        if (Number(savedPostUserId) !== Number(userId)) {
            throw new AppError(403, "No autorizado para acceder a esta publicación guardada")
        }

        next()
    } catch (error) {
        next(error)
    }
}

export const requireValidSaveAction = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id
        const { post_id } = req.body as { post_id?: number }

        if (!userId) {
            throw new AppError(401, "No autenticado")
        }

        if (!post_id) {
            throw new AppError(400, "post_id es requerido")
        }

        const postIdNum = Number(post_id)
        if (!Number.isFinite(postIdNum)) {
            throw new AppError(400, "post_id inválido")
        }

        const { data: post, error } = await supabase
            .from("post")
            .select("creator_id")
            .eq("id", postIdNum)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                throw new AppError(404, "Publicación no encontrada")
            }
            throw new AppError(500, "Error al verificar la publicación")
        }

        if (post?.creator_id === userId) {
            throw new AppError(400, "No puedes guardar tu propia publicación")
        }

        next()
    } catch (error) {
        next(error)
    }
}
