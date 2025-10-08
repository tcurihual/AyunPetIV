import { Request, Response } from "express"
import { supabase } from "../"
import {
    AppError,
    AppResponse,
    comparePassword,
    User,
    generateAuthToken,
    hashPassword,
    enqueueMail,
} from "@repo/utils"

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
    enqueueMail(email, "Inicio de sesión", "Tu sesión se inició correctamente ✅")
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

    // TODO: envio de correos a usuarios, según rol

    const { error: insertError } = await supabase.from("users").insert([payload])

    if (insertError) throw new AppError(500, "Ocurrio un problema al crear el usuario")

    return AppResponse(res, 201, "Usuario creado exitosamente", {})
}
