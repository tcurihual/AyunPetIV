import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
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

export function giverRequestDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/giverRequests",
        tags: ["Entities"],
        responses: {
            200: {
                description: "Organizaciones no validadas obtenidas correctamente",
                content: {
                    "application/json": {
                        schema: GiverRequestResponseSchema,
                    },
                },
            },
            400: {
                description: "Error al obtener organizaciones",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}

export function adoptionHistory(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-history", //esto esta sin probar por cuestiones de la base de datos
        tags: ["Entities"],
        responses: {
            "200": {
                description: "Historial de adopciones obtenido exitosamente",
                content: {
                    "application/json": {
                        schema: AdoptionHistoryResponseSchema,
                    },
                },
            },
            "400": {
                description: "Error al obtener el historial de adopciones",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}
export function validateGiverAccountDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "patch",
        path: "/v1/entities/giver-requests/{userId}/validate",
        tags: ["Entities"],
        summary: "Validar cuenta de dador de mascotas",
        description:
            "Valida la cuenta de un dador, cambia el estado `validated` a `true` y envía un correo electrónico de confirmación al usuario. Requiere permisos de administrador.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Cuenta validada exitosamente",
                content: {
                    "application/json": {
                        schema: ValidateGiverAccountResponseSchema,
                    },
                },
            },
            400: {
                description: "ID de usuario inválido o cuenta ya validada",
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
            403: {
                description: "No autorizado - Requiere rol de administrador (rol 19)",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            404: {
                description: "Usuario no encontrado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}


export function getAdoptionHistoryByIdDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["Entities - Adoption History"],
        summary: "Obtener historial de adopción por ID",
        description: "Retorna el historial de adopción de una mascota específica usando su ID.",
        responses: {
            200: {
                description: "Historial de adopción obtenido exitosamente",
                content: {
                    "application/json": {
                        schema: AdoptionHistoryByIdResponseSchema,
                    },
                },
            },
            404: {
                description: "Historial de adopción no encontrado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}


export function createAdoptionHistoryDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/entities/adoption-history",
        tags: ["Entities - Adoption History"],
        summary: "Crear nuevo historial de adopción",
        description:
            "Crea un nuevo registro de historial de adopción. Solo los administradores pueden crear registros de historial. Requiere autenticación y rol de administrador (rol 19).",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: CreateAdoptionHistoryRequestSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Historial de adopción creado exitosamente",
                content: {
                    "application/json": {
                        schema: CreateAdoptionHistoryResponseSchema,
                    },
                },
            },
            400: {
                description: "Datos inválidos en el request",
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
            403: {
                description: "No autorizado - Requiere rol de administrador (rol 19)",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}


export function updateAdoptionHistoryDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "put",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["Entities - Adoption History"],
        summary: "Actualizar historial de adopción",
        description:
            "Actualiza un registro de historial de adopción existente. Solo el propietario original (fromownerid) o un administrador pueden actualizar el registro. Requiere autenticación.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdateAdoptionHistoryRequestSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Historial de adopción actualizado exitosamente",
                content: {
                    "application/json": {
                        schema: UpdateAdoptionHistoryResponseSchema,
                    },
                },
            },
            400: {
                description: "Datos inválidos en el request",
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
            403: {
                description: "No autorizado - Solo el propietario o admin pueden actualizar",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            404: {
                description: "Historial de adopción no encontrado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
        },
    })
}


export function deleteAdoptionHistoryDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "delete",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["Entities - Adoption History"],
        summary: "Eliminar historial de adopción",
        description:
            "Elimina un registro de historial de adopción. Solo el propietario original (fromownerid) o un administrador pueden eliminar el registro. Requiere autenticación.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Historial de adopción eliminado exitosamente",
                content: {
                    "application/json": {
                        schema: DeleteAdoptionHistoryResponseSchema,
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
            403: {
                description: "No autorizado - Solo el propietario o admin pueden eliminar",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            404: {
                description: "Historial de adopción no encontrado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            500: {
                description: "Error interno del servidor",
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
 * Documentación para el endpoint de listado de usuarios con imágenes
 * Incluye imágenes de perfil obtenidas del microservicio de Media
 */
export function getUsersDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/users",
        tags: ["Entities - Users"],
        summary: "Listar usuarios",
        description:
            "Obtiene un listado paginado de usuarios del sistema. " +
            "Solo accesible para administradores. " +
            "Las imágenes de perfil se obtienen automáticamente desde el microservicio de Media mediante comunicación interna entre microservicios.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Usuarios obtenidos exitosamente con imágenes de perfil",
                content: {
                    "application/json": {
                        schema: UsersWithImagesResponseSchema,
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
            403: {
                description: "No autorizado - Requiere rol de administrador",
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
 * Documentación para el endpoint de obtener usuario por ID con imágenes
 * Incluye imágenes de perfil obtenidas del microservicio de Media
 */
export function getUserByIdDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/users/{id}",
        tags: ["Entities - Users"],
        summary: "Obtener usuario por ID",
        description:
            "Obtiene información detallada de un usuario específico por su ID. " +
            "Las imágenes de perfil se obtienen automáticamente desde el microservicio de Media mediante comunicación interna.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Usuario obtenido exitosamente con imágenes de perfil",
                content: {
                    "application/json": {
                        schema: UserByIdWithImagesResponseSchema,
                    },
                },
            },
            404: {
                description: "Usuario no encontrado",
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
 * Documentación para el endpoint de listado de solicitudes de adopción con imágenes
 * Incluye imágenes de posts obtenidas del microservicio de Media
 */
export function getAdoptionRequestsDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-requests",
        tags: ["Entities - Adoption Requests"],
        summary: "Listar solicitudes de adopción",
        description:
            "Obtiene un listado de todas las solicitudes de adopción. " +
            "Las imágenes de los posts asociados se obtienen automáticamente desde el microservicio de Media mediante comunicación interna entre microservicios.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitudes de adopción obtenidas exitosamente con imágenes de posts",
                content: {
                    "application/json": {
                        schema: AdoptionRequestsWithImagesResponseSchema,
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
 * Documentación para el endpoint de obtener solicitud de adopción por ID con imágenes
 * Incluye imágenes del post obtenidas del microservicio de Media
 */
export function getAdoptionRequestByIdDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-requests/{id}",
        tags: ["Entities - Adoption Requests"],
        summary: "Obtener solicitud de adopción por ID",
        description:
            "Obtiene información detallada de una solicitud de adopción específica por su ID. " +
            "Las imágenes del post asociado se obtienen automáticamente desde el microservicio de Media mediante comunicación interna.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitud de adopción obtenida exitosamente con imágenes del post",
                content: {
                    "application/json": {
                        schema: AdoptionRequestByIdWithImagesResponseSchema,
                    },
                },
            },
            404: {
                description: "Solicitud de adopción no encontrada",
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
