import express from "express"
import path from "path"
import router from "./routes"
import { errorHandler } from "./middleware/error"

const app = express()
app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use("/", router)

app.use((_req, res) => res.status(404).json({ error: "Not Found" }))

app.use(errorHandler)

app.listen(process.env.PORT ?? 8080, () =>
    console.log(`Media listo en http://localhost:${process.env.PORT ?? 8080}`)
)
