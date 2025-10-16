import { Router } from "express"
import * as ctrl from "../controllers/questions"
import { requireRole, requireAuth, requireOwnership } from "@repo/utils"

const route = Router()

route.get("/", ctrl.listQuestions)

route.get("/:id", ctrl.getQuestionById)

route.post("/", requireAuth, requireRole(19, 21), ctrl.createQuestion)

route.patch(
    "/:id",
    requireAuth,
    requireRole(19, 21),
    requireOwnership({ tableName: "question", ownerField: "creatorid" }),
    ctrl.updateQuestion
)

// Delete - Solo admin (rol 19) puede hacer soft delete de preguntas
route.delete("/:id", requireAuth, requireRole(19), ctrl.deleteQuestion)

export default route
