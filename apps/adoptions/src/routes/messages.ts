import { Router } from "express"
import { getMessages, createMessage, updateMessage, deleteMessage } from "../controllers/messages"

const router = Router()

router.get("/", getMessages)
router.get("/:id", getMessages)
router.post("/", createMessage)
router.put("/:id", updateMessage)
router.delete("/:id", deleteMessage)

export default router
