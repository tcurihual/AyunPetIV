import type { Response } from "express"
import { AppError, AppResponse } from "@repo/utils"
import type { AuthenticatedRequest, SavedPost } from "@repo/utils"
import { supabase } from "../index"


const parseId = (v: string) => {
    const n = Number(v)
    if (!Number.isFinite(n)) throw new AppError(400, "ID inválido")
    return n
}

export const listSavedPosts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id
        if (!userId) throw new AppError(401, "No autenticado")

        const page = Math.max(1, Number(req.query.page) || 1)
        const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10))
        const offset = (page - 1) * pageSize

        // Obtener publicaciones guardadas con información completa
        const { data, error, count } = await supabase
            .from("saved_post")
            .select(
                `
                id,
                post_id,
                user_id,
                post:post_id (
                    id,
                    title,
                    description,
                    status,
                    created_at,
                    updated_at,
                    creator_id,
                    pet_id,
                    pet:pet_id (*)
                )
            `,
                { count: "exact" }
            )
            .eq("user_id", userId)
            .order("id", { ascending: false })
            .range(offset, offset + pageSize - 1)

        if (error) throw new AppError(500, error.message)

        const items = (data ?? []).map((row) => ({
            id: row.id,
            post_id: row.post_id,
            user_id: row.user_id,
            post: row.post,
        }))

        return AppResponse(res, 200, "Listado de publicaciones guardadas", {
            items,
            total: count ?? 0,
            page,
            pageSize,
            totalPages: Math.ceil((count ?? 0) / pageSize),
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener publicaciones guardadas")
    }
}

export const getSavedPostById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)
        const userId = req.user?.id
        if (!userId) throw new AppError(401, "No autenticado")

        const { data, error } = await supabase
            .from("saved_post")
            .select(
                `
                id,
                post_id,
                user_id,
                post:post_id (
                    id,
                    title,
                    description,
                    status,
                    created_at,
                    updated_at,
                    creator_id,
                    pet_id,
                    pet:pet_id (*)
                )
            `
            )
            .eq("id", id)
            .eq("user_id", userId)
            .single()

        if (error || !data) throw new AppError(404, "Publicación guardada no encontrada")

        const payload = {
            id: data.id,
            post_id: data.post_id,
            user_id: data.user_id,
            post: data.post,
        }

        return AppResponse(res, 200, "Publicación guardada", payload)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener la publicación guardada")
    }
}

export const savePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id
        if (!userId) throw new AppError(401, "No autenticado")

        const { post_id } = req.body as { post_id: number }

        if (!post_id) throw new AppError(400, "post_id es requerido")

        // Verificar que la publicación existe
        const { data: postExists, error: postError } = await supabase
            .from("post")
            .select("id")
            .eq("id", post_id)
            .single()

        if (postError || !postExists) throw new AppError(404, "Publicación no encontrada")

        // Verificar que no esté ya guardada
        const { data: existingSave, error: checkError } = await supabase
            .from("saved_post")
            .select("id")
            .eq("user_id", userId)
            .eq("post_id", post_id)
            .single()

        if (checkError && checkError.code !== "PGRST116") {
            throw new AppError(500, checkError.message)
        }

        if (existingSave) {
            throw new AppError(409, "La publicación ya está guardada")
        }

        const savedPostInsert: SavedPost["Insert"] = {
            user_id: userId,
            post_id: post_id,
        }

        const { data: savedPost, error: saveError } = await supabase
            .from("saved_post")
            .insert([savedPostInsert])
            .select("*")
            .single()

        if (saveError || !savedPost) {
            throw new AppError(500, saveError?.message ?? "Error al guardar la publicación")
        }

        return AppResponse(res, 201, "Publicación guardada exitosamente", savedPost)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al guardar la publicación")
    }
}

/**
 * Verificar si una publicación está guardada
 */
export const checkIfPostIsSaved = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const postId = parseId(req.params.postId)
        const userId = req.user?.id
        if (!userId) throw new AppError(401, "No autenticado")

        const { data, error } = await supabase
            .from("saved_post")
            .select("id")
            .eq("user_id", userId)
            .eq("post_id", postId)
            .single()

        if (error && error.code !== "PGRST116") {
            throw new AppError(500, error.message)
        }

        const isSaved = !!data

        return AppResponse(res, 200, "Estado de guardado verificado", {
            is_saved: isSaved,
            saved_post_id: data?.id || null,
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al verificar el estado de guardado")
    }
}

export const removeSavedPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)
        const userId = req.user?.id
        if (!userId) throw new AppError(401, "No autenticado")

        const { data: savedPost, error: findError } = await supabase
            .from("saved_post")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single()

        if (findError || !savedPost) {
            throw new AppError(404, "Publicación guardada no encontrada")
        }

        const { error: deleteError } = await supabase
            .from("saved_post")
            .delete()
            .eq("id", id)
            .eq("user_id", userId)

        if (deleteError) {
            throw new AppError(500, deleteError.message)
        }

        return AppResponse(res, 200, "Publicación eliminada de guardados", savedPost)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al eliminar la publicación guardada")
    }
}

export const removeSavedPostByPostId = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const postId = parseId(req.params.postId)
        const userId = req.user?.id
        if (!userId) throw new AppError(401, "No autenticado")

        const { data: savedPost, error: findError } = await supabase
            .from("saved_post")
            .select("*")
            .eq("post_id", postId)
            .eq("user_id", userId)
            .single()

        if (findError || !savedPost) {
            throw new AppError(404, "Publicación guardada no encontrada")
        }

        const { error: deleteError } = await supabase
            .from("saved_post")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId)

        if (deleteError) {
            throw new AppError(500, deleteError.message)
        }

        return AppResponse(res, 200, "Publicación eliminada de guardados", savedPost)
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al eliminar la publicación guardada")
    }
}
