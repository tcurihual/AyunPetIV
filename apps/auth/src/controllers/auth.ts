import { Request, Response } from "express"
import { supabase } from "../"
import {
    AppError,
    AppResponse,
    comparePassword,
    User,
    generateAuthToken,
    hashPassword,
    LoginSchema,
    UserInsertSchema,
} from "@repo/utils"

type Variation = "user" | "giver" | "shelter"

export const login = async (req: Request, res: Response) => {
    const validation = LoginSchema.safeParse(req.body)
    if (!validation.success) {
        const errors = validation.error.issues.map((issue) => issue.message).join(", ")
        throw new AppError(400, `Datos inválidos: ${errors}`)
    }

    const { email, password } = validation.data

    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

    if (error || !user) {
        throw new AppError(404, "El usuario no existe")
    }

    if (!user.validated) {
        throw new AppError(403, "Usuario no validado. Verifica tu email antes de continuar.")
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
        throw new AppError(401, "Credenciales inválidas")
    }

    const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
    }

    const token = generateAuthToken(payload)
    if (!token) {
        throw new AppError(500, "Error al generar token de autenticación")
    }

    const { password: _, ...userWithoutPassword } = user

    return AppResponse(res, 200, "Inicio de sesión exitoso", {
        user: userWithoutPassword,
        token,
    })
}

export const register = async (
    req: Request<{ variation: Variation }, any, User["Insert"]>,
    res: Response
) => {
    const { variation } = req.params

    const validation = UserInsertSchema.safeParse(req.body)
    if (!validation.success) {
        const errors = validation.error.issues.map((issue) => issue.message).join(", ")
        throw new AppError(400, `Datos inválidos: ${errors}`)
    }

    const user = validation.data

    if (!variation) throw new AppError(400, "No se especificó el tipo de usuario")

    if (!["user", "giver", "shelter"].includes(variation)) {
        throw new AppError(400, "Tipo de usuario inválido. Debe ser: user, giver o shelter")
    }

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

    if (roleError) throw new AppError(500, "Tipo de rol no encontrado")

    const hashedPassword = await hashPassword(user.password)
    if (!hashedPassword) throw new AppError(500, "Error al procesar la contraseña")

    const payload: User["Insert"] = {
        name: user.name,
        email: user.email,
        rut: user.rut,
        password: hashedPassword,
        role: roleSelect.id,
        validated: user.validated ?? false,
        address: user.address ?? null,
        description: user.description ?? null,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
    }

    // TODO: envio de correos a usuarios, según rol

    const { error: insertError } = await supabase.from("users").insert([payload])

    if (insertError) throw new AppError(500, "Ocurrio un problema al crear el usuario")

    return AppResponse(res, 201, "Usuario creado exitosamente", {})
}
