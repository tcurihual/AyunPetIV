import { Router } from "express"
import * as ctrl from "../controllers/questions"
import { requireRole, requireOwnership } from "@repo/utils"

const route = Router()

route.get("/", ctrl.listQuestions)

route.get("/:id", ctrl.getQuestionById)

route.post("/", requireRole(19), ctrl.createQuestion)

route.patch("/:id", requireRole(19), ctrl.updateQuestion)

route.delete("/:id", requireRole(19), ctrl.deleteQuestion)

export default route
