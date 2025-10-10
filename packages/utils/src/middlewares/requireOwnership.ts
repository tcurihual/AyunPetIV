import type { RequestHandler } from "express"
import type { AuthenticatedRequest } from "../types"
import { AppError } from "../error"
import { createSupabaseClient } from "../supabase"
import { Database } from "../database.types"

// Tipos de tablas válidas
type TableName = keyof Database["public"]["Tables"]

/**
 * Configuración para el middleware de propiedad
 */
export interface OwnershipConfig {
    /**
     * Tabla de la base de datos a verificar
     */
    tableName: TableName
    /**
     * Nombre del campo que contiene el ID del propietario en la tabla
     * Por defecto: 'ownerid'
     */
    ownerField?: string
    /**
     * Nombre del parámetro en la URL que contiene el ID del recurso
     * Por defecto: 'id'
     */
    resourceIdParam?: string
    /**
     * Roles que pueden saltarse la verificación de propiedad
     * Por defecto: [19] (admin)
     */
    bypassRoles?: number[]
    /**
     * Si es true, permite que el recurso tenga ownerid null
     * Por defecto: false
     */
    allowNullOwner?: boolean
}

/**
 * Middleware para verificar que el usuario autenticado sea el propietario del recurso
 * o tenga un rol que le permita realizar la operación
 *
 * @example
 * // Verificar propiedad de un post
 * router.put("/:id", verifyAuth, requireOwnership({ tableName: "post", ownerField: "creatorid" }), updatePost)
 *
 * @example
 * // Verificar propiedad de una mascota
 * router.delete("/:id", verifyAuth, requireOwnership({ tableName: "pet" }), deletePet)
 *
 * @param config Configuración del middleware
 */
export const requireOwnership = (config: OwnershipConfig): RequestHandler => {
    const {
        tableName,
        ownerField = "ownerid",
        resourceIdParam = "id",
        bypassRoles = [19], // Por defecto, admin (roleId: 19)
        allowNullOwner = false,
    } = config

    return async (req, _res, next) => {
        try {
            const { user } = req as AuthenticatedRequest

            // Verificar que el usuario esté autenticado
            if (!user) {
                return next(new AppError(401, "No autenticado"))
            }

            // Si el usuario tiene un rol que puede saltarse la verificación
            if (user.role !== null && bypassRoles.includes(user.role)) {
                return next()
            }

            // Obtener el ID del recurso de los parámetros
            const resourceId = req.params[resourceIdParam]

            if (!resourceId) {
                return next(
                    new AppError(400, `Parámetro '${resourceIdParam}' no encontrado en la URL`)
                )
            }

            // Validar que el ID sea numérico
            const numericResourceId = parseInt(resourceId)
            if (isNaN(numericResourceId)) {
                return next(
                    new AppError(400, `El parámetro '${resourceIdParam}' debe ser numérico`)
                )
            }

            // Consultar el recurso en la base de datos
            const supabase = createSupabaseClient()
            const { data, error } = await supabase
                .from(tableName)
                .select(`id, ${ownerField}`)
                .eq("id", numericResourceId)
                .single()

            if (error || !data) {
                return next(new AppError(404, `Recurso no encontrado en '${tableName}'`))
            }

            // Obtener el ID del propietario
            const ownerId = data[ownerField as keyof typeof data]

            // Si el recurso no tiene propietario y está permitido
            if (ownerId === null && allowNullOwner) {
                return next()
            }

            // Verificar que el usuario sea el propietario
            if (ownerId !== user.id) {
                return next(
                    new AppError(
                        403,
                        "No tienes permisos para realizar esta operación. Solo el propietario puede modificar este recurso."
                    )
                )
            }

            // El usuario es el propietario, permitir continuar
            next()
        } catch (error) {
            if (error instanceof AppError) {
                return next(error)
            }
            return next(new AppError(500, "Error al verificar la propiedad del recurso"))
        }
    }
}
