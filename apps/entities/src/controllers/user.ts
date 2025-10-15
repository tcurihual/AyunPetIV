import type { Response } from "express"
import { AppResponse, AppError, AuthenticatedRequest, User, UpdateUserSchema } from "@repo/utils"
import { supabase } from "../index"
import { getEntityImages, getMultipleEntityImages } from "../utils/mediaService"

const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21 } as const
type RoleType = keyof typeof ROLES
const roleIdFromType = (rt: RoleType) => ROLES[rt]
const isValidRoleId = (rid: number | null | undefined) =>
    rid === ROLES.ADMIN || rid === ROLES.USER || rid === ROLES.SHELTER

const isAdmin = (req: AuthenticatedRequest) => req.user?.role === ROLES.ADMIN
const isSelf = (req: AuthenticatedRequest, userId: number) => req.user?.id === userId

const parseId = (v: string) => {
    const n = Number(v)
    if (!Number.isFinite(n)) throw new AppError(400, "ID inválido")
    return n
}

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const roleIdParam = req.query.role ? Number(req.query.role) : undefined
        const roleTypeParam = req.query.roleType
            ? (String(req.query.roleType).toLowerCase() as "admin" | "user" | "shelter")
            : undefined

        let query = supabase.from("users").select("*", { count: "exact" })

        if (roleIdParam !== undefined) {
            query = query.eq("role", roleIdParam)
        } else if (roleTypeParam) {
            const rid = roleIdFromType(roleTypeParam.toUpperCase() as RoleType)
            query = query.eq("role", rid)
        }

        const page = Math.max(Number(req.query.page ?? 1), 1)
        const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100)
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query.order("id", { ascending: true }).range(from, to)

        if (error) throw new AppError(500, error.message)

        // Obtener imágenes de los usuarios (tipo giver)
        const userIds = (data ?? []).map((u) => u.id).filter(Boolean)
        const userImages = await getMultipleEntityImages("giver", userIds)

        const itemsWithImages = (data ?? []).map((user) => ({
            ...user,
            images: userImages[String(user.id)] || [],
        }))

        return AppResponse(res, 200, "Listado de usuarios", {
            items: itemsWithImages,
            total: count ?? 0,
            page,
            pageSize,
            totalPages: Math.ceil((count ?? 0) / pageSize),
        })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener usuarios")
    }
}

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)
        if (!isAdmin(req) && !isSelf(req, id))
            throw new AppError(403, "No autorizado para ver este perfil")

        const { data, error } = await supabase.from("users").select("*").eq("id", id).single()
        if (error || !data) throw new AppError(404, "Usuario no encontrado")

        // Obtener imágenes del usuario
        const images = await getEntityImages("giver", id)

        return AppResponse(res, 200, "Usuario", {
            ...data,
            images,
        } as User["Row"] & { images: string[] })
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al obtener usuario")
    }
}

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!isAdmin(req)) throw new AppError(403, "Solo ADMIN puede crear usuarios")

        const { email, name, rut, password, address, description, role, roleType, validated } =
            req.body as Partial<User["Insert"]> & { roleType?: RoleType }

        if (!email || !name || !rut || !password) {
            throw new AppError(400, "Faltan campos obligatorios (email, name, rut, password)")
        }

        {
            const { data: byEmail } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .maybeSingle()
            if (byEmail) throw new AppError(409, "Email ya registrado")
            const { data: byRut } = await supabase
                .from("users")
                .select("id")
                .eq("rut", rut)
                .maybeSingle()
            if (byRut) throw new AppError(409, "RUT ya registrado")
        }

        let roleId: number | null
        if (typeof roleType !== "undefined") {
            roleId = roleIdFromType(roleType)
        } else if (typeof role !== "undefined") {
            roleId = role
            if (!isValidRoleId(roleId)) throw new AppError(400, "role (id) inválido")
        } else {
            roleId = ROLES.USER
        }

        const payload: User["Insert"] = {
            email,
            name,
            rut,
            password,
            role: roleId,
            address: address ?? null,
            description: description ?? null,
            validated: validated ?? false,
        }

        const { data, error } = await supabase.from("users").insert([payload]).select("*").single()
        if (error) throw new AppError(500, error.message)

        return AppResponse(res, 201, "Creado", data as User["Row"])
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al crear usuario")
    }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)

        const admin = isAdmin(req)
        const owner = isSelf(req, id)
        if (!admin && !owner) throw new AppError(403, "No autorizado para actualizar este usuario")

        const patch = req.body as Partial<User["Update"]> & { roleType?: RoleType }

        if (
            !admin &&
            (typeof patch.role !== "undefined" ||
                typeof patch.validated !== "undefined" ||
                typeof patch.roleType !== "undefined")
        ) {
            throw new AppError(403, "No autorizado para cambiar rol/validated")
        }

        if (patch.email) {
            const { data: byEmail } = await supabase
                .from("users")
                .select("id")
                .eq("email", patch.email)
                .neq("id", id)
                .maybeSingle()
            if (byEmail) throw new AppError(409, "Email ya registrado")
        }
        if (patch.rut) {
            const { data: byRut } = await supabase
                .from("users")
                .select("id")
                .eq("rut", patch.rut)
                .neq("id", id)
                .maybeSingle()
            if (byRut) throw new AppError(409, "RUT ya registrado")
        }

        let roleField: Pick<User["Update"], "role"> | {} = {}
        if (admin) {
            if (typeof patch.role !== "undefined") {
                if (patch.role !== null && !isValidRoleId(patch.role))
                    throw new AppError(400, "role (id) inválido")
                roleField = { role: patch.role }
            } else if (typeof patch.roleType !== "undefined") {
                roleField = { role: roleIdFromType(patch.roleType) }
            }
        }

        const updatePayload: User["Update"] = {
            email: patch.email,
            name: patch.name,
            password: patch.password,
            rut: patch.rut,
            address: patch.address ?? undefined,
            description: patch.description ?? undefined,
            validated: patch.validated,
            role: (roleField as any).role,
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from("users")
            .update(updatePayload)
            .eq("id", id)
            .select("*")
            .single()

        if (error) throw new AppError(500, error.message)
        return AppResponse(res, 200, "Actualizado", data as User["Row"])
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al actualizar usuario")
    }
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseId(req.params.id)
        const admin = isAdmin(req)
        const owner = isSelf(req, id)
        if (!admin && !owner) throw new AppError(403, "No autorizado para eliminar este usuario")

        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("id", id)
            .select("*")
            .single()
        if (error) throw new AppError(500, error.message)

        return AppResponse(res, 200, "Eliminado", data as User["Row"])
    } catch (e) {
        if (e instanceof AppError) throw e
        throw new AppError(500, "Error al eliminar usuario")
    }
}
