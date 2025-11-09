import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import { ErrorValuesSchema } from "@repo/utils"

export function registerPostFormDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/post-form",
        summary: "Listar preguntas asociadas a un post",
        description:
            "Devuelve las preguntas vinculadas a un post específico. Soporta paginación mediante page y limit, además de orden mediante order. El formato de order es: campo.dirección (ej: created_at.desc).",
        tags: ["PostForm"],
        security: [{ bearerAuth: [] }],

        parameters: [
            {
                name: "post_id",
                in: "query",
                required: true,
                description: "ID del post (UUID) del cual obtener las preguntas",
                schema: { type: "string", format: "uuid" },
            },
            {
                name: "page",
                in: "query",
                required: false,
                description: "Número de página (defecto: 1)",
                schema: { type: "integer", default: 1, minimum: 1 },
            },
            {
                name: "limit",
                in: "query",
                required: false,
                description:
                    "Cantidad de elementos por página (defecto: 10, máximo recomendado: 100)",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
            },
            {
                name: "order",
                in: "query",
                required: false,
                description:
                    "Orden de los resultados. Formato: campo.dirección. Campos permitidos: created_at, id. Direcciones: asc, desc. Ejemplo: created_at.desc",
                schema: {
                    type: "string",
                    default: "created_at.desc",
                },
            },
        ],

        responses: {
            200: {
                description: "Lista obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.string(),
                            meta: z.object({
                                page: z.number(),
                                limit: z.number(),
                                total: z.number(),
                                order: z.string(),
                            }),
                            data: z.array(
                                z.object({
                                    id: z.string(),
                                    post_id: z.string(),
                                    question_id: z.string(),
                                    created_at: z.string(),
                                    question: z.object({
                                        id: z.string(),
                                        content: z.string(),
                                        type: z.string(),
                                    }),
                                })
                            ),
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
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
        path: "/v1/entities/post-form",
        summary: "Asociar una pregunta a una publicación",
        description:
            "Asocia una pregunta existente a un post. Valida que el post y la pregunta existan y que la relación no esté duplicada.",
        tags: ["PostForm"],
        security: [{ bearerAuth: [] }],

        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({ post_id: z.number(), question_id: z.number() }),
                    },
                },
            },
        },

        responses: {
            201: {
                description: "Asociación creada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.literal("CREATED"),
                            data: z.object({
                                id: z.string(),
                                post_id: z.string(),
                                question_id: z.string(),
                                created_at: z.string(),
                                question: z.object({
                                    id: z.string(),
                                    content: z.string(),
                                    type: z.string(),
                                }),
                            }),
                        }),
                    },
                },
            },
            400: {
                description: "Datos inválidos",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Publicación no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            409: {
                description: "Ya está guardada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "patch",
        path: "/v1/entities/post-form/{id}",
        summary: "Actualizar relación publicación-pregunta ",
        description:
            "Actualiza la relación entre un post y una pregunta. Valida existencia del registro, existencia del post/pregunta si se envían, y evita duplicados. Permite actualizar parcial.",
        tags: ["PostForm"],
        security: [{ bearerAuth: [] }],

        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la relación a actualizar",
                schema: { type: "integer", minimum: 1 },
            },
        ],

        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({ post_id: z.number(), question_id: z.number() }),
                    },
                },
            },
        },

        responses: {
            200: {
                description: "Actualizada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.literal("UPDATED"),
                            data: z.object({
                                id: z.number(),
                                post_id: z.number(),
                                question_id: z.number(),
                                created_at: z.string(),
                                question: z.object({
                                    id: z.string(),
                                    content: z.string(),
                                    type: z.string(),
                                }),
                            }),
                        }),
                    },
                },
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
                description: "No encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/entities/post-form/{id}",
        summary: "Eliminar relación publicacion - pregunta",
        description:
            "Elimina una relación entre una publicación y una pregunta usando su ID numérico. Valida existencia y elimina de manera segura.",
        tags: ["PostForm"],
        security: [{ bearerAuth: [] }],

        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la relación a eliminar",
                schema: { type: "integer", minimum: 1 },
            },
        ],

        responses: {
            200: {
                description: "Eliminada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            type: z.literal("success"),
                            message: z.literal("DELETED"),
                            data: z.object({
                                id: z.number(),
                            }),
                        }),
                    },
                },
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
                description: "No encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
