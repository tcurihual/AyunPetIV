import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import { createSupabaseClient, AUTH_PORT, errorHandler } from "@repo/utils"
import authRouter from "./routes/auth"

export const supabase = createSupabaseClient()
const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", authRouter)

app.use(errorHandler)
app.listen(AUTH_PORT, () => {
    console.log(`🚀 Adoptions service running on ${AUTH_PORT}`)
})
