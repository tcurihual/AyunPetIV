import axios from "axios"
import { MEDIA_URL, MEDIA_PUBLIC_URL, AuthenticatedRequest } from "@repo/utils"
import FormData from "form-data"

/**
 * Obtiene las URLs de imágenes de una entidad desde el microservicio de media
 * @param entityType - Tipo de entidad (pet, post, giver)
 * @param entityId - ID de la entidad
 * @returns Array de URLs de imágenes o array vacío en caso de error
 */
export const getEntityImages = async (
    entityType: string,
    entityId: number | string,
    headers?: Record<string, string | number>
): Promise<string[]> => {
    try {
        const { data } = await axios.get<{ message: string; data: string[] }>(
            `${MEDIA_URL}/uploads/${entityType}/${entityId}`,
            { timeout: 5000, headers }
        )
        const list = Array.isArray(data.data) ? data.data : []
        return list.map((u) => {
            try {
                if (!u) return u
                const uploadsIndex = u.indexOf("/uploads/")
                if (uploadsIndex !== -1) {
                    const rel = u.substring(uploadsIndex + 1)
                    return `${MEDIA_PUBLIC_URL}/${rel}`
                }
                return u
            } catch (e) {
                return u
            }
        })
    } catch (error) {
        // Si no hay imágenes o hay error, retornamos array vacío
        return []
    }
}

/**
 * Obtiene imágenes para múltiples entidades del mismo tipo
 * @param entityType - Tipo de entidad
 * @param entityIds - Array de IDs
 * @returns Mapa de entityId -> array de URLs
 */
export const getMultipleEntityImages = async (
    entityType: string,
    entityIds: (number | string)[],
    headers?: Record<string, string | number>
): Promise<Record<string, string[]>> => {
    const results = await Promise.all(
        entityIds.map(async (id) => ({
            id: String(id),
            images: await getEntityImages(entityType, id, headers),
        }))
    )

    return results.reduce((acc, { id, images }) => {
        acc[id] = images
        return acc
    }, {} as Record<string, string[]>)
}

export async function replaceProfilePicture(
    userId: number,
    file: Express.Multer.File,
    req: AuthenticatedRequest
) {
    const headersBase = {
        "x-user-id": String(req.user?.id ?? 0),
        "x-user-role": String(req.user?.role ?? ""),
    }

    try {
        const { data: currentResp } = await axios.get(
            `${MEDIA_URL}/uploads/profile_picture/${userId}`,
            { headers: headersBase }
        )

        const currentFiles = Array.isArray(currentResp?.data) ? currentResp.data : []
        const fileNames = currentFiles
            .map((url: string) => url.split("/").pop() || "")
            .filter(Boolean)

        if (fileNames.length > 0) {
            await axios.delete(`${MEDIA_URL}/uploads/profile_picture/${userId}`, {
                data: { fileNamesArray: fileNames },
                headers: { "Content-Type": "application/json", ...headersBase },
            })
        }
    } catch (err) {
        console.error("Warning: error al limpiar fotos de perfil previas:", (err as any)?.message)
    }

    const fd = new FormData()
    fd.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    })

    await axios.post(`${MEDIA_URL}/internal/profile-picture/${userId}`, fd, {
        headers: fd.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 20000,
    })
}

export async function replaceProfileMural(
    userId: number,
    file: Express.Multer.File,
    req: AuthenticatedRequest
) {
    const headersBase = {
        "x-user-id": String(req.user?.id ?? 0),
        "x-user-role": String(req.user?.role ?? ""),
    }

    try {
        const { data: currentResp } = await axios.get(
            `${MEDIA_URL}/uploads/profile_mural/${userId}`,
            { headers: headersBase }
        )

        const currentFiles = Array.isArray(currentResp?.data) ? currentResp.data : []
        const fileNames = currentFiles
            .map((url: string) => url.split("/").pop() || "")
            .filter(Boolean)

        if (fileNames.length > 0) {
            await axios.delete(`${MEDIA_URL}/uploads/profile_mural/${userId}`, {
                data: { fileNamesArray: fileNames },
                headers: { "Content-Type": "application/json", ...headersBase },
            })
        }
    } catch (err) {
        console.error("Warning: error al limpiar fotos de mural previas:", (err as any)?.message)
    }

    const fd = new FormData()
    fd.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    })

    await axios.post(`${MEDIA_URL}/internal/profile-mural/${userId}`, fd, {
        headers: fd.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 20000,
    })
}
