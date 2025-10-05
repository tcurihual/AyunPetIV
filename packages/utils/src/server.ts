import express from "express"
import { mountTaskStubs } from "./endpoints.stubs"

const app = express()
app.use(express.json())

mountTaskStubs(app)

export default app
