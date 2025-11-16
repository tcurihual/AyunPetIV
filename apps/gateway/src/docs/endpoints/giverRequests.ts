import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { BaseResponseSchema, ErrorValuesSchema } from "@repo/utils"
import z from "zod"

// Schema para la respuesta de listar solicitudes de dador
const GiverRequestItemSchema = z.object({
    id: z.number().describe("ID del usuario"),
    name: z.string().describe("Nombre del usuario"),
    email: z.string().email().describe("Correo electrónico del usuario"),
    role: z.number().describe("Rol actual del usuario (20 = adoptante)"),
    rut: z.string().describe("RUT del usuario"),
    files: z.array(z.string()).describe("Lista de archivos/documentos adjuntos"),
})

const GiverRequestsListResponseSchema = z.object({
    status: z.number().default(200),
    message: z.string().default("Listado de solicitudes de creación de cuentas"),
    data: z.array(GiverRequestItemSchema),
})

// Schema para la respuesta de enviar solicitud
const SubmitGiverRequestResponseSchema = z.object({
    status: z.number().default(200),
    message: z
        .string()
        .default(
            "Solicitud enviada exitosamente. Podrás seguir usando la app como adoptante mientras la revisamos."
        ),
    data: z.object({
        id: z.number().describe("ID del usuario"),
        email: z.string().email().describe("Correo electrónico del usuario"),
        status: z.string().default("pending_validation").describe("Estado de la solicitud"),
        message: z
            .string()
            .describe("Mensaje adicional sobre el proceso de validación"),
    }),
})

// Schema para la respuesta de validar solicitud - Escalamiento
const ValidateGiverRequestUpgradeResponseSchema = z.object({
    status: z.number().default(200),
    message: z.string().default("Solicitud aprobada. Usuario escalado a dador exitosamente."),
    data: z.object({
        id: z.number().describe("ID del usuario"),
        email: z.string().email().describe("Correo electrónico del usuario"),
        previousRole: z.number().default(20).describe("Rol anterior (adoptante)"),
        newRole: z.number().default(22).describe("Nuevo rol (dador)"),
    }),
})

// Schema para la respuesta de validar solicitud - Registro inicial
const ValidateGiverRequestNewUserResponseSchema = z.object({
    status: z.number().default(200),
    message: z.string().default("Cuenta validada exitosamente"),
    data: z.object({
        id: z.number().describe("ID del usuario"),
        email: z.string().email().describe("Correo electrónico del usuario"),
        validated: z.boolean().default(true).describe("Estado de validación"),
        role: z.number().describe("Rol del usuario (21 = shelter, 22 = dador, 20 = adoptante)"),
    }),
})

// Schema para la respuesta de rechazar solicitud
const RejectGiverRequestResponseSchema = z.object({
    status: z.number().default(200),
    message: z
        .string()
        .default("Solicitud rechazada. El usuario mantiene acceso como adoptante."),
    data: z.object({
        id: z.number().describe("ID del usuario"),
        email: z.string().email().describe("Correo electrónico del usuario"),
        role: z.number().default(20).describe("Rol del usuario (se mantiene como adoptante)"),
    }),
})

export function registerGiverRequestsPaths(registry: OpenAPIRegistry) {
    // GET /v1/entities/giver-request - Listar solicitudes pendientes
    registry.registerPath({
        method: "get",
        path: "/v1/entities/giver-request",
        tags: ["Giver Requests"],
        summary: "Listar solicitudes de validación pendientes (Admin)",
        description:
            "Obtiene todas las solicitudes pendientes de validación. Incluye dos tipos de solicitudes:\n\n" +
            "1. **Nuevos registros**: Usuarios que se registraron como shelter (rol 21) o dador (rol 22) con `validated=false` y tienen documentos.\n" +
            "2. **Escalamiento de rol**: Usuarios adoptantes (rol 20) que ya están validados (`validated=true`) y solicitan convertirse en dadores, teniendo documentos pendientes.\n\n" +
            "Solo accesible para administradores.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Solicitudes obtenidas exitosamente",
                content: {
                    "application/json": {
                        schema: GiverRequestsListResponseSchema,
                        example: {
                            status: 200,
                            message: "Listado de solicitudes de creación de cuentas",
                            data: [
                                {
                                    id: 15,
                                    name: "Juan Pérez",
                                    email: "juan.perez@example.com",
                                    role: 20,
                                    rut: "12345678-9",
                                    files: ["documento1.pdf", "documento2.jpg"],
                                },
                            ],
                        },
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Solo administradores",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno del servidor",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // POST /v1/entities/giver-request/submit - Enviar solicitud para ser dador
    registry.registerPath({
        method: "post",
        path: "/v1/entities/giver-request/submit",
        tags: ["Giver Requests"],
        summary: "Solicitar escalamiento a dador (Usuario adoptante)",
        description:
            "Permite a un usuario adoptante (rol 20) solicitar convertirse en dador. " +
            "El usuario debe adjuntar documentos de validación. " +
            "\n\n**IMPORTANTE:** " +
            "El usuario **mantiene su acceso completo como adoptante** mientras se revisa la solicitud. " +
            "El campo `validated` **NO cambia** durante este proceso. " +
            "Solo cuando el admin apruebe la solicitud, el `role` cambiará de 20 a 22. " +
            "\n\nLa solicitud queda pendiente hasta que un administrador la apruebe o rechace.",
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        properties: {
                            documents: {
                                type: "array",
                                items: {
                                    type: "string",
                                    format: "binary",
                                },
                                description:
                                    "Documentos de validación (máximo 10 archivos). " +
                                    "Puede incluir: cédula de identidad, certificados, etc.",
                            },
                        },
                        required: ["documents"],
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Solicitud enviada exitosamente",
                content: {
                    "application/json": {
                        schema: SubmitGiverRequestResponseSchema,
                        example: {
                            status: 200,
                            message:
                                "Solicitud enviada exitosamente. Podrás seguir usando la app como adoptante mientras la revisamos.",
                            data: {
                                id: 15,
                                email: "usuario@example.com",
                                status: "pending_validation",
                                message:
                                    "Recibirás un correo cuando sea validada. Puedes seguir usando la app normalmente.",
                            },
                        },
                    },
                },
            },
            400: {
                description: "Error en la solicitud - Ya existe solicitud o faltan documentos",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                        examples: {
                            pending: {
                                summary: "Solicitud pendiente existente",
                                value: {
                                    status: 400,
                                    message: "Ya tienes una solicitud pendiente de validación",
                                    data: null,
                                },
                            },
                            noDocuments: {
                                summary: "Sin documentos",
                                value: {
                                    status: 400,
                                    message: "Debes adjuntar al menos un documento",
                                    data: null,
                                },
                            },
                            wrongRole: {
                                summary: "Rol incorrecto",
                                value: {
                                    status: 400,
                                    message:
                                        "Solo usuarios adoptantes pueden solicitar convertirse en dadores",
                                    data: null,
                                },
                            },
                        },
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            502: {
                description: "Error al guardar documentos en el servidor Media",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // PATCH /v1/entities/giver-request/:userId/validate - Aprobar solicitud
    registry.registerPath({
        method: "patch",
        path: "/v1/entities/giver-request/{userId}/validate",
        tags: ["Giver Requests"],
        summary: "Aprobar solicitud de validación (Admin)",
        description:
            "Aprueba una solicitud de validación. El comportamiento varía según el tipo de solicitud:\n\n" +
            "**Tipo 1 - Nuevo registro (shelter/dador sin validar):**\n" +
            "- Usuario con rol 21 (shelter) o 22 (dador) y `validated=false`\n" +
            "- Acción: Cambia `validated` de false a true\n" +
            "- El rol se mantiene sin cambios\n\n" +
            "**Tipo 2 - Escalamiento de adoptante a dador:**\n" +
            "- Usuario con rol 20 (adoptante) y `validated=true`\n" +
            "- Acción: Cambia `role` de 20 a 22 (adoptante → dador)\n" +
            "- El campo `validated` se mantiene sin cambios (true)\n\n" +
            "En todos los casos:\n" +
            "- Se eliminan los documentos del servidor Media\n" +
            "- Se envía correo de confirmación al usuario\n" +
            "- Solo accesible para administradores",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true,
                description: "ID del usuario cuya solicitud se va a aprobar",
                schema: { type: "string" },
            },
        ],
        responses: {
            200: {
                description: "Solicitud aprobada exitosamente",
                content: {
                    "application/json": {
                        schema: z.union([
                            ValidateGiverRequestUpgradeResponseSchema,
                            ValidateGiverRequestNewUserResponseSchema,
                        ]),
                        examples: {
                            upgrade: {
                                summary: "Escalamiento de adoptante a dador",
                                value: {
                                    status: 200,
                                    message:
                                        "Solicitud aprobada. Usuario escalado a dador exitosamente.",
                                    data: {
                                        id: 15,
                                        email: "usuario@example.com",
                                        previousRole: 20,
                                        newRole: 22,
                                    },
                                },
                            },
                            newUser: {
                                summary: "Validación de registro inicial",
                                value: {
                                    status: 200,
                                    message: "Cuenta validada exitosamente",
                                    data: {
                                        id: 15,
                                        email: "shelter@example.com",
                                        validated: true,
                                        role: 21,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: "Error en la solicitud - Usuario no válido o sin solicitud pendiente",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                        examples: {
                            wrongRole: {
                                summary: "Usuario no es adoptante",
                                value: {
                                    status: 400,
                                    message:
                                        "Solo usuarios adoptantes pueden ser escalados a dadores",
                                    data: null,
                                },
                            },
                            noPending: {
                                summary: "Sin solicitud pendiente",
                                value: {
                                    status: 400,
                                    message: "No hay solicitud pendiente para este usuario",
                                    data: null,
                                },
                            },
                        },
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Solo administradores",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error al actualizar el rol del usuario",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // PATCH /v1/entities/giver-request/:userId/reject - Rechazar solicitud
    registry.registerPath({
        method: "patch",
        path: "/v1/entities/giver-request/{userId}/reject",
        tags: ["Giver Requests"],
        summary: "Rechazar solicitud de dador (Admin)",
        description:
            "Rechaza la solicitud de un usuario adoptante para convertirse en dador. " +
            "**Acción realizada:** El usuario mantiene su rol 20 (adoptante) sin cambios. " +
            "Los documentos de validación se eliminan del servidor Media. " +
            "Se envía un correo de notificación al usuario. " +
            "El usuario puede volver a solicitar el escalamiento en el futuro. " +
            "Solo accesible para administradores.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true,
                description: "ID del usuario cuya solicitud se va a rechazar",
                schema: { type: "string" },
            },
        ],
        responses: {
            200: {
                description: "Solicitud rechazada exitosamente",
                content: {
                    "application/json": {
                        schema: RejectGiverRequestResponseSchema,
                        example: {
                            status: 200,
                            message:
                                "Solicitud rechazada. El usuario mantiene acceso como adoptante.",
                            data: {
                                id: 15,
                                email: "usuario@example.com",
                                role: 20,
                            },
                        },
                    },
                },
            },
            400: {
                description: "Error en la solicitud - Usuario no válido o sin solicitud pendiente",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema,
                        examples: {
                            noPending: {
                                summary: "Sin solicitud pendiente",
                                value: {
                                    status: 400,
                                    message: "No hay solicitud pendiente para este usuario",
                                    data: null,
                                },
                            },
                        },
                    },
                },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Solo administradores",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno del servidor",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
