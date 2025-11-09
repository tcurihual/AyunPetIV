import type { Response } from "express"
import {
    AppResponse,
    AppError,
    AuthenticatedRequest,
    User,
    hashPassword,
    MEDIA_URL,
} from "@repo/utils"
import { supabase } from "../index"
import axios from "axios"
import { MEDIA_PUBLIC_URL } from "@repo/utils"

const normalizeMediaUrls = (list: any[] | undefined) => {
    const arr = Array.isArray(list) ? list : []
    return arr.map((u) => {
        try {
            if (!u) return u
            const idx = String(u).indexOf("/uploads/")
            if (idx !== -1) {
                const rel = String(u).substring(idx + 1)
                return `${MEDIA_PUBLIC_URL}/${rel}`
            }
            return u
        } catch (e) {
            return u
        }
    })
}

const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21, GIVER: 22 } as const
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

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.user?.id
    if (!id) throw new AppError(401, "No autenticado")

    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()
    if (error || !data) throw new AppError(404, "Usuario no encontrado")

    return AppResponse(res, 200, "OK", data as User["Row"])
}

export const patchMe = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.user?.id
    if (!id) throw new AppError(401, "No autenticado")

    const patch = req.body as Partial<User["Update"]>
    // Solo campos propios
    const updatePayload: User["Update"] = {
        email: patch.email,
        name: patch.name,
        password: undefined,
        rut: undefined,
        address: patch.address ?? undefined,
        description: patch.description ?? undefined,
        validated: undefined, // solo admin
        role: undefined, // solo admin
        updated_at: new Date().toISOString(),
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

    const { data, error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", id)
        .select("*")
        .single()

    if (error) throw new AppError(500, error.message)
    return AppResponse(res, 200, "Perfil actualizado", data as User["Row"])
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

        return AppResponse(res, 200, "Listado de usuarios", {
            items: data ?? [],
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
    const id = parseId(req.params.id)
    if (!isAdmin(req) && !isSelf(req, id)) throw new AppError(403, "No autorizado")
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()
    if (error || !data) throw new AppError(404, "Usuario no encontrado")
    return AppResponse(res, 200, "Usuario", data as User["Row"])
}

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!isAdmin(req)) throw new AppError(403, "Solo ADMIN puede crear usuarios")

    const { email, name, rut, password, address, description, role, roleType, validated } =
        req.body as Partial<User["Insert"]> & { roleType?: RoleType }

    if (!email || !name || !rut || !password) {
        throw new AppError(400, "Faltan campos obligatorios (email, name, rut, password)")
    }

    const { data: byEmail } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle()
    if (byEmail) throw new AppError(409, "Email ya registrado")

    const { data: byRut } = await supabase.from("users").select("id").eq("rut", rut).maybeSingle()
    if (byRut) throw new AppError(409, "RUT ya registrado")

    // role
    let roleId: number | null
    if (typeof roleType !== "undefined") {
        roleId = roleIdFromType(roleType)
    } else if (typeof role !== "undefined") {
        roleId = role
        if (!isValidRoleId(roleId)) throw new AppError(400, "role (id) inválido")
    } else {
        roleId = ROLES.USER
    }

    // HASH de password (clave!)
    const hashed = await hashPassword(password)
    if (!hashed) throw new AppError(500, "No se pudo encriptar la contraseña")

    const payload: User["Insert"] = {
        email,
        name,
        rut,
        password: hashed,
        role: roleId,
        address: address ?? null,
        description: description ?? null,
        validated: validated ?? false,
    }

    const { data, error } = await supabase.from("users").insert([payload]).select("*").single()
    if (error) throw new AppError(500, error.message)

    return AppResponse(res, 201, "Creado", data as User["Row"])
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    const id = parseId(req.params.id)

    const admin = isAdmin(req)
    const owner = isSelf(req, id)
    if (!admin && !owner) throw new AppError(403, "No autorizado")

    const patch = req.body as Partial<User["Update"]> & { roleType?: RoleType }

    if (
        !admin &&
        (patch.role !== undefined || patch.validated !== undefined || patch.roleType !== undefined)
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
        if (patch.role !== undefined) {
            if (patch.role !== null && !isValidRoleId(patch.role))
                throw new AppError(400, "role (id) inválido")
            roleField = { role: patch.role }
        } else if (patch.roleType !== undefined) {
            roleField = { role: roleIdFromType(patch.roleType) }
        }
    }

    const updatePayload: User["Update"] = {
        email: patch.email,
        name: patch.name,
        password: undefined,
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
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    const id = parseId(req.params.id)
    if (!isAdmin(req)) throw new AppError(403, "Solo ADMIN puede eliminar por id") // si quieres self-delete, crea DELETE /me

    // Reutilizar la lógica completa de eliminación (dependencias, media, etc.)
    await deleteAccountById(id, req)

    const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle()
    return AppResponse(res, 200, "Eliminado", data as User["Row"] | null)
}

export const deleteMe = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.user?.id
    if (!id) throw new AppError(401, "No autenticado")

    // Eliminar media asociada y la fila de usuario. Las filas relacionadas quedarán a cargo de la DB (CASCADE)
    await deleteAccountById(id, req)

    return AppResponse(res, 200, "Cuenta eliminada", null)
}

/**
 * Elimina las imágenes asociadas a las publicaciones de un usuario y luego
 * elimina la fila del usuario. La limpieza de filas relacionadas se deja a la
 * base de datos (ON DELETE CASCADE) para evitar dobles borrados.
 */
const deleteAccountById = async (userId: number, req: AuthenticatedRequest) => {
    const headers = {
        "x-user-id": String(req.user?.id ?? 0),
        "x-user-role": String(req.user?.role ?? ""),
    }

    // 1. Obtener datos del usuario para acceder a su RUT (necesario para giver)
    const { data: userData } = await supabase
        .from("users")
        .select("rut, role")
        .eq("id", userId)
        .single()

    // 2. Si es un usuario giver (shelter, role=21 o 22), eliminar documentos de account-request
    const isGiver = userData && (userData.role === 21 || userData.role === 22) && userData.rut
    if (isGiver) {
        try {
            // Obtener lista de archivos del giver
            const { data: filesData } = await axios.get(
                `${MEDIA_URL}/uploads/account-request/${userData.rut}`,
                { headers }
            )
            const files = Array.isArray(filesData)
                ? filesData
                : Array.isArray((filesData as any)?.data)
                ? (filesData as any).data
                : []

            // Extraer nombres de archivos de las URLs
            const fileNames = files.map((url: string) => url.split("/").pop() || "").filter(Boolean)

            // Eliminar archivos si existen
            if (fileNames.length > 0) {
                await axios.delete(`${MEDIA_URL}/uploads/account-request/${userData.rut}`, {
                    data: { fileNamesArray: fileNames },
                    headers: { "Content-Type": "application/json", ...headers },
                })
            }
        } catch (err: any) {
            console.error("Warning: error al eliminar documentos de giver:", err?.message)
        }
    }

    // 3. Eliminar foto de perfil si existe
    try {
        const { data: profilePicData } = await axios.get(
            `${MEDIA_URL}/uploads/profile_picture/${userId}`,
            { headers }
        )
        const profilePics = Array.isArray(profilePicData?.data) ? profilePicData.data : []

        if (profilePics.length > 0) {
            const picNames = profilePics
                .map((url: string) => url.split("/").pop() || "")
                .filter(Boolean)

            if (picNames.length > 0) {
                await axios.delete(`${MEDIA_URL}/uploads/profile_picture/${userId}`, {
                    data: { fileNamesArray: picNames },
                    headers: { "Content-Type": "application/json", ...headers },
                })
            }
        }
    } catch (err: any) {
        console.error("Warning: error al eliminar foto de perfil:", err?.message)
    }

    // 4. Obtener ids de publicaciones del usuario y sus mascotas asociadas
    const { data: posts } = await supabase
        .from("post")
        .select("id, pet_id")
        .eq("creator_id", userId)
    const postRows = Array.isArray(posts) ? posts : []

    // Recolectar ids de mascotas para eliminarlas (evitar duplicados)
    const petIdSet = new Set<number>()
    for (const r of postRows) {
        const pid = Number((r as any).pet_id)
        if (pid) petIdSet.add(pid)
    }
    // Intentar eliminar imágenes asociadas a cada publicación (no es transactional)

    for (const p of postRows) {
        const postId = Number((p as any).id)
        if (!postId) continue

        try {
            const mediaListResp = await axios.get(`${MEDIA_URL}/uploads/publications/${postId}`, {
                headers,
            })
            const imageUrls: string[] = normalizeMediaUrls(mediaListResp.data?.data || [])
            const imageNames = imageUrls.map((u) => u.split("/").pop() || "").filter(Boolean)
            if (imageNames.length > 0) {
                await axios.delete(`${MEDIA_URL}/uploads/publications/${postId}`, {
                    data: { fileNamesArray: imageNames },
                    headers: { "Content-Type": "application/json", ...headers },
                })
            }
        } catch (mediaErr: any) {
            // No detener el proceso si falla la eliminación de media, solo loguear.
            console.error(
                "Warning: fallo al eliminar imágenes de media para post:",
                postId,
                mediaErr?.message
            )
        }
    }

    // Intentar eliminar historial de adopciones y las mascotas asociadas a las publicaciones.
    // No detenemos el proceso si falla alguno, solo logueamos.
    for (const petId of Array.from(petIdSet)) {
        try {
            const { error: histErr } = await supabase
                .from("adoption_history")
                .delete()
                .eq("pet_id", petId)
            if (histErr) {
                console.error(
                    "Warning: fallo al eliminar adoption_history para pet:",
                    petId,
                    histErr?.message
                )
            }

            const { error: petDelErr } = await supabase.from("pet").delete().eq("id", petId)
            if (petDelErr) {
                console.error("Warning: fallo al eliminar pet:", petId, petDelErr?.message)
            }
        } catch (err: any) {
            console.error(
                "Warning: error inesperado al eliminar pet/ historial:",
                petId,
                err?.message
            )
        }
    }

    // Finalmente eliminar la fila del usuario; las FK con CASCADE se encargarán del resto
    const { error: userDelErr } = await supabase.from("users").delete().eq("id", userId)
    if (userDelErr) throw new AppError(500, `Error al eliminar usuario: ${userDelErr.message}`)
}
// 4) Eliminar mensajes creados por el usuario
