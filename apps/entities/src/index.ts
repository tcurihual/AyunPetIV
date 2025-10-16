import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import "dotenv/config"

import { errorHandler, ENTITIES_PORT, createSupabaseClient, getHeaders } from "@repo/utils"

import giverRequestRouter from "./routes/giverRequest"
import adoptionHistoryRouter from "./routes/adoptionHistory"
import adoptionRequestRouter from "./routes/adoptionRequest"
import questionsRoutes from "./routes/questions"
import postFormRouter from "./routes/postForm"
import verificationCodeRouter from "./routes/verificationCode"
import newsRouter from "./routes/news"
import usersRouter from "./routes/users"
import formResponsesRoutes from "./routes/formResponses"

export const supabase = createSupabaseClient()

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(getHeaders) 

app.use(express.urlencoded({ extended: true }))

app.use("/v1/entities/giver-request", giverRequestRouter)
app.use("/v1/entities/adoption-history", adoptionHistoryRouter)
app.use("/v1/entities/adoption-requests", adoptionRequestRouter)
app.use("/v1/entities/questions", questionsRoutes)
app.use("/v1/entities/post-form", postFormRouter)
app.use("/v1/entities/verification-codes", verificationCodeRouter)
app.use("/v1/entities/news", newsRouter)
app.use("/v1/entities/users", usersRouter)
app.use("/v1/entities/form-responses", formResponsesRoutes)

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
