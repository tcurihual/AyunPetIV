import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { MessageInsertSchema, MessageUpdateSchema, ErrorValuesSchema } from "@repo/utils"

export function registerMessagesDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/messages",
        tags: ["Messages"],
        summary: "Listar todos los mensajes del sistema",
        description:
            "Obtiene la lista completa de mensajes registrados en la plataforma. " +
            "Cada mensaje está asociado a una publicación y muestra los datos del usuario emisor y receptor. " +
            "Este endpoint requiere autenticación con token JWT.",
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
                description: "Cantidad de mensajes por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Lista de mensajes obtenida correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: { $ref: "#/components/schemas/MessageInsertSchema" },
                        },
                    },
                },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error al obtener los mensajes",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/messages/{id}",
        tags: ["Messages"],
        summary: "Obtener mensaje por ID",
        description:
            "Devuelve los detalles de un mensaje específico identificado por su ID. " +
            "Incluye el contenido, la fecha de envío y los IDs del emisor y receptor.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico del mensaje a consultar",
                schema: { type: "integer", example: 8 },
            },
        ],
        responses: {
            200: {
                description: "Mensaje obtenido correctamente",
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/MessageInsertSchema" },
                    },
                },
            },
            404: {
                description: "Mensaje no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/messages/post/{post_id}",
        tags: ["Messages"],
        summary: "Listar mensajes por post_id",
        description:
            "Obtiene todos los mensajes asociados a una publicación específica. " +
            "Los mensajes se ordenan por fecha de creación de forma descendente (más recientes primero). " +
            "Este endpoint es útil para mostrar todos los comentarios o mensajes de una publicación de adopción.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "post_id",
                in: "path",
                required: true,
                description: "ID numérico de la publicación para obtener sus mensajes",
                schema: { type: "integer", example: 12 },
            },
        ],
        responses: {
            200: {
                description: "Lista de mensajes obtenida correctamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                type: { type: "string", example: "success" },
                                message: {
                                    type: "string",
                                    example: "Mensajes obtenidos correctamente",
                                },
                                data: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/MessageInsertSchema" },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: "Error en parámetros o al obtener mensajes",
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
        path: "/v1/adoptions/messages",
        tags: ["Messages"],
        summary: "Enviar un nuevo mensaje",
        description:
            "Permite que un usuario autenticado envíe un nuevo mensaje a otro usuario asociado a una publicación de adopción. " +
            "Este endpoint se utiliza dentro del flujo de comunicación entre adoptantes y refugios.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: MessageInsertSchema,
                        example: {
                            creatorId: 4,
                            postId: 12,
                            description: "Hola, estoy interesado en adoptar a Luna 🐾",
                        },
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Mensaje enviado exitosamente",
                content: {
                    "application/json": {
                        schema: MessageInsertSchema,
                    },
                },
            },
            400: {
                description: "Error en los datos del mensaje",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "put",
        path: "/v1/adoptions/messages/{id}",
        tags: ["Messages"],
        summary: "Editar el contenido de un mensaje existente",
        description:
            "Permite modificar el texto de un mensaje ya enviado. " +
            "Solo el autor del mensaje o un administrador pueden realizar esta acción.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del mensaje que se desea actualizar",
                schema: { type: "integer", example: 10 },
            },
        ],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: MessageUpdateSchema,
                        example: {
                            description: "Corrijo el mensaje anterior — aún estoy interesado 😅",
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Mensaje actualizado correctamente",
                content: {
                    "application/json": {
                        schema: MessageUpdateSchema,
                    },
                },
            },
            404: {
                description: "Mensaje no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado (usuario no es admin ni autor)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/messages/{id}",
        tags: ["Messages"],
        summary: "Eliminar un mensaje del sistema",
        description:
            "Elimina permanentemente un mensaje existente. " +
            "Solo el emisor original o un administrador tienen permisos para eliminar mensajes. " +
            "La eliminación no se puede deshacer.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico del mensaje que se desea eliminar",
                schema: { type: "integer", example: 10 },
            },
        ],
        responses: {
            200: { description: "Mensaje eliminado correctamente" },
            404: {
                description: "Mensaje no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado (usuario no es admin ni autor)",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
