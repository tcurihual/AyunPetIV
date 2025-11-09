import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

import {
    GiverRequestResponseSchema,
    ErrorValuesSchema,
    ValidateGiverAccountResponseSchema,
    AdoptionRequestsWithImagesResponseSchema,
    AdoptionRequestByIdWithImagesResponseSchema,
    CreateVerificationCodeRequestSchema,
    CreateVerificationCodeResponseSchema,
    GetUserVerificationCodesResponseSchema,
    ValidateVerificationCodeResponseSchema,
} from "@repo/utils"
import { registerAdoptionHistoryPaths } from "./adoptionHistory"
import { registerUsersPaths } from "./users"
import { registerSavedPostsDocs } from "./savedPosts"
import { registerQuestionsDocs } from "./questions"

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
        summary: "Listar solicitudes de dadores pendientes",
        description:
            "Obtiene un listado paginado de organizaciones o solicitudes de dadores pendientes de validación. Requiere permisos de administrador.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "page",
                in: "query",
                required: false,
                description: "Número de la página a obtener",
                schema: { type: "integer", default: 1, minimum: 1 },
            },
            {
                name: "pageSize",
                in: "query",
                required: false,
                description: "Cantidad de solicitudes por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
        responses: {
            200: {
                description: "Organizaciones no validadas obtenidas correctamente",
                content: { "application/json": { schema: GiverRequestResponseSchema } },
            },
            400: {
                description: "Error al obtener organizaciones",
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

/* -------------------------------------------------------------------------- */
/* 👥 Users                                                                  */
/* -------------------------------------------------------------------------- */

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
            "Obtiene un listado paginado de todas las solicitudes de adopción, incluyendo las imágenes de los posts asociados.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "page",
                in: "query",
                required: false,
                description: "Número de la página a obtener",
                schema: { type: "integer", default: 1, minimum: 1 },
            },
            {
                name: "pageSize",
                in: "query",
                required: false,
                description: "Cantidad de solicitudes por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
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
            403: {
                description: "No autorizado",
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
            "Genera un código de verificación para distintos usos (`verify`, `reset`, `adoption`) para un usuario. " +
            "`adoption`: Uso general, genera un código que confirma una adopción, dura `24 horas`," +
            " `verify`: Uso mobile, para verificar correo, dura `30 minutos`," +
            " `reset`: Uso mobile, para resetear password, dura `15 minutos`",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: CreateVerificationCodeRequestSchema,
                        example: {
                            user_id: 1,
                            type: "adoption || verify || reset",
                        },
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Código creado",
                content: { "application/json": { schema: CreateVerificationCodeResponseSchema } },
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
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                code: { type: "string", pattern: "^\\d{6}$" },
                                type: { type: "string", enum: ["verify", "reset", "adoption"] },
                                user_id: { type: "number" },
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
                content: { "application/json": { schema: ValidateVerificationCodeResponseSchema } },
            },
            400: {
                description: "Código inválido o expirado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
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
        path: "/v1/entities/verification-codes/user/{user_id}",
        tags: ["VerificationCodes"],
        security: [{ bearerAuth: [] }],
        summary: "Obtener códigos por ID de usuario",
        description: "Obtiene los códigos de verificación asociados a un usuario específico.",
        parameters: [
            {
                name: "user_id",
                in: "path",
                required: true,
                schema: { type: "integer", example: 10 },
                description: "ID del usuario",
            },
        ],
        responses: {
            200: {
                description: "Códigos obtenidos",
                content: { "application/json": { schema: GetUserVerificationCodesResponseSchema } },
            },
            401: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "Sin permisos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}

export function registerFormResponsesPaths(registry: OpenAPIRegistry) {
    const security = [{ bearerAuth: [] }]
    const authResponses = {
        401: {
            description: "No autenticado",
            content: { "application/json": { schema: ErrorValuesSchema } },
        },
        403: {
            description: "No autorizado (permisos insuficientes)",
            content: { "application/json": { schema: ErrorValuesSchema } },
        },
    }

    // Listar respuestas
    registry.registerPath({
        method: "get",
        path: "/v1/entities/form-responses",
        tags: ["FormResponses"],
        summary: "Listar respuestas de formulario por id_post_form",
        description:
            "Obtiene las respuestas de formularios filtradas por el parámetro `id_post_form` (query). Requiere autenticación.",
        security,
        parameters: [
            {
                name: "id_post_form",
                in: "query",
                required: true,
                schema: { type: "integer" },
                description: "ID del formulario de la publicación",
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
            ...authResponses,
        },
    })

    // Crear respuesta
    registry.registerPath({
        method: "post",
        path: "/v1/entities/form-responses",
        tags: ["FormResponses"],
        summary: "Crear una nueva respuesta de formulario",
        description:
            "Crea una nueva respuesta para un formulario asociado a una publicación. Requiere autenticación.",
        security,
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: FormResponseSchema.omit({
                            id: true,
                            created_at: true,
                            updated_at: true,
                        }),
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
            ...authResponses,
        },
    })

    // Actualizar respuesta
    registry.registerPath({
        method: "put",
        path: "/v1/entities/form-responses/{id}",
        tags: ["FormResponses"],
        summary: "Actualizar una respuesta de formulario",
        description:
            "Actualiza la respuesta de un formulario identificado por su ID. Requiere autenticación.",
        security,
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "integer" },
                description: "ID de la respuesta",
            },
        ],
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
            400: {
                description: "Datos inválidos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "No encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            ...authResponses,
        },
    })

    // Eliminar respuesta
    registry.registerPath({
        method: "delete",
        path: "/v1/entities/form-responses/{id}",
        tags: ["FormResponses"],
        summary: "Eliminar una respuesta de formulario",
        description: "Elimina una respuesta de formulario por su ID. Requiere autenticación.",
        security,
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "integer" },
                description: "ID de la respuesta",
            },
        ],
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
            ...authResponses,
        },
    })

    // Listar por publicación
    registry.registerPath({
        method: "get",
        path: "/v1/entities/form-responses/publication/{postId}",
        tags: ["FormResponses"],
        summary: "Obtener respuestas asociadas a una publicación",
        description:
            "Lista las respuestas de formulario asociadas a la publicación indicada por postId. Requiere autenticación.",
        security,
        parameters: [
            {
                name: "postId",
                in: "path",
                required: true,
                schema: { type: "integer" },
                description: "ID de la publicación",
            },
        ],
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
                description: "Error en parámetros",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Publicación no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            ...authResponses,
        },
    })
}

export function registerAllEntitiesDocs(registry: OpenAPIRegistry) {
    registerGiverRequestsPaths(registry)
    registerUsersPaths(registry)
    registerAdoptionRequestsPaths(registry)
    registerVerificationCodesPaths(registry)
    registerFormResponsesPaths(registry)
    registerSavedPostsDocs(registry)
    registerAdoptionHistoryPaths(registry)
    registerQuestionsDocs(registry)
}
