import { Router } from "express"
import { supabase } from "../"
import { AppError, AppResponse } from "@repo/utils"
const router = Router()

router.post("/login", async (req, res) => {
    const { email, password } = req.body || {}
    // TODO: validar contra tu DB. Por ahora, finge OK si vienen ambos:
    if (!email || !password) return res.status(400).json({ msg: "Missing credentials" })

    // token fake para probar (reemplaza por JWT real)
    const token = "fake.jwt.token"
    const user = { id: "1", name: "Demo", email, role: "adoptante" }

    return res.json({ values: { token, user } })
})

router.get("/me", async (req, res) => {
    let { data: users, error } = await supabase.from("users").select("*")

    return AppResponse(res, 200, "USUARIOS INSANOS OBTENIDOs", users)
})

export default router
