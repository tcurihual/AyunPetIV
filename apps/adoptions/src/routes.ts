import { Router } from "express"
import { listMyRequests } from "./controllers/mineRequests"

const router = Router()

router.get("/requests/mine", listMyRequests)

export default router
