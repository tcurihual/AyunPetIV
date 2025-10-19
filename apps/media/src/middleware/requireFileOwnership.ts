import { Request, Response, NextFunction } from "express"
import { AppError, createSupabaseClient } from "@repo/utils"

/**
 * Middleware para verificar ownership de archivos basado en el entityType
 * - post -> verifica que el usuario sea el creador (creatorid)
 * - pet -> verifica que el usuario sea el dueño (ownerid)
 * - giver -> permite solo a admins
 */
export const requireFileOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId } = req.params
        const user = req.user

        if (!user || !user.id) {
            throw new AppError(401, "No estás autenticado")
        }

        if (user.role === 19) {
            return next()
        }

        const supabase = createSupabaseClient()
        const numericId = parseInt(entityId)

        if (isNaN(numericId)) {
            throw new AppError(400, "ID de entidad inválido")
        }

        switch (entityType) {
            case "publications": {
                const { data: post, error } = await supabase
                    .from("post")
                    .select("creator_id")
                    .eq("id", numericId)
                    .single()

                if (error || !post) {
                    throw new AppError(404, "Publicación no encontrada")
                }

                if (post.creator_id !== user.id) {
                    throw new AppError(
                        403,
                        "No tienes permiso para modificar los archivos de esta publicación"
                    )
                }
                break
            }


            case "news": {
                const { data: news, error } = await supabase
                    .from("new")
                    .select("creator_id")
                    .eq("id", numericId)
                    .single()

                if (error || !news) {
                    throw new AppError(404, "Noticia no encontrada")
                }

                if (news.creator_id !== user.id) {
                    throw new AppError(
                        403,
                        "No tienes permiso para modificar los archivos de esta noticia"
                    )
                }
                break
            }

            case "giver":
            case "account-request": {
                throw new AppError(403, "Solo administradores pueden modificar estos archivos")
            }

            default: {
                return next()
            }
        }

        next()
    } catch (error) {
        next(error)
    }
}
