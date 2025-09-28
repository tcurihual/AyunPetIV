import express from "express"
import path from "path"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import router from "./routes"
import { errorHandler } from "./middleware/error"

const app = express()

app.use(cors({
  origin: true,
  credentials: false,
  methods: ["GET","POST","DELETE","OPTIONS"],
}))

app.use(helmet({ crossOriginResourcePolicy: false }))

app.use(morgan("dev"))
app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use("/", router)

app.use((_req, res) => res.status(404).json({ error: "Not Found" }))
app.use(errorHandler)

const port = Number(process.env.PORT ?? 8080)
app.listen(port, () => {
  console.log(`Media listo en http://localhost:${port}`)
})
