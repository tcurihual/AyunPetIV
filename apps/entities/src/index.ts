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

app.use("/giver-request", giverRequestRouter)
app.use("/adoption-history", adoptionHistoryRouter)
app.use("/questions", questionsRoutes)
app.use("/post-form", postFormRouter)
app.use("/verification-codes", verificationCodeRouter)
app.use("/news", newsRouter)
app.use("/users", usersRouter)
app.use("/form-responses", formResponsesRoutes)

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
