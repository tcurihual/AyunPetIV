import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import { ErrorValuesSchema } from "@repo/utils"

// Puedes definir el esquema base de form_response aquí o reutilizar uno desde @repo/utils si ya lo hiciste
const FormResponseSchema = z.object({
    id: z.number(),
    id_user: z.number(),
    id_post_form: z.number(),
    answer: z.string(),
    created_at: z.string(),
    updated_at: z.string().optional(),
})

export function listFormResponsesDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/form-responses",
        tags: ["Form Responses"],
        summary: "Listar respuestas de formulario por id_post_form",
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
}

export function createFormResponseDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/form-responses",
        tags: ["Form Responses"],
        summary: "Crear una nueva respuesta de formulario",
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
}

export function updateFormResponseDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "put",
        path: "/v1/form-responses/{id}",
        tags: ["Form Responses"],
        summary: "Actualizar una respuesta de formulario",
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
}

export function deleteFormResponseDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "delete",
        path: "/v1/form-responses/{id}",
        tags: ["Form Responses"],
        summary: "Eliminar una respuesta de formulario",
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
}

export function listByPublicationFormResponsesDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/form-responses/publication/{postId}",
        tags: ["Form Responses"],
        summary: "Obtener respuestas asociadas a una publicación",
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
