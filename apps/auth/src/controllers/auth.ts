import { Request, Response } from "express"
import { supabase } from "../"
import { AppError, AppResponse, Database, hashPassword } from "@repo/utils"

type UserInsert = Database["public"]["Tables"]["users"]["Insert"]

type Variation = "user" | "giver" | "shelter"

export const register = async (
    req: Request<{ variation: Variation }, any, UserInsert>,
    res: Response
) => {
    const { variation } = req.params
    const user = req.body

    if (!variation) throw new Error("No se ingresaron params")

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
        .maybeSingle()

    if (roleError) throw new AppError(500, "Ocurrio un error inesperado")
    if (!roleSelect) throw new AppError(404, "Ocurrio un error inesperado")

    const hashedPassword = await hashPassword(user.password)

    const payload: UserInsert = {
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
