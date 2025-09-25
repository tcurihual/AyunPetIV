import express from "express"
import cors from "cors"
import authRouter from "./routes/auth"
import { AUTH_PORT } from "@repo/utils"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/", authRouter)

app.listen(AUTH_PORT || 4000, () => {
    console.log("Auth service running on", process.env.AUTH_PORT || 4000)
})
