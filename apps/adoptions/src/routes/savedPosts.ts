import express from "express"
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

router.get("/", listSavedPosts)
router.get("/:id", requireSavedPostOwnership, getSavedPostById)
router.get("/check/:postId", checkIfPostIsSaved)
router.post("/", requireValidSaveAction, savePost)
router.delete("/:id", requireSavedPostOwnership, removeSavedPost)
router.delete("/post/:postId", removeSavedPostByPostId)

export default router
