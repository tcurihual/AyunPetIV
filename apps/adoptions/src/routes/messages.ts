import { Router } from "express"
import { verifyAuth } from "@repo/utils"
import { getMessages, createMessage, updateMessage, deleteMessage } from "../controllers/messages"

const router = Router()

router.get("/", verifyAuth, getMessages)
router.get("/:id", verifyAuth, getMessages)
router.post("/", verifyAuth, createMessage)
router.put("/:id", verifyAuth, updateMessage)
router.delete("/:id", verifyAuth, deleteMessage)

export default router
