import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    MineRequestResponseSchema,
    MineRequestWithImagesResponseSchema,
    ErrorValuesSchema,
    ConfirmAcceptResponseSchema,
    ValidateCodeRequestSchema,
    ValidateCodeResponseSchema,
    PublicationsWithImagesResponseSchema,
    PublicationByIdWithImagesResponseSchema,
} from "@repo/utils"

export function mineRequestDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/mineRequests",
        tags: ["Adoptions"],
        responses: {
            200: {
                description: "Solicitudes obtenidas exitosamente",
                content: {
                    "application/json": {
                        schema: MineRequestResponseSchema,
                    },
                },
            },
            400: {
                description: "Error al obtener solicitudes",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}

export function ConfirmAcceptDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/:id/confirm-accept", //esto esta sin probar por cuestiones de la base de datos
        tags: ["Adoptions"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ConfirmAcceptResponseSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Solicitud aceptada",
                content: {
                    "application/json": {
                        schema: ConfirmAcceptResponseSchema,
                    },
                },
            },
            "400": {
                description: "Error al aceptar la solicitud",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}

export function validateCodeDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/validate-code", //esto esta sin probar por cuestiones de la base de datos
        tags: ["Adoptions"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ValidateCodeRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Código de adopción validado y solicitud cerrada",
                content: {
                    "application/json": {
                        schema: ValidateCodeResponseSchema,
                    },
                },
            },
            "400": {
                description: "Error al validar el código",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}

/**
 * Documentación para el endpoint de listado de publicaciones
 * Incluye imágenes de posts y mascotas obtenidas del microservicio de Media
 */
export function listPublicationsDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/publications",
        tags: ["Adoptions - Publications"],
        summary: "Listar publicaciones de adopción",
        description: 
            "Obtiene un listado paginado de publicaciones de adopción. " +
            "Cada publicación incluye información del post y la mascota asociada. " +
            "Las imágenes se obtienen automáticamente desde el microservicio de Media mediante comunicación interna entre microservicios.",
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
}

/**
 * Documentación para el endpoint de obtener publicación por ID
 * Incluye imágenes obtenidas del microservicio de Media
 */
export function getPublicationByIdDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/publications/{id}",
        tags: ["Adoptions - Publications"],
        summary: "Obtener publicación por ID",
        description: 
            "Obtiene una publicación específica por su ID. " +
            "Incluye información completa del post y la mascota asociada. " +
            "Las imágenes se obtienen automáticamente desde el microservicio de Media mediante comunicación interna.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Publicación obtenida exitosamente con imágenes",
                content: {
                    "application/json": {
                        schema: PublicationByIdWithImagesResponseSchema,
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
}

/**
 * Documentación actualizada para mis solicitudes con imágenes
 * Incluye imágenes de posts y mascotas obtenidas del microservicio de Media
 */
export function mineRequestWithImagesDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/mineRequests",
        tags: ["Adoptions"],
        summary: "Obtener mis solicitudes de adopción",
        description:
            "Obtiene las solicitudes de adopción del usuario autenticado. " +
            "Incluye imágenes de los posts y mascotas asociadas obtenidas desde el microservicio de Media mediante comunicación interna entre microservicios.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitudes obtenidas exitosamente con imágenes",
                content: {
                    "application/json": {
                        schema: MineRequestWithImagesResponseSchema,
                    },
                },
            },
            400: {
                description: "Error al obtener solicitudes",
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
}
