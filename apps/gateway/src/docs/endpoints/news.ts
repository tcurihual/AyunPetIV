import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import { ErrorValuesSchema } from "@repo/utils"

export function NewsRegistryPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/news",
        tags: ["News"],
        summary: "Listar todas las noticias",
        description:
            "Obtiene todas las noticias ordenadas por fecha de creación en orden descendente. " +
            "Cada noticia incluye sus imágenes asociadas. Dentro de la response los status pueden ser: `active`, `inactive, `close` ",

        security: [{ bearerAuth: [] }],

        responses: {
            200: {
                description: "Noticias obtenidas exitosamente con imágenes",
                content: {
                    "application/json": {
                        schema: z.array(
                            z.object({
                                id: z.number(),
                                title: z.string().nullable(),
                                description: z.string().nullable(),
                                status: z.enum(["active", "inactive", "closed"]).nullable(),
                                creator_id: z.number().nullable(),
                                created_at: z.string().nullable(),
                                updated_at: z.string().nullable(),
                                date: z.string().nullable(),
                                start_time: z.string().nullable(),
                                end_time: z.string().nullable(),
                                images: z.array(z.string()),
                            })
                        ),
                    },
                },
            },

            401: {
                description: "No autenticado - Token JWT requerido",
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
        path: "/v1/entities/news",
        tags: ["News"],
        summary: "Crear una noticia (solo admin)",
        description:
            "Crea una noticia nueva usando los datos enviados en el cuerpo de la petición. " +
            "Permite subir múltiples imágenes asociadas, " +
            "el usuario autenticado se registra automáticamente como creator_id. Status puede ser: `active`, `inactive, `close`",

        security: [{ bearerAuth: [] }],

        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            title: z.string(),
                            description: z.string(),
                            date: z.string(),
                            start_time: z.string(),
                            end_time: z.string(),
                            status: z.enum(["active", "inactive", "closed"]).optional(),
                            files: z.any(),
                        }),
                    },
                },
            },
        },

        responses: {
            201: {
                description: "Noticia creada exitosamente con imágenes",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({
                                id: z.number(),
                                title: z.string().nullable(),
                                description: z.string().nullable(),
                                creator_id: z.number().nullable(),
                                created_at: z.string().nullable(),
                                updated_at: z.string().nullable(),
                                date: z.string().nullable(),
                                start_time: z.string().nullable(),
                                end_time: z.string().nullable(),
                                status: z.enum(["active", "inactive", "closed"]).nullable(),
                                images: z.array(z.string()),
                            }),
                        }),
                    },
                },
            },

            400: {
                description: "Campos requeridos faltantes (title, description)",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean().optional(),
                            message: z.literal("title y description son campos requeridos"),
                        }),
                    },
                },
            },

            401: {
                description: "No autenticado - Token JWT requerido",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },

            500: {
                description:
                    "Error al crear la noticia o error al subir imágenes. Si falla la subida de imágenes, la noticia creada se elimina automáticamente.",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: "patch",
        path: "/v1/entities/news/{id}",
        tags: ["News"],
        summary: "Actualizar una noticia (solo admin)",
        description:
            "Actualiza una noticia existente y opcionalmente sube nuevas imágenes.  Status puede ser: `active`, `inactive, `close`",

        security: [{ bearerAuth: [] }],

        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la noticia a actualizar",
                schema: { type: "integer", minimum: 1 },
            },
        ],

        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            title: z.string().nullable().optional(),
                            description: z.string().nullable().optional(),
                            date: z.string().nullable().optional(),
                            start_time: z.string().nullable().optional(),
                            end_time: z.string().nullable().optional(),
                            status: z.enum(["active", "inactive", "closed"]).optional(),
                            files: z.any().optional(), // imágenes (Multer)
                        }),
                    },
                },
            },
        },

        responses: {
            200: {
                description: "Noticia actualizada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({
                                id: z.number(),
                                title: z.string().nullable(),
                                description: z.string().nullable(),
                                creator_id: z.number().nullable(),
                                created_at: z.string().nullable(),
                                updated_at: z.string().nullable(),
                                date: z.string().nullable(),
                                start_time: z.string().nullable(),
                                end_time: z.string().nullable(),
                                status: z.enum(["active", "inactive", "closed"]).nullable(),

                                images: z.array(z.string()), // todas las imágenes actuales
                                newImages: z.array(z.string()), // imágenes recién subidas
                            }),
                        }),
                    },
                },
            },

            400: {
                description: "ID inválido (no es un número válido)",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean().optional(),
                            message: z.literal("ID debe ser un número válido"),
                        }),
                    },
                },
            },

            404: {
                description: "Noticia no encontrada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean().optional(),
                            message: z.literal("Noticia no encontrada"),
                        }),
                    },
                },
            },

            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },

            500: {
                description:
                    "Error interno al actualizar la noticia o al interactuar con el microservicio de Media.",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/entities/news/{id}",
        tags: ["News"],
        summary: "Eliminar una noticia (solo admin)",
        description:
            "Elimina una noticia existente y elimina también sus imágenes asociadas " +
            "La verificación de propiedad se realiza mediante middleware (requireOwnership).",

        security: [{ bearerAuth: [] }],

        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la noticia a eliminar",
                schema: { type: "integer", minimum: 1 },
            },
        ],

        responses: {
            200: {
                description: "Noticia eliminada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.literal("Noticia eliminada exitosamente"),
                            data: z.object({
                                id: z.number(),
                                deletedImages: z.number(),
                            }),
                        }),
                    },
                },
            },

            400: {
                description: "ID inválido (no es un número válido)",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean().optional(),
                            message: z.literal("ID debe ser un número válido"),
                        }),
                    },
                },
            },

            404: {
                description: "Noticia no encontrada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean().optional(),
                            message: z.literal("Noticia no encontrada"),
                        }),
                    },
                },
            },

            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },

            500: {
                description:
                    "Error interno al eliminar la noticia o al eliminar imágenes en el microservicio de Media.",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/entities/news/{id}/images",
        tags: ["News"],
        summary: "Eliminar imágenes específicas de una noticia (solo admin)",
        description:
            "Elimina una o varias imágenes asociadas a una noticia existente. Las imágenes se eliminan desde el microservicio de Media. " +
            "Requiere un array con los nombres de archivo a eliminar.",

        security: [{ bearerAuth: [] }],

        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la noticia",
                schema: { type: "integer", minimum: 1 },
            },
        ],

        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            fileNamesArray: z.array(z.string()).min(1),
                        }),
                    },
                },
            },
        },

        responses: {
            200: {
                description: "Imágenes eliminadas exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.literal("Imágenes eliminadas exitosamente"),
                            data: z.any(),
                        }),
                    },
                },
            },

            400: {
                description: "ID inválido o body inválido",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },

            404: {
                description: "Noticia no encontrada",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },

            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },

            500: {
                description:
                    "Error interno al eliminar las imágenes o al comunicarse con el microservicio de Media.",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
