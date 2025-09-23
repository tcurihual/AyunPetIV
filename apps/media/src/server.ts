import express from "express"
import cors from "cors"
import mediaRoutes from "./media.routes"

const app = express()
app.use(cors({ origin: "*"})) // simple para dev

app.use("/api", mediaRoutes)

const PORT = Number(process.env.PORT) || 3000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Media server escuchando en http://0.0.0.0:${PORT}`);
});


