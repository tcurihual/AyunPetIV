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
            case "post": {
                const { data: post, error } = await supabase
                    .from("post")
                    .select("creatorid")
                    .eq("id", numericId)
                    .single()

                if (error || !post) {
                    throw new AppError(404, "Publicación no encontrada")
                }

                if (post.creatorid !== user.id) {
                    throw new AppError(
                        403,
                        "No tienes permiso para modificar los archivos de esta publicación"
                    )
                }
                break
            }

            case "pet": {
                const { data: pet, error } = await supabase
                    .from("pet")
                    .select("ownerid")
                    .eq("id", numericId)
                    .single()

                if (error || !pet) {
                    throw new AppError(404, "Mascota no encontrada")
                }

                if (pet.ownerid !== user.id) {
                    throw new AppError(
                        403,
                        "No tienes permiso para modificar los archivos de esta mascota"
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
