
import express from "express"
import { supabase } from "../index"
import { requireAuth } from "@repo/utils"
import {
    listSavedPosts,
    getSavedPostById,
    savePost,
    checkIfPostIsSaved,
    removeSavedPost,
    removeSavedPostByPostId,
} from "../controllers/savedPosts"
import {
    requireSavedPostOwnership,
    requireValidSaveAction,
} from "../middlewares/savedPostsMiddleware"

const router = express.Router()

router.get("/posts", async (req, res) => {
    try {
        const { data: posts, error } = await supabase
            .from("post")
            .select(
                `
                *,
                creator:users(*),
                pet:pet(*)
            `
            )
            .eq("status", "active")

        if (error) {
            return res.status(500).json({
                status: 500,
                message: "Error al obtener publicaciones",
                error: error.message,
            })
        }

        return res.status(200).json({
            status: 200,
            message: "Publicaciones obtenidas exitosamente",
            data: posts || [],
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error?.message || "Error desconocido",
        })
    }
})

router.post("/posts", async (req, res) => {
    try {
        return res.status(201).json({
            status: 201,
            message: "Publicación creada exitosamente",
            data: { id: Date.now(), ...req.body },
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Error al crear publicación",
            error: error?.message || "Error desconocido",
        })
    }
})

router.put("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params
        return res.status(200).json({
            status: 200,
            message: "Publicación actualizada exitosamente",
            data: { id: parseInt(id), ...req.body },
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Error al actualizar publicación",
            error: error?.message || "Error desconocido",
        })
    }
})

router.delete("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params
        return res.status(200).json({
            status: 200,
            message: "Publicación eliminada exitosamente",
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Error al eliminar publicación",
            error: error?.message || "Error desconocido",
        })
    }
})

router.get("/saved-posts", requireAuth, listSavedPosts)


router.get("/saved-posts/:id", requireAuth, requireSavedPostOwnership, getSavedPostById)

router.get("/saved-posts/check/:postId", requireAuth, checkIfPostIsSaved)

router.post("/saved-posts", requireAuth, requireValidSaveAction, savePost)

router.delete("/saved-posts/:id", requireAuth, requireSavedPostOwnership, removeSavedPost)

router.delete("/saved-posts/post/:postId", requireAuth, removeSavedPostByPostId)

export default router