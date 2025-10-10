import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import "dotenv/config"
import giverRequestRouter from "./routes/giverRequest"
import { errorHandler, ENTITIES_PORT, getHeaders, createSupabaseClient } from "@repo/utils"
import adoptionHistoryRouter from "./routes/adoptionHistory"
export const supabase = createSupabaseClient()
const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(getHeaders)

app.use(express.urlencoded({ extended: true }))

app.use("/", giverRequestRouter)
app.use("/adoption-history", adoptionHistoryRouter)

// Ruta pública
app.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Entities funcionando correctamente",
    })
})

// Ruta protegida (requiere token válido)
// app.get("/protected", authenticateToken, (req: any, res) => {
//     return res.status(200).json({
//         message: "Acceso a ruta protegida exitoso",
//         user: req.user,
//         data: {
//             timestamp: new Date().toISOString(),
//             endpoint: "/protected",
//         },
//     })
// })

// // Ruta que requiere rol admin (rol 19)
// app.get("/admin-only", authenticateToken, requireRole(19), (req: any, res) => {
//     return res.status(200).json({
//         message: "Acceso de administrador exitoso",
//         user: req.user,
//         data: {
//             timestamp: new Date().toISOString(),
//             endpoint: "/admin-only",
//             adminData: "Datos sensibles solo para admins",
//         },
//     })
// })

// // Ruta que requiere rol shelter (rol 21)
// app.get("/shelter-only", authenticateToken, requireRole(21), (req: any, res) => {
//     return res.status(200).json({
//         message: "Acceso de shelter exitoso",
//         user: req.user,
//         data: {
//             timestamp: new Date().toISOString(),
//             endpoint: "/shelter-only",
//             shelterData: "Datos específicos para refugios",
//         },
//     })
// })

// // Ruta que requiere rol user (rol 20)
// app.get("/user-only", authenticateToken, requireRole(20), (req: any, res) => {
//     return res.status(200).json({
//         message: "Acceso de usuario regular exitoso",
//         user: req.user,
//         data: {
//             timestamp: new Date().toISOString(),
//             endpoint: "/user-only",
//             userData: "Datos para usuarios regulares",
//         },
//     })
// })

app.use(errorHandler)

app.listen(ENTITIES_PORT, () => {
    console.log(`🚀 Entities service running on ${ENTITIES_PORT}`)
})

declare global {
    namespace Express {
        interface Request {
            user: {
                id: number
                role: number | null
            }
        }
    }
}
