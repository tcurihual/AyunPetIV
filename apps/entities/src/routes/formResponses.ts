import { Router } from "express"
import { list, create, update, remove, listByPublication } from "../controllers/formResponses"

const router = Router()

router.get("/", list)
router.post("/", create)
router.put("/:id", update)
router.delete("/:id", remove)
router.get("/publication/:postId", listByPublication)

export default router
