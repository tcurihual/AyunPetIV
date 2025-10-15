import { Request, Response } from "express"
import axios from "axios"
import { supabase } from "../"
import { AppError, AppResponse, News, AuthenticatedRequest } from "@repo/utils"

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || "http://localhost:7000"

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
                const mediaResponse = await axios.get(
                    `${MEDIA_SERVICE_URL}/uploads/news/${numericId}`
                )
                images = mediaResponse.data.data || []
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
                            `${MEDIA_SERVICE_URL}/uploads/news/${news.id}`
                        )
                        images = mediaResponse.data.data || []
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
export const createNews = async (req: AuthenticatedRequest, res: Response) => {
    const newsData: News["Insert"] = req.body
    const files = req.files as Express.Multer.File[] | undefined

    try {
        // Validaciones
        if (!newsData.title || !newsData.description) {
            throw new AppError(400, "title y description son campos requeridos")
        }

        if (!newsData.creator_id) {
            throw new AppError(400, "creator_id es requerido")
        }

        // Verificar que el creador existe
        const { data: userExists, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", newsData.creator_id)
            .single()

        if (userError) throw new AppError(404, "Usuario creador no encontrado")

        // Crear la noticia en la base de datos
        const payload: News["Insert"] = {
            title: newsData.title,
            description: newsData.description,
            creator_id: newsData.creator_id,
            date: newsData.date || null,
            start_time: newsData.start_time || null,
            end_time: newsData.end_time || null,
            status: newsData.status || "active",
            created_at: newsData.created_at || new Date().toISOString(),
            updated_at: newsData.updated_at || new Date().toISOString(),
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
                    `${MEDIA_SERVICE_URL}/uploads/news/${newNews.id}`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                        },
                    }
                )

                uploadedImages = mediaResponse.data.data || []
            } catch (mediaError: any) {
                console.error("Error al subir imágenes:", mediaError.message)
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
export const updateNews = async (req: AuthenticatedRequest, res: Response) => {
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

        // Verificar propiedad (solo el creador o admin pueden actualizar)
        if (req.user.role !== 19 && existingNews.creator_id !== req.user.id) {
            throw new AppError(403, "No tienes permiso para actualizar esta noticia")
        }

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

        if (updateError) throw new AppError(500, "Error al actualizar la noticia")

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
                    `${MEDIA_SERVICE_URL}/uploads/news/${numericId}`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                        },
                    }
                )

                uploadedImages = mediaResponse.data.data || []
            } catch (mediaError: any) {
                console.error("Error al subir nuevas imágenes:", mediaError.message)
            }
        }

        // Obtener todas las imágenes actuales
        let allImages: string[] = []
        try {
            const mediaResponse = await axios.get(`${MEDIA_SERVICE_URL}/uploads/news/${numericId}`)
            allImages = mediaResponse.data.data || []
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
export const deleteNews = async (req: AuthenticatedRequest, res: Response) => {
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

        // Verificar propiedad (solo el creador o admin pueden eliminar)
        if (req.user.role !== 19 && existingNews.creator_id !== req.user.id) {
            throw new AppError(403, "No tienes permiso para eliminar esta noticia")
        }

        // Obtener las imágenes actuales para eliminarlas
        let imagesToDelete: string[] = []
        try {
            const mediaResponse = await axios.get(`${MEDIA_SERVICE_URL}/uploads/news/${numericId}`)
            const imageUrls = mediaResponse.data.data || []
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
                await axios.delete(`${MEDIA_SERVICE_URL}/uploads/news/${numericId}`, {
                    data: { fileNamesArray: imagesToDelete },
                    headers: {
                        "Content-Type": "application/json",
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
export const deleteNewsImages = async (req: AuthenticatedRequest, res: Response) => {
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

        // Verificar propiedad
        if (req.user.role !== 19 && existingNews.creator_id !== req.user.id) {
            throw new AppError(403, "No tienes permiso para eliminar imágenes de esta noticia")
        }

        // Eliminar las imágenes del servicio de media
        try {
            const mediaResponse = await axios.delete(
                `${MEDIA_SERVICE_URL}/uploads/news/${numericId}`,
                {
                    data: { fileNamesArray },
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )

            return AppResponse(res, 200, "Imágenes eliminadas exitosamente", mediaResponse.data.data)
        } catch (mediaError: any) {
            console.error("Error al eliminar imágenes:", mediaError.message)
            throw new AppError(500, "Error al eliminar las imágenes")
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error interno del servidor")
    }
}
