import { Router } from "express"
import { login, register } from "../controllers/request"

const router = Router()

router.post("/login", login)

router.post("/register/:variation", register)

export default router
