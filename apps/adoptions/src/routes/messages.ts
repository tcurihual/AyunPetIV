import { Router } from "express"
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/messages"

const router = Router()

router.get("/messages", getMessages)
router.get("/messages/:id", getMessages)
router.post("/messages", createMessage)
router.put("/messages/:id", updateMessage)
router.delete("/messages/:id", deleteMessage)

export default router
