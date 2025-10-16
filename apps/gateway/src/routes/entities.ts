import express from "express"
import proxy from "express-http-proxy"

const router = express.Router()

// 👇 Asegúrate que este puerto coincide con el del microservicio entities
router.use("/", proxy("http://localhost:7000"))

export default router
