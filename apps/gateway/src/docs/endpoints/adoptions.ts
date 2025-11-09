import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import {
    MineRequestWithImagesResponseSchema,
    ErrorValuesSchema,
    ConfirmAcceptResponseSchema,
    ValidateCodeRequestSchema,
    ValidateCodeResponseSchema,
    AdoptionRequestsWithImagesResponseSchema,
    AdoptionRequestByIdWithImagesResponseSchema,
} from "@repo/utils"

const CreateAdoptionRequestSchema = z.object({
    post_id: z.number().describe("ID del post al que se aplica la solicitud"),
    message: z.string().optional().describe("Mensaje opcional para el Giver"),
})

const UpdateAdoptionRequestSchema = z.object({
    status: z.string().optional().describe("Nuevo estado (ej. 'rejected')"),
    message: z.string().optional().describe("Nuevo mensaje (solo para el solicitante)"),
})

export function ConfirmAcceptDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/adoption-requests/{id}/confirm-accept",
        tags: ["AdoptionRequests"],
        summary: "Confirmar aceptación de solicitud de adopción",
        description:
            "Confirma que la solicitud de adopción identificada por `id` ha sido aceptada por el dueño/organización. " +
            "Se espera un body con la información de confirmación y opcionalmente detalles de la aceptación.",
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la solicitud de adopción a aceptar",
                schema: { type: "integer", example: 123 },
            },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitud aceptada",
                content: {
                    "application/json": {
                        schema: ConfirmAcceptResponseSchema,
                    },
                },
            },
            400: {
                description: "Error al aceptar la solicitud",
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
                description: "No autorizado (usuario no es dueño del post)",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                    },
                },
            },
            404: {
                description: "Solicitud no encontrada",
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
        path: "/v1/adoptions/adoption-requests/validate-code",
        tags: ["AdoptionRequests"],
        summary: "Validar código de adopción",
        description:
            "Valida un código de adopción (por ejemplo, entregado al adoptante) y cierra la solicitud asociada si el código es correcto. " +
            "El request debe incluir el `adoption_code` y el `requestId` o `postId` según el flujo.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ValidateCodeRequestSchema,
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description:
                    "Código de adopción validado y solicitud cerrada, los valores de status pueden ser `pendiente`, `aprobado`, `denegado`, `completada`",
                content: {
                    "application/json": {
                        schema: ValidateCodeResponseSchema,
                    },
                },
            },
            400: {
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
 * Documentación actualizada para mis solicitudes con imágenes
 * Incluye imágenes de posts y mascotas obtenidas del microservicio de Media
 */
export function mineRequestWithImagesDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/adoption-requests/mine",
        tags: ["AdoptionRequests"],
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

export function registerAdoptionRequestDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/adoption-requests",
        tags: ["AdoptionRequests"],
        summary: "Crear una nueva solicitud de adopción",
        description:
            "Crea una nueva solicitud de adopción para una publicación. El `requester_id` se toma del usuario autenticado. " +
            "No se puede solicitar en un post propio. Falla si ya existe una solicitud 'pending' del mismo usuario para el mismo post.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: CreateAdoptionRequestSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Solicitud creada exitosamente",
                content: {
                    "application/json": {
                        schema: AdoptionRequestByIdWithImagesResponseSchema.optional(),
                    },
                },
            },
            400: {
                description: "Datos inválidos (ej. falta post_id)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado (ej. solicitando en post propio)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Post no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            409: {
                description: "Conflicto (ya existe una solicitud pendiente)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // GET /
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/adoption-requests",
        tags: ["AdoptionRequests"],
        summary: "Listar solicitudes de adopción (rol-dependiente)",
        description:
            "Obtiene una lista de solicitudes de adopción. La respuesta varía según el rol del usuario autenticado: \n" +
            "- **Giver (rol 21):** Devuelve las solicitudes hechas a *sus* publicaciones (equivale a /mine). \n" +
            "- **Adopter (rol 20):** Devuelve solo las solicitudes *creadas por él*. \n" +
            "- **Admin:** Devuelve todas las solicitudes del sistema (paginado).",
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
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitudes obtenidas exitosamente",
                content: {
                    "application/json": {
                        schema: AdoptionRequestsWithImagesResponseSchema,
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // GET /:id
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/adoption-requests/{id}",
        tags: ["AdoptionRequests"],
        summary: "Obtener una solicitud de adopción por ID",
        description:
            "Obtiene los detalles de una solicitud de adopción específica, incluyendo imágenes del post, mascota y el nombre del solicitante.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico de la solicitud de adopción",
                schema: { type: "integer", example: 1 },
            },
        ],
        responses: {
            200: {
                description: "Solicitud obtenida exitosamente",
                content: {
                    "application/json": {
                        schema: AdoptionRequestByIdWithImagesResponseSchema,
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Solicitud no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // PUT /:id
    registry.registerPath({
        method: "put",
        path: "/v1/adoptions/adoption-requests/{id}",
        tags: ["AdoptionRequests"],
        summary: "Actualizar una solicitud de adopción (status o mensaje)",
        description:
            "Actualiza una solicitud. Permisos restringidos: \n" +
            "- Solo el **Giver** (dueño del post) puede cambiar el `status` (ej. a 'rejected'). \n" +
            "- Solo el **Adopter** (solicitante) puede cambiar el `message`. \n" +
            "**Nota:** Los estados 'approved' y 'completed' se gestionan vía `/confirm-accept` y `/validate-code`.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la solicitud a actualizar",
                schema: { type: "integer", example: 1 },
            },
        ],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdateAdoptionRequestSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Solicitud actualizada",
                content: {
                    "application/json": {
                        schema: AdoptionRequestByIdWithImagesResponseSchema.optional(),
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
            403: {
                description: "No autorizado (permisos insuficientes)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Solicitud no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // DELETE /:id
    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/adoption-requests/{id}",
        tags: ["AdoptionRequests"],
        summary: "Eliminar una solicitud de adopción",
        description:
            "Elimina una solicitud de adopción. Solo el usuario que creó la solicitud (`requester_id`) tiene permiso para eliminarla.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID de la solicitud a eliminar",
                schema: { type: "integer", example: 1 },
            },
        ],
        responses: {
            200: {
                description: "Solicitud eliminada exitosamente",
                content: { "application/json": { schema: z.object({ id: z.number() }) } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado (solo el creador puede eliminar)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Solicitud no encontrada",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
