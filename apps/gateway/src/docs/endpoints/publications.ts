import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    CreatePublicationBodySchema,
    CreatePublicationResponseSchema,
    DeletePublicationResponseSchema,
    ErrorValuesSchema,
    PublicationByIdWithImagesResponseSchema,
    PublicationsWithImagesResponseSchema,
    UpdatePublicationBodySchema,
    UpdatePublicationResponseSchema,
} from "@repo/utils"

export function PublicationRegistryPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/publications",
        tags: ["Publications"],
        summary: "Listar publicaciones de adopción",
        description:
            "Obtiene un listado paginado de publicaciones de adopción. " +
            "Cada publicación incluye información del post, la mascota asociada y datos del creador (id, nombre y foto de perfil). " +
            "Las imágenes se obtienen automáticamente desde el microservicio de Media mediante comunicación interna entre microservicios.",
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
                schema: { type: "integer", default: 20, minimum: 1, maximum: 100 },
            },
            {
                name: "ownerId",
                in: "query",
                required: false,
                description: "Filtra por el ID del creador/propietario de la publicación",
                schema: { type: "integer", example: 123 },
            },
            {
                name: "status",
                in: "query",
                required: false,
                description: "Estado de la publicación (tipo PostStatus)",
                schema: { type: "string", example: "active" },
            },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Publicaciones obtenidas exitosamente con imágenes",
                content: {
                    "application/json": {
                        schema: PublicationsWithImagesResponseSchema,
                    },
                },
            },
            400: {
                description: "Error en los parámetros de consulta",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
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
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/publications/{id}",
        tags: ["Publications"],
        summary: "Obtener publicación por ID",
        description:
            "Obtiene una publicación específica por su ID. " +
            "Incluye información completa del post, la mascota asociada y datos del creador (id, nombre y foto de perfil). " +
            "Las imágenes se obtienen automáticamente desde el microservicio de Media mediante comunicación interna.",
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la publicación a obtener",
                schema: { type: "integer", example: 42 },
            },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Publicación obtenida exitosamente con imágenes",
                content: {
                    "application/json": { schema: PublicationByIdWithImagesResponseSchema },
                },
            },
            404: {
                description: "Publicación no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/publications",
        tags: ["Publications"],
        summary: "Crear publicación de adopción",
        description:
            "Crea una nueva publicación de adopción junto con la mascota asociada. " +
            "se debe subir imágenes (campo `files`) que quedan asociadas a la publicación (entityType = `publications`). " +
            "Requiere autenticación. Solo un ADMIN puede crear para otro usuario (`ownerId`).",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: CreatePublicationBodySchema,
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Publicación creada correctamente; incluye imágenes subidas",
                content: {
                    "application/json": {
                        schema: CreatePublicationResponseSchema,
                    },
                },
            },
            400: {
                description: "Payload inválido",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            403: {
                description: "No autorizado para crear publicaciones para otro usuario",
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
        path: "/v1/adoptions/publications/{id}",
        tags: ["Publications"],
        summary: "Actualizar publicación de adopción",
        description:
            "Actualiza los campos del post (título, descripción) y/o de la mascota asociada (nombre, edad, género, tamaño, especie, esterilizado). " +
            "Permite subir nuevas imágenes (campo `files`) al microservicio de Media para la publicación indicada. " +
            "Requiere autenticación y ser creador de la publicación o ADMIN.",
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la publicación",
                schema: { type: "integer", example: 42 },
            },
        ],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdatePublicationBodySchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description:
                    "Publicación actualizada. La respuesta incluye el estado actual del post, de la mascota y el total de imágenes actuales (`images`), más las recién subidas (`newImages`).",
                content: {
                    "application/json": {
                        schema: UpdatePublicationResponseSchema,
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            403: {
                description: "No autorizado para actualizar esta publicación",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            404: {
                description: "Publicación no encontrada",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/publications/{id}",
        tags: ["Publications"],
        summary: "Eliminar publicación de adopción",
        description:
            "Elimina la publicación indicada y sus dependencias (adoption_request, message, report). " +
            "Si existe mascota asociada, elimina su historial de adopciones y la mascota. " +
            "Intenta eliminar también las imágenes asociadas a la publicación en el microservicio de Media. " +
            "Requiere autenticación y ser creador de la publicación o ADMIN.",
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la publicación a eliminar",
                schema: { type: "integer", example: 42 },
            },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description:
                    "Publicación eliminada. La respuesta incluye las entidades eliminadas y la cantidad de imágenes borradas en Media (si aplica).",
                content: {
                    "application/json": {
                        schema: DeletePublicationResponseSchema,
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            403: {
                description: "No autorizado para eliminar esta publicación",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            404: {
                description: "Publicación no encontrada",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}
