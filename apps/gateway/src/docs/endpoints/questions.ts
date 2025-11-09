import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import {
    ErrorValuesSchema,
    QuestionCreateSchema,
    QuestionSchema,
    QuestionUpdateSchema,
} from "@repo/utils"

export function registerQuestionsDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/questions",
        description:
            "Obtener lista de preguntas disponibles. Soporta paginación mediante query params: page (defecto: 1) y pageSize (defecto: 10, máximo: 50)",
        summary: "Listar preguntas guardadas (publico)",
        tags: ["Questions"],
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
                description: "Cantidad de publicaciones por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
        responses: {
            200: {
                description: "Lista obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: QuestionSchema,
                            page: z.number(),
                            pageSize: z.number(),
                            total: z.number(),
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
        method: "get",
        path: "/v1/adoptions/questions/{id}",
        summary: "Obtener pregunta por ID (publico)",
        description: "Obtiene una pregunta específica por su ID.",
        tags: ["Questions"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta a obtener",
                schema: { type: "integer", example: 42 },
            },
        ],
        responses: {
            200: {
                description: "Pregunta obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: QuestionSchema,
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

    // POST /v1/adoptions/saved-posts
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/questions",
        summary: "Crear pregunta (solo admin)",
        description:
            "Crea una pregunta, type puede ser: `number`,`boolean`,`text`,`select`,`multiselect`.",
        tags: ["Questions"],
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: QuestionCreateSchema } } } },
        responses: {
            201: {
                description: "Creada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: QuestionSchema,
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
        path: "/v1/adoptions/questions/{id}",
        summary: "Actualizar una pregunta por ID (solo admin)",
        description:
            "Actualiza una pregunta por su ID. Type puede ser: `number`,`boolean`,`text`,`select`,`multiselect`.",
        tags: ["Questions"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta a actualizar",
                schema: { type: "integer", example: 45 },
            },
        ],
        request: { body: { content: { "application/json": { schema: QuestionUpdateSchema } } } },

        responses: {
            200: {
                description: "Actualizada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: QuestionSchema,
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
        path: "/v1/adoptions/questions/{id}",
        summary: "Eliminar pregunta por ID (solo admin)",
        description: "Elimina una pregunta por su ID.",
        tags: ["Questions"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta a eliminar",
                schema: { type: "integer", example: 45 },
            },
        ],
        responses: {
            200: {
                description: "Eliminada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({ id: z.number() }),
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
