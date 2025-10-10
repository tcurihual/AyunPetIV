import { Request, Response } from "express"
import { supabase } from "../"
import {
    AppError,
    AppResponse,
    comparePassword,
    User,
    generateAuthToken,
    hashPassword,
} from "@repo/utils"
import jwt from "jsonwebtoken"
import { emailTemplate } from "../utils/templates/emailVerificationTemplate"
import { resetPasswordTemplate } from "../utils/templates/resetPasswordTemplate"
import { sendEmail } from "@repo/utils"
type Variation = "user" | "giver" | "shelter"

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (!email || !password) throw new AppError(404, "Faltan crendenciales")

    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()
    if (error) throw new AppError(404, "El usuario no existe")

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) throw new AppError(401, "Datos ingresados no son validos")

    const payload = {
        id: user.id,
        role: user.role,
    }
    const token = generateAuthToken(payload)
    if (!token) throw new AppError(500, "Ocurrio un error inesperado")

    return AppResponse(res, 200, "Inicio de sesión exitoso", { user, token })
}

export const register = async (
    req: Request<{ variation: Variation }, any, User["Row"]>,
    res: Response
) => {
    const { variation } = req.params
    const user = req.body

    if (!variation) throw new AppError(500, "No se ingresaron params")

    const { data: userExists, error: findError } = await supabase
        .from("users")
        .select("email, rut")
        .or(`email.eq.${user.email},rut.eq.${user.rut}`)
        .maybeSingle()

    if (findError) throw new AppError(500, "Ocurrio un error inesperado")

    if (userExists) {
        const rut = userExists.rut === user.rut
        throw new AppError(409, rut ? "El RUT ya está registrado" : "El email ya está registrado")
    }

    const { data: roleSelect, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("roletype", variation)
        .single()

    if (roleError) throw new AppError(500, "Ocurrio un error inesperado")

    const hashedPassword = await hashPassword(user.password)
    if (!hashedPassword) throw new AppError(500, "Ocurrio un error inesperado")

    const payload: User["Insert"] = {
        name: user.name,
        email: user.email,
        rut: user.rut,
        password: hashedPassword,
        role: roleSelect.id,
        validated: false,
        address: user.address ?? null,
        description: user.description ?? null,
    }

    const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET!, { expiresIn: "1h" })
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    await sendEmail({
        to: user.email,
        subject: "Verifica tu cuenta en Ayün Pet 🐾",
        html: emailTemplate(verificationLink),
    })

    const { error: insertError } = await supabase.from("users").insert([payload])

    if (insertError) throw new AppError(500, "Ocurrio un problema al crear el usuario")

    return AppResponse(res, 201, "Usuario creado exitosamente", {})
}

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body

        if (!token) throw new AppError(400, "Token no proporcionado")

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }

        const { data: user, error: findError } = await supabase
            .from("users")
            .select("email, validated")
            .eq("email", decoded.id)
            .single()

        if (findError || !user) throw new AppError(404, "Usuario no encontrado")

        if (user.validated)
            return AppResponse(res, 200, "El correo ya estaba validado anteriormente", {})

        const { error: updateError } = await supabase
            .from("users")
            .update({ validated: true })
            .eq("email", decoded.id)

        if (updateError) throw new AppError(500, "Error al actualizar el estado de validación")

        return AppResponse(res, 200, "Correo verificado correctamente ✅", {})
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new AppError(
                401,
                "El token ha expirado. Solicita un nuevo correo de verificación."
            )
        }
        if (error.name === "JsonWebTokenError") {
            throw new AppError(400, "Token inválido")
        }
        console.error(error)
        throw new AppError(500, "Ocurrió un error al verificar el correo")
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) throw new AppError(400, "Debe proporcionar un correo electrónico")

        const { data: user, error } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .single()

        if (error || !user) throw new AppError(404, "No existe un usuario con ese correo")

        const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET!, { expiresIn: "30m" })
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

        // Enviar correo
        await sendEmail({
            to: email,
            subject: "Recupera tu contraseña — Ayün Pet 🐾",
            html: resetPasswordTemplate(resetLink),
        })

        return AppResponse(res, 200, "Correo de recuperación enviado correctamente", {})
    } catch (error) {
        console.error("❌ ERROR EN forgotPassword:", error)
        throw new AppError(500, "Error al enviar el correo de recuperación")
    }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword)
      throw new AppError(400, "Token y nueva contraseña son requeridos")

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("email")
      .eq("email", decoded.id)
      .single()

    if (findError || !user)
      throw new AppError(404, "Usuario no encontrado o token inválido")

    const hashedPassword = await hashPassword(newPassword)
    if (!hashedPassword) throw new AppError(500, "Error al encriptar la contraseña")

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", user.email)

    if (updateError) throw new AppError(500, "Error al actualizar la contraseña")

    return AppResponse(res, 200, "Contraseña restablecida correctamente ✅", {})
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(401, "El token ha expirado. Solicita un nuevo correo de recuperación.")
    }
    if (error.name === "JsonWebTokenError") {
      throw new AppError(400, "Token inválido")
    }
    console.error("❌ ERROR EN resetPassword:", error)
    throw new AppError(500, "Error al restablecer la contraseña")
  }
}
