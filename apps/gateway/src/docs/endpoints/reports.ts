import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { ReportResponseSchema, ErrorValuesSchema, ReportFormSchema } from "@repo/utils"

export function registerReportsDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/adoptions/reports",
        tags: ["Reports"],
        summary: "Listar todos los reportes registrados (Admin)",
        description:
            "Obtiene la lista completa de reportes creados por los usuarios. " +
            "Incluye información sobre el usuario denunciante, la publicación reportada y la descripción del reporte. " +
            "Requiere permisos de Administrador.",
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
                description: "Cantidad de reportes por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Lista de reportes obtenida correctamente",
                content: {
                    "application/json": {
                        schema: ReportResponseSchema,
                    },
                },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Requiere rol de Administrador",
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
        path: "/v1/adoptions/reports/{id}",
        tags: ["Reports"],
        summary: "Obtener un reporte específico por ID (Admin)",
        description:
            "Devuelve la información completa de un reporte determinado, incluyendo los datos del usuario y la publicación asociada. " +
            "Requiere permisos de Administrador.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico del reporte a consultar",
                schema: { type: "integer", example: 15 },
            },
        ],
        responses: {
            200: {
                description: "Reporte obtenido correctamente",
                content: {
                    "application/json": {
                        schema: ReportResponseSchema,
                    },
                },
            },
            404: {
                description: "Reporte no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Requiere rol de Administrador",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/adoptions/reports",
        tags: ["Reports"],
        summary: "Crear un nuevo reporte",
        description:
            "Permite a los usuarios crear un nuevo reporte sobre una publicación o comentario inapropiado o sospechoso. " +
            "El usuario debe estar autenticado para poder generar un reporte. " +
            "Debe proporcionar `postId` para reportar una publicación O `messageId` para reportar un comentario, pero no ambos.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ReportFormSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Reporte creado exitosamente",
                content: {
                    "application/json": {
                        schema: ReportResponseSchema,
                    },
                },
            },
            400: {
                description: "Error en los datos del reporte",
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
        path: "/v1/adoptions/reports/{id}",
        tags: ["Reports"],
        summary: "Actualizar la descripción de un reporte existente (Admin)",
        description:
            "Permite modificar la descripción de un reporte. Solo usuarios autorizados (Admin) pueden realizar esta acción.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del reporte a actualizar",
                schema: { type: "integer", example: 15 },
            },
        ],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ReportFormSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Reporte actualizado correctamente",
                content: {
                    "application/json": {
                        schema: ReportResponseSchema,
                    },
                },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado - Requiere rol de Administrador",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Reporte no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/adoptions/reports/{id}",
        tags: ["Reports"],
        summary: "Eliminar un reporte existente (Admin)",
        description:
            "Elimina un reporte determinado por su ID. Solo administradores tienen permisos para eliminar reportes.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del reporte a eliminar",
                schema: { type: "integer", example: 15 },
            },
        ],
        responses: {
            200: { description: "Reporte eliminado correctamente" },
            403: {
                description: "No autorizado - Requiere rol de Administrador",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Reporte no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado - Token JWT requerido",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
