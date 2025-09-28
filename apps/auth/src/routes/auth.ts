import { Router } from "express"
import { register } from "../controllers/auth"

const router = Router()

router.post("/login", async (req, res) => {
    // const { email, password } = req.body
    // if (!email || !password) throw new AppError(404, "Missing credentials")
    // // ejemplo de como hacer query
    // const { data, error } = await supabase.from("users").select("*").eq("email", email).single()
    // if (error) throw new AppError(404, "User not found")
    // // ejemplo de como tipear la query
    // const user: User = data
    // // TODO: comparar password, generar token, realizar response
    // // comparePassword(password, user.password)
    // return AppResponse(res, 200, "Inicio de sesión exitoso", user)
})

router.post("/register/:variation", register)

export default router
