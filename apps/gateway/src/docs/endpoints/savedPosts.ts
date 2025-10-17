import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

const SavedPostSchema = z.object({
    id: z.number().describe("ID único de la publicación guardada"),
    post_id: z.number().describe("ID de la publicación"),
    user_id: z.number().describe("ID del usuario"),
    post: z
        .object({
            id: z.number().describe("ID de la publicación"),
            title: z.string().describe("Título de la publicación"),
            description: z.string().nullable().describe("Descripción de la publicación"),
            status: z.string().describe("Estado de la publicación"),
            created_at: z.string().nullable().describe("Fecha de creación"),
            updated_at: z.string().nullable().describe("Fecha de actualización"),
            creator_id: z.number().nullable().describe("ID del creador de la publicación"),
            pet_id: z.number().nullable().describe("ID de la mascota asociada"),
            pet: z
                .object({
                    id: z.number(),
                    name: z.string().nullable(),
                    species: z.string(),
                    gender: z.string(),
                    age_months: z.number().nullable(),
                    age_years: z.number().nullable(),
                    size: z.string().nullable(),
                    sterilized: z.boolean(),
                    adopted: z.boolean().nullable(),
                    owner_id: z.number().nullable(),
                    created_at: z.string().nullable(),
                    updated_at: z.string().nullable(),
                })
                .nullable()
                .describe("Información de la mascota"),
        })
        .nullable()
        .describe("Información completa de la publicación"),
})

const SavedPostListSchema = z.object({
    items: z.array(SavedPostSchema),
    total: z.number().describe("Total de publicaciones guardadas"),
    page: z.number().describe("Página actual"),
    pageSize: z.number().describe("Tamaño de página"),
    totalPages: z.number().describe("Total de páginas"),
})

const SavePostRequestSchema = z.object({
    post_id: z.number().describe("ID de la publicación a guardar"),
})

const CheckSavedStatusSchema = z.object({
    is_saved: z.boolean().describe("Indica si la publicación está guardada"),
    saved_post_id: z.number().nullable().describe("ID del registro guardado si existe"),
})

export function savedPostsDocs(registry: OpenAPIRegistry) {
    // Registrar esquemas
    registry.register("SavedPost", SavedPostSchema)
    registry.register("SavedPostList", SavedPostListSchema)
    registry.register("SavePostRequest", SavePostRequestSchema)
    registry.register("CheckSavedStatus", CheckSavedStatusSchema)

    // GET /v1/adoptions/saved-posts - Listar publicaciones guardadas
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/saved-posts",
        description:
            "Obtener lista de publicaciones guardadas por el usuario autenticado. Soporta paginación mediante query params: page (defecto: 1) y pageSize (defecto: 10, máximo: 50)",
        summary: "Listar publicaciones guardadas",
        tags: ["Publicaciones Guardadas"],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Lista de publicaciones guardadas obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: SavedPostListSchema,
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    })

    // GET /v1/adoptions/saved-posts/{id} - Obtener publicación guardada específica
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/saved-posts/{id}",
        description: "Obtener una publicación guardada específica por su ID",
        summary: "Obtener publicación guardada por ID",
        tags: ["Publicaciones Guardadas"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().describe("ID de la publicación guardada"),
            }),
        },
        responses: {
            200: {
                description: "Publicación guardada obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: SavedPostSchema,
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            403: {
                description: "No autorizado para acceder a esta publicación guardada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: "Publicación guardada no encontrada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    })

    // GET /v1/adoptions/saved-posts/check/{postId} - Verificar si una publicación está guardada
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/saved-posts/check/{postId}",
        description: "Verificar si una publicación específica está guardada por el usuario",
        summary: "Verificar estado de publicación guardada",
        tags: ["Publicaciones Guardadas"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                postId: z.string().describe("ID de la publicación a verificar"),
            }),
        },
        responses: {
            200: {
                description: "Estado verificado exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: CheckSavedStatusSchema,
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    })

    // POST /v1/adoptions/saved-posts - Guardar publicación
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/saved-posts",
        description: "Guardar una publicación para el usuario autenticado",
        summary: "Guardar publicación",
        tags: ["Publicaciones Guardadas"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: SavePostRequestSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Publicación guardada exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({
                                id: z.number(),
                                post_id: z.number(),
                                user_id: z.number(),
                            }),
                        }),
                    },
                },
            },
            400: {
                description: "Datos inválidos o intento de guardar publicación propia",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: "Publicación no encontrada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            409: {
                description: "La publicación ya está guardada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    })

    // DELETE /v1/adoptions/saved-posts/{id} - Eliminar publicación guardada por ID
    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/saved-posts/{id}",
        description: "Eliminar una publicación guardada por su ID",
        summary: "Eliminar publicación guardada por ID",
        tags: ["Publicaciones Guardadas"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().describe("ID de la publicación guardada"),
            }),
        },
        responses: {
            200: {
                description: "Publicación eliminada de guardados exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({
                                id: z.number(),
                                post_id: z.number(),
                                user_id: z.number(),
                            }),
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            403: {
                description: "No autorizado para eliminar esta publicación guardada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: "Publicación guardada no encontrada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    })

    // DELETE /v1/adoptions/saved-posts/post/{postId} - Eliminar publicación guardada por post ID
    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/saved-posts/post/{postId}",
        description: "Eliminar una publicación guardada por el ID de la publicación",
        summary: "Eliminar publicación guardada por post ID",
        tags: ["Publicaciones Guardadas"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                postId: z.string().describe("ID de la publicación"),
            }),
        },
        responses: {
            200: {
                description: "Publicación eliminada de guardados exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({
                                id: z.number(),
                                post_id: z.number(),
                                user_id: z.number(),
                            }),
                        }),
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: "Publicación guardada no encontrada",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    })
}
