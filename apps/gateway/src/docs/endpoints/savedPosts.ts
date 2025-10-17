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
    registry.register("SavedPost", SavedPostSchema)
    registry.register("SavedPostList", SavedPostListSchema)
    registry.register("SavePostRequest", SavePostRequestSchema)
    registry.register("CheckSavedStatus", CheckSavedStatusSchema)

    // GET /v1/adoptions/saved-posts
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/saved-posts",
        description:
            "Obtener lista de publicaciones guardadas por el usuario autenticado. Soporta paginación mediante query params: page (defecto: 1) y pageSize (defecto: 10, máximo: 50)",
        summary: "Listar publicaciones guardadas",
        tags: ["Saved Posts"],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Lista obtenida exitosamente",
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
            401: { description: "No autenticado" },
            500: { description: "Error interno del servidor" },
        },
    })

    // GET /v1/adoptions/saved-posts/{id}
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/saved-posts/{id}",
        summary: "Obtener publicación guardada por ID",
        description: "Obtiene una publicación guardada específica por su ID.",
        tags: ["Saved Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la publicación guardada",
                schema: { type: "string", example: "42" },
            },
        ],
        responses: {
            200: {
                description: "Publicación obtenida exitosamente",
                content: { "application/json": { schema: SavedPostSchema } },
            },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "No encontrada" },
        },
    })

    // GET /v1/adoptions/saved-posts/check/{postId}
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/saved-posts/check/{postId}",
        summary: "Verificar estado de publicación guardada",
        description: "Verifica si una publicación específica está guardada por el usuario.",
        tags: ["Saved Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "postId",
                in: "path",
                required: true,
                description: "ID de la publicación a verificar",
                schema: { type: "string", example: "101" },
            },
        ],
        responses: {
            200: {
                description: "Estado verificado exitosamente",
                content: {
                    "application/json": { schema: CheckSavedStatusSchema },
                },
            },
            401: { description: "No autenticado" },
        },
    })

    // POST /v1/adoptions/saved-posts
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/saved-posts",
        summary: "Guardar publicación",
        description: "Guarda una publicación para el usuario autenticado.",
        tags: ["Saved Posts"],
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: SavePostRequestSchema } } } },
        responses: {
            201: { description: "Guardada exitosamente" },
            400: { description: "Datos inválidos" },
            401: { description: "No autenticado" },
            404: { description: "Publicación no encontrada" },
            409: { description: "Ya está guardada" },
        },
    })

    // DELETE /v1/adoptions/saved-posts/{id}
    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/saved-posts/{id}",
        summary: "Eliminar publicación guardada por ID",
        description: "Elimina una publicación guardada por su ID.",
        tags: ["Saved Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la publicación guardada",
                schema: { type: "string", example: "45" },
            },
        ],
        responses: {
            200: { description: "Eliminada exitosamente" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "No encontrada" },
        },
    })

    // DELETE /v1/adoptions/saved-posts/post/{postId}
    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/saved-posts/post/{postId}",
        summary: "Eliminar publicación guardada por post ID",
        description: "Elimina una publicación guardada según el ID de la publicación original.",
        tags: ["Saved Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "postId",
                in: "path",
                required: true,
                description: "ID de la publicación original",
                schema: { type: "string", example: "99" },
            },
        ],
        responses: {
            200: { description: "Eliminada exitosamente" },
            401: { description: "No autenticado" },
            404: { description: "No encontrada" },
        },
    })
}

// === Posts públicos ===
export function postsDocs(registry: OpenAPIRegistry) {
    const PostSchema = z.object({
        id: z.number(),
        title: z.string(),
        description: z.string().nullable(),
        status: z.string(),
        creator_id: z.number().nullable(),
        pet_id: z.number().nullable(),
    })

    registry.register("Post", PostSchema)

    // GET /v1/adoptions/posts
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/posts",
        summary: "Listar publicaciones públicas",
        description:
            "Obtiene lista de publicaciones activas. Soporta paginación y filtros básicos.",
        tags: ["Publicaciones"],
        responses: {
            200: {
                description: "Lista obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: z.object({ items: z.array(PostSchema), total: z.number() }),
                        }),
                    },
                },
            },
            500: { description: "Error interno del servidor" },
        },
    })

    // GET /v1/adoptions/posts/{id}
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/posts/{id}",
        summary: "Obtener publicación por ID",
        description: "Obtiene una publicación específica por su ID.",
        tags: ["Publicaciones"],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la publicación",
                schema: { type: "string", example: "55" },
            },
        ],
        responses: {
            200: { description: "Publicación obtenida exitosamente" },
            401: { description: "No autenticado" },
            404: { description: "No encontrada" },
            500: { description: "Error interno" },
        },
    })

    // POST /v1/adoptions/posts
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/posts",
        summary: "Crear publicación",
        description: "Crea una nueva publicación (requiere autenticación).",
        tags: ["Publicaciones"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: PostSchema.pick({ title: true, description: true, pet_id: true }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Publicación creada" },
            400: { description: "Datos inválidos" },
            401: { description: "No autenticado" },
            500: { description: "Error interno" },
        },
    })

    // PUT /v1/adoptions/posts/{id}
    registry.registerPath({
        method: "put",
        path: "/v1/adoptions/posts/{id}",
        summary: "Actualizar publicación",
        description: "Actualiza una publicación existente.",
        tags: ["Publicaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la publicación a actualizar",
                schema: { type: "string", example: "55" },
            },
        ],
        request: {
            body: { content: { "application/json": { schema: PostSchema.partial() } } },
        },
        responses: {
            200: { description: "Actualizada" },
            400: { description: "Datos inválidos" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "No encontrada" },
        },
    })

    // DELETE /v1/adoptions/posts/{id}
    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/posts/{id}",
        summary: "Eliminar publicación",
        description: "Elimina una publicación por su ID.",
        tags: ["Publicaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la publicación a eliminar",
                schema: { type: "string", example: "55" },
            },
        ],
        responses: {
            200: { description: "Eliminada exitosamente" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
            404: { description: "No encontrada" },
        },
    })
}
