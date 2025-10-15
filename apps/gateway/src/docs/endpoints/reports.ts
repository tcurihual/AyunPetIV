import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    ReportInsertSchema,
    ReportUpdateSchema,
    ReportResponseSchema,
    ErrorValuesSchema,
} from "@repo/utils"

export function registerReportsDocs(registry: OpenAPIRegistry) {
    // ============================================
    // GET /v1/reports
    // ============================================
    registry.registerPath({
        method: "get",
        path: "/v1/reports",
        tags: ["Reports"],
        summary: "Listar todos los reportes registrados",
        description:
            "Obtiene la lista completa de reportes creados por los usuarios. " +
            "Incluye información sobre el usuario denunciante, la publicación reportada y la descripción del reporte.",
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
            500: {
                description: "Error interno del servidor",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // ============================================
    // GET /v1/reports/{id}
    // ============================================
    registry.registerPath({
        method: "get",
        path: "/v1/reports/{id}",
        tags: ["Reports"],
        summary: "Obtener un reporte específico por ID",
        description:
            "Devuelve la información completa de un reporte determinado, incluyendo los datos del usuario y la publicación asociada.",
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
        },
    })

    // ============================================
    // POST /v1/reports
    // ============================================
    registry.registerPath({
        method: "post",
        path: "/v1/reports",
        tags: ["Reports"],
        summary: "Crear un nuevo reporte",
        description:
            "Permite a los usuarios crear un nuevo reporte sobre una publicación inapropiada o sospechosa. " +
            "El usuario debe estar autenticado para poder generar un reporte.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ReportInsertSchema,
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

    // ============================================
    // PUT /v1/reports/{id}
    // ============================================
    registry.registerPath({
        method: "put",
        path: "/v1/reports/{id}",
        tags: ["Reports"],
        summary: "Actualizar la descripción de un reporte existente",
        description:
            "Permite modificar la descripción de un reporte. Solo usuarios autorizados pueden realizar esta acción.",
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
                        schema: ReportUpdateSchema,
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
            404: {
                description: "Reporte no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    // ============================================
    // DELETE /v1/reports/{id}
    // ============================================
    registry.registerPath({
        method: "delete",
        path: "/v1/reports/{id}",
        tags: ["Reports"],
        summary: "Eliminar un reporte existente",
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
