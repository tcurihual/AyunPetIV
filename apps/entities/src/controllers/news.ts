import { Request, Response } from "express"
import axios from "axios"
import { supabase } from "../"
import {
    AppError,
    AppResponse,
    News,
    AuthenticatedRequest,
    MEDIA_URL,
    MEDIA_PUBLIC_URL,
} from "@repo/utils"

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

/**
 * Obtener todas las noticias o una noticia específica por ID
 */
export const getNews = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    try {
        if (id) {
            const numericId = parseInt(id)
            if (isNaN(numericId)) {
                throw new AppError(400, "ID debe ser un número válido")
            }

            const { data: news, error } = await supabase
                .from("new")
                .select("*")
                .eq("id", numericId)
                .single()

            if (error) throw new AppError(404, "Noticia no encontrada")

            // Obtener las imágenes asociadas desde el servicio de media
            let images: string[] = []
            try {
                const mediaResponse = await axios.get(`${MEDIA_URL}/uploads/news/${numericId}`, {
                    headers: {
                        "x-user-id": String(req.user?.id || 0),
                        "x-user-role": String(req.user?.role || ""),
                    },
                })
                images = normalizeMediaUrls(mediaResponse.data.data || [])
            } catch (err) {
                // Si no hay imágenes, continuamos con array vacío
                console.log("No images found for this news")
            }

            return AppResponse(res, 200, "Noticia obtenida exitosamente", {
                ...news,
                images,
            })
        } else {
            const { data: newsList, error } = await supabase
                .from("new")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw new AppError(500, "Error al obtener las noticias")

            // Obtener imágenes para cada noticia
            const newsWithImages = await Promise.all(
                (newsList || []).map(async (news) => {
                    let images: string[] = []
                    try {
                        const mediaResponse = await axios.get(
                            `${MEDIA_URL}/uploads/news/${news.id}`,
                            {
                                headers: {
                                    "x-user-id": String(req.user?.id || 0),
                                    "x-user-role": String(req.user?.role || ""),
                                },
                            }
                        )
                        images = normalizeMediaUrls(mediaResponse.data.data || [])
                    } catch (err) {
                        // Si no hay imágenes, continuamos con array vacío
                    }
                    return { ...news, images }
                })
            )

            return AppResponse(res, 200, "Noticias obtenidas exitosamente", newsWithImages)
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

/**
 * Crear una nueva noticia con imágenes
 */
export const createNews = async (req: Request, res: Response) => {
    const newsData: News["Insert"] = req.body
    const files = req.files as Express.Multer.File[] | undefined

    try {
        // Validaciones
        if (!newsData.title || !newsData.description) {
            throw new AppError(400, "title y description son campos requeridos")
        }

        // Usar el ID del usuario autenticado como creator_id
        const creator_id = req.user.id

        // Crear la noticia en la base de datos
        const payload: News["Insert"] = {
            title: newsData.title,
            description: newsData.description,
            creator_id: creator_id,
            date: newsData.date || null,
            start_time: newsData.start_time || null,
            end_time: newsData.end_time || null,
            status: newsData.status || "active",
        }

        const { data: newNews, error: insertError } = await supabase
            .from("new")
            .insert([payload])
            .select()
            .single()

        if (insertError) throw new AppError(500, "Error al crear la noticia")

        // Subir imágenes al servicio de media si existen
        let uploadedImages: any[] = []
        if (files && files.length > 0) {
            try {
                const FormDataNode = (await import("form-data")).default
                const formData = new FormDataNode()

                files.forEach((file) => {
                    formData.append("files", file.buffer, {
                        filename: file.originalname,
                        contentType: file.mimetype,
                    })
                })

                const mediaResponse = await axios.post(
                    `${MEDIA_URL}/uploads/news/${newNews.id}`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            "x-user-id": req.user.id,
                            "x-user-role": req.user.role,
                        },
                    }
                )

                uploadedImages = normalizeMediaUrls(mediaResponse.data.data || [])
            } catch (mediaError: any) {
                console.error("❌ Error al subir imágenes:", {
                    message: mediaError.message,
                    response: mediaError.response?.data,
                    status: mediaError.response?.status,
                    url: `${MEDIA_URL}/uploads/news/${newNews.id}`,
                })
                // Si falla la subida de imágenes, eliminamos la noticia creada
                await supabase.from("new").delete().eq("id", newNews.id)
                throw new AppError(500, "Error al subir las imágenes de la noticia")
            }
        }

        return AppResponse(res, 201, "Noticia creada exitosamente", {
            ...newNews,
            images: uploadedImages,
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

/**
 * Actualizar una noticia existente
 */
export const updateNews = async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData: News["Update"] = req.body
    const files = req.files as Express.Multer.File[] | undefined

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        // Verificar que la noticia existe
        const { data: existingNews, error: findError } = await supabase
            .from("new")
            .select("*")
            .eq("id", numericId)
            .single()

        if (findError) throw new AppError(404, "Noticia no encontrada")

        // La verificación de propiedad se maneja con requireOwnership middleware

        // Actualizar la noticia
        const payload: News["Update"] = {
            ...updateData,
            updated_at: new Date().toISOString(),
        }

        const { data: updatedNews, error: updateError } = await supabase
            .from("new")
            .update(payload)
            .eq("id", numericId)
            .select()
            .single()

        if (updateError) {
            console.error("❌ Error al actualizar noticia en BD:", updateError)
            throw new AppError(500, "Error al actualizar la noticia")
        }

        // Si hay nuevas imágenes para subir
        let uploadedImages: any[] = []
        if (files && files.length > 0) {
            try {
                const FormDataNode = (await import("form-data")).default
                const formData = new FormDataNode()

                files.forEach((file) => {
                    formData.append("files", file.buffer, {
                        filename: file.originalname,
                        contentType: file.mimetype,
                    })
                })

                const mediaResponse = await axios.post(
                    `${MEDIA_URL}/uploads/news/${numericId}`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            "x-user-id": String(req.user.id),
                            "x-user-role": String(req.user.role || ""),
                        },
                    }
                )

                uploadedImages = normalizeMediaUrls(mediaResponse.data.data || [])
            } catch (mediaError: any) {
                console.error("❌ Error al subir nuevas imágenes:", {
                    message: mediaError.message,
                    response: mediaError.response?.data,
                    status: mediaError.response?.status,
                })
                // No lanzamos error, solo registramos
            }
        }

        // Obtener todas las imágenes actuales
        let allImages: string[] = []
        try {
            const mediaResponse = await axios.get(`${MEDIA_URL}/uploads/news/${numericId}`, {
                headers: {
                    "x-user-id": req.user.id,
                    "x-user-role": req.user.role,
                },
            })
            allImages = normalizeMediaUrls(mediaResponse.data.data || [])
        } catch (err) {
            // Si no hay imágenes, continuamos
        }

        return AppResponse(res, 200, "Noticia actualizada exitosamente", {
            ...updatedNews,
            images: allImages,
            newImages: uploadedImages,
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

/**
 * Eliminar una noticia y sus imágenes asociadas
 */
export const deleteNews = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        // Verificar que la noticia existe
        const { data: existingNews, error: findError } = await supabase
            .from("new")
            .select("*")
            .eq("id", numericId)
            .single()

        if (findError) throw new AppError(404, "Noticia no encontrada")

        // La verificación de propiedad se maneja con requireOwnership middleware

        // Obtener las imágenes actuales para eliminarlas
        let imagesToDelete: string[] = []
        try {
            const mediaResponse = await axios.get(`${MEDIA_URL}/uploads/news/${numericId}`, {
                headers: {
                    "x-user-id": req.user.id,
                    "x-user-role": req.user.role,
                },
            })
            const imageUrls = normalizeMediaUrls(mediaResponse.data.data || [])
            // Extraer solo los nombres de archivo de las URLs
            imagesToDelete = imageUrls.map((url: string) => {
                const parts = url.split("/")
                return parts[parts.length - 1]
            })
        } catch (err) {
            console.log("No hay imágenes para eliminar")
        }

        // Eliminar las imágenes del servicio de media
        if (imagesToDelete.length > 0) {
            try {
                await axios.delete(`${MEDIA_URL}/uploads/news/${numericId}`, {
                    data: { fileNamesArray: imagesToDelete },
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": req.user.id,
                        "x-user-role": req.user.role,
                    },
                })
            } catch (mediaError: any) {
                console.error("Error al eliminar imágenes:", mediaError.message)
                // Continuamos con la eliminación de la noticia aunque falle la eliminación de imágenes
            }
        }

        // Eliminar la noticia de la base de datos
        const { error: deleteError } = await supabase.from("new").delete().eq("id", numericId)

        if (deleteError) throw new AppError(500, "Error al eliminar la noticia")

        return AppResponse(res, 200, "Noticia eliminada exitosamente", {
            id: numericId,
            deletedImages: imagesToDelete.length,
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}

/**
 * Eliminar imágenes específicas de una noticia
 */
export const deleteNewsImages = async (req: Request, res: Response) => {
    const { id } = req.params
    const { fileNamesArray } = req.body

    try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
            throw new AppError(400, "ID debe ser un número válido")
        }

        if (!Array.isArray(fileNamesArray) || fileNamesArray.length === 0) {
            throw new AppError(400, "fileNamesArray debe ser un array con al menos un elemento")
        }

        // Verificar que la noticia existe
        const { data: existingNews, error: findError } = await supabase
            .from("new")
            .select("*")
            .eq("id", numericId)
            .single()

        if (findError) throw new AppError(404, "Noticia no encontrada")

        // Eliminar las imágenes del servicio de media
        try {
            const mediaResponse = await axios.delete(`${MEDIA_URL}/uploads/news/${numericId}`, {
                data: { fileNamesArray },
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": req.user.id,
                    "x-user-role": req.user.role,
                },
            })

            return AppResponse(
                res,
                200,
                "Imágenes eliminadas exitosamente",
                mediaResponse.data.data
            )
        } catch (mediaError: any) {
            console.error("Error al eliminar imágenes:", mediaError.message)
            throw new AppError(500, "Error al eliminar las imágenes")
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}
