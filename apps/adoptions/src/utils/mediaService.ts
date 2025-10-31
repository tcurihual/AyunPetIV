import axios from "axios"
import { MEDIA_URL, MEDIA_PUBLIC_URL } from "@repo/utils"

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
        // Normalizar las URLs devueltas para usar la base pública de media a través del gateway
        return list.map((u) => {
            try {
                if (!u) return u
                const uploadsIndex = u.indexOf("/uploads/")
                if (uploadsIndex !== -1) {
                    const rel = u.substring(uploadsIndex + 1) // "uploads/..."
                    return `${MEDIA_PUBLIC_URL}/${rel}`
                }
                // Si ya es una URL absoluta pero no contiene "/uploads/", devolverla tal cual
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
