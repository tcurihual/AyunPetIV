import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

import {
    GiverRequestResponseSchema,
    ErrorValuesSchema,
    AdoptionHistoryResponseSchema,
    ValidateGiverAccountResponseSchema,
    AdoptionHistoryByIdResponseSchema,
    CreateAdoptionHistoryRequestSchema,
    CreateAdoptionHistoryResponseSchema,
    UpdateAdoptionHistoryRequestSchema,
    UpdateAdoptionHistoryResponseSchema,
    DeleteAdoptionHistoryResponseSchema,
    UsersWithImagesResponseSchema,
    UserByIdWithImagesResponseSchema,
    AdoptionRequestsWithImagesResponseSchema,
    AdoptionRequestByIdWithImagesResponseSchema,
} from "@repo/utils"

const FormResponseSchema = z.object({
    id: z.number(),
    id_user: z.number(),
    id_post_form: z.number(),
    answer: z.string(),
    created_at: z.string(),
    updated_at: z.string().optional(),
})

/* -------------------------------------------------------------------------- */
/* 🐶 Giver Requests                                                          */
/* -------------------------------------------------------------------------- */
export function registerGiverRequestsPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/giverRequests",
        tags: ["GiverRequests"],
        description:
            "Obtiene las organizaciones o solicitudes de dadores pendientes de validación.",
        responses: {
            200: {
                description: "Organizaciones no validadas obtenidas correctamente",
                content: { "application/json": { schema: GiverRequestResponseSchema } },
            },
            400: {
                description: "Error al obtener organizaciones",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "patch",
        path: "/v1/entities/giver-requests/{userId}/validate",
        tags: ["GiverRequests"],
        summary: "Validar cuenta de dador de mascotas",
        description:
            "Valida la cuenta de un dador, cambia el estado `validated` a `true` y envía un correo electrónico de confirmación. Requiere permisos de administrador.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true,
                description: "ID del usuario a validar",
                schema: { type: "integer", example: 55 },
            },
        ],
        responses: {
            200: {
                description: "Cuenta validada exitosamente",
                content: { "application/json": { schema: ValidateGiverAccountResponseSchema } },
            },
            400: {
                description: "ID inválido o cuenta ya validada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Requiere rol de administrador",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno del servidor",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

/* -------------------------------------------------------------------------- */
/* 🐾 Adoption History                                                        */
/* -------------------------------------------------------------------------- */
export function registerAdoptionHistoryPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-history",
        tags: ["AdoptionHistory"],
        summary: "Listar historiales de adopción",
        description: "Obtiene un listado de historiales de adopción registrados en el sistema.",
        responses: {
            200: {
                description: "Historial de adopciones obtenido exitosamente",
                content: { "application/json": { schema: AdoptionHistoryResponseSchema } },
            },
            400: {
                description: "Error al obtener el historial de adopciones",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["AdoptionHistory"],
        summary: "Obtener historial de adopción por ID",
        description: "Retorna el historial de adopción de una mascota específica usando su ID.",
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico del historial de adopción",
                schema: { type: "integer", example: 42 },
            },
        ],
        responses: {
            200: {
                description: "Historial de adopción obtenido exitosamente",
                content: { "application/json": { schema: AdoptionHistoryByIdResponseSchema } },
            },
            404: {
                description: "Historial no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno del servidor",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/entities/adoption-history",
        tags: ["AdoptionHistory"],
        summary: "Crear nuevo historial de adopción",
        description:
            "Crea un nuevo historial de adopción asociado a una mascota y registro de la fecha/usuario.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: { "application/json": { schema: CreateAdoptionHistoryRequestSchema } },
            },
        },
        responses: {
            201: {
                description: "Historial creado exitosamente",
                content: { "application/json": { schema: CreateAdoptionHistoryResponseSchema } },
            },
            400: {
                description: "Datos inválidos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "put",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["AdoptionHistory"],
        summary: "Actualizar historial de adopción",
        description:
            "Actualiza los datos de un historial de adopción existente identificado por su ID.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del historial a actualizar",
                schema: { type: "integer" },
            },
        ],
        request: {
            body: {
                content: { "application/json": { schema: UpdateAdoptionHistoryRequestSchema } },
            },
        },
        responses: {
            200: {
                description: "Historial actualizado exitosamente",
                content: { "application/json": { schema: UpdateAdoptionHistoryResponseSchema } },
            },
            400: {
                description: "Datos inválidos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "No encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["AdoptionHistory"],
        summary: "Eliminar historial de adopción",
        description:
            "Elimina un historial de adopción por su ID. Operación restringida a usuarios autorizados.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del historial a eliminar",
                schema: { type: "integer" },
            },
        ],
        responses: {
            200: {
                description: "Historial eliminado exitosamente",
                content: { "application/json": { schema: DeleteAdoptionHistoryResponseSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "No encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

/* -------------------------------------------------------------------------- */
/* 👥 Users                                                                  */
/* -------------------------------------------------------------------------- */
export function registerUsersPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/users",
        tags: ["Users"],
        summary: "Listar usuarios",
        description:
            "Obtiene un listado paginado de usuarios. Solo accesible para administradores. " +
            "Las imágenes de perfil se obtienen desde el microservicio de Media.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Usuarios obtenidos exitosamente",
                content: { "application/json": { schema: UsersWithImagesResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/entities/users/{id}",
        tags: ["Users"],
        summary: "Obtener usuario por ID",
        description: "Obtiene la información de un usuario específico con sus imágenes de perfil.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del usuario",
                schema: { type: "integer", example: 7 },
            },
        ],
        responses: {
            200: {
                description: "Usuario obtenido exitosamente",
                content: { "application/json": { schema: UserByIdWithImagesResponseSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

/* -------------------------------------------------------------------------- */
/* 🐕 Adoption Requests                                                      */
/* -------------------------------------------------------------------------- */
export function registerAdoptionRequestsPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-requests",
        tags: ["AdoptionRequests"],
        summary: "Listar solicitudes de adopción",
        description:
            "Obtiene un listado de todas las solicitudes de adopción, incluyendo las imágenes de los posts asociados.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitudes obtenidas exitosamente",
                content: {
                    "application/json": { schema: AdoptionRequestsWithImagesResponseSchema },
                },
            },
            400: {
                description: "Error en los parámetros",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-requests/{id}",
        tags: ["AdoptionRequests"],
        summary: "Obtener solicitud de adopción por ID",
        description:
            "Obtiene información detallada de una solicitud de adopción específica, incluyendo imágenes del post asociado.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la solicitud",
                schema: { type: "integer", example: 101 },
            },
        ],
        responses: {
            200: {
                description: "Solicitud obtenida exitosamente",
                content: {
                    "application/json": { schema: AdoptionRequestByIdWithImagesResponseSchema },
                },
            },
            404: {
                description: "Solicitud no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

export function registerVerificationCodesPaths(registry: OpenAPIRegistry) {
    // Crear código
    registry.registerPath({
        method: "post",
        path: "/v1/entities/verification-codes",
        tags: ["VerificationCodes"],
        summary: "Crear un código de verificación",
        description:
            "Genera un código de verificación para distintos usos (verify, reset, adoption) para un usuario.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                type: { type: "string", enum: ["verify", "reset", "adoption"] },
                                userId: { type: "number" },
                                duration: { type: "number", minimum: 1, maximum: 1440 },
                            },
                            required: ["type"],
                        },
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Código creado",
                content: { "application/json": { schema: { type: "object" } } },
            },
            400: {
                description: "Datos inválidos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // Validar código
    registry.registerPath({
        method: "post",
        path: "/v1/entities/verification-codes/validate",
        tags: ["VerificationCodes"],
        summary: "Validar un código de verificación",
        description:
            "Valida un código previamente generado. Espera `code`, `type` y `userId` en el body.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                code: { type: "string", pattern: "^\\d{6}$" },
                                type: { type: "string", enum: ["verify", "reset", "adoption"] },
                                userId: { type: "number" },
                            },
                            required: ["code", "type", "userId"],
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Código validado",
                content: { "application/json": { schema: { type: "object" } } },
            },
            400: {
                description: "Código inválido o expirado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Código no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // Obtener códigos por usuario
    registry.registerPath({
        method: "get",
        path: "/v1/entities/verification-codes/user/{userId}",
        tags: ["VerificationCodes"],
        security: [{ bearerAuth: [] }],
        description: "Obtiene los códigos de verificación asociados a un usuario específico.",
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true,
                schema: { type: "string", pattern: "^\\d+$" },
                description: "ID del usuario",
            },
        ],
        responses: {
            200: {
                description: "Códigos obtenidos",
                content: { "application/json": { schema: { type: "object" } } },
            },
            401: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "Sin permisos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

export function registerFormResponsesPaths(registry: OpenAPIRegistry) {
    // Listar respuestas
    registry.registerPath({
        method: "get",
        path: "/v1/entities/form-responses",
        tags: ["FormResponses"],
        summary: "Listar respuestas de formulario por id_post_form",
        description:
            "Obtiene las respuestas de formularios filtradas por el parámetro `id_post_form` (query).",
        parameters: [
            {
                name: "id_post_form",
                in: "query",
                required: true,
                schema: { type: "integer" },
            },
        ],
        responses: {
            200: {
                description: "Listado de respuestas obtenido exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.string(),
                            data: z.array(FormResponseSchema),
                        }),
                    },
                },
            },
            400: {
                description: "Error en parámetros",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // Crear respuesta
    registry.registerPath({
        method: "post",
        path: "/v1/entities/form-responses",
        tags: ["FormResponses"],
        summary: "Crear una nueva respuesta de formulario",
        description: "Crea una nueva respuesta para un formulario asociado a una publicación.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: FormResponseSchema.omit({ id: true, created_at: true }),
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Respuesta creada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.string(),
                            data: FormResponseSchema,
                        }),
                    },
                },
            },
            400: {
                description: "Error en el cuerpo",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // Actualizar respuesta
    registry.registerPath({
        method: "put",
        path: "/v1/entities/form-responses/{id}",
        tags: ["FormResponses"],
        summary: "Actualizar una respuesta de formulario",
        description: "Actualiza la respuesta de un formulario identificado por su ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({ answer: z.string() }),
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Respuesta actualizada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.string(),
                            data: FormResponseSchema,
                        }),
                    },
                },
            },
            404: {
                description: "No encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // Eliminar respuesta
    registry.registerPath({
        method: "delete",
        path: "/v1/entities/form-responses/{id}",
        tags: ["FormResponses"],
        summary: "Eliminar una respuesta de formulario",
        description: "Elimina una respuesta de formulario por su ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
            200: {
                description: "Respuesta eliminada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.string(),
                            data: z.object({ id: z.number() }),
                        }),
                    },
                },
            },
            404: {
                description: "No encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // Listar por publicación
    registry.registerPath({
        method: "get",
        path: "/v1/entities/form-responses/publication/{postId}",
        tags: ["FormResponses"],
        summary: "Obtener respuestas asociadas a una publicación",
        description:
            "Lista las respuestas de formulario asociadas a la publicación indicada por postId.",
        parameters: [{ name: "postId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
            200: {
                description: "Respuestas obtenidas exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.string(),
                            data: z.array(FormResponseSchema),
                        }),
                    },
                },
            },
            400: {
                description: "Error",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

export function registerAllEntitiesDocs(registry: OpenAPIRegistry) {
    registerGiverRequestsPaths(registry)
    registerAdoptionHistoryPaths(registry)
    registerUsersPaths(registry)
    registerAdoptionRequestsPaths(registry)
    registerVerificationCodesPaths(registry)
    registerFormResponsesPaths(registry)
}
