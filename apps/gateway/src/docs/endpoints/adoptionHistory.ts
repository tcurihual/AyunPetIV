import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    AdoptionHistoryByIdResponseSchema,
    AdoptionHistoryResponseSchema,
    CreateAdoptionHistoryRequestSchema,
    CreateAdoptionHistoryResponseSchema,
    DeleteAdoptionHistoryResponseSchema,
    ErrorValuesSchema,
    UpdateAdoptionHistoryRequestSchema,
    UpdateAdoptionHistoryResponseSchema,
} from "@repo/utils"
import { z } from "zod"

export function registerAdoptionHistoryPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-history",
        tags: ["AdoptionHistory"],
        summary: "Listar historiales de adopción",
        description:
            "Obtiene un listado paginado de historiales de adopción. Requiere autenticación.",
        security: [{ bearerAuth: [] }],
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
                description: "Cantidad de historiales por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
        responses: {
            200: {
                description: "Historial de adopciones obtenido exitosamente",
                content: { "application/json": { schema: AdoptionHistoryResponseSchema } },
            },
            400: {
                description: "Error al obtener el historial de adopciones",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "get",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["AdoptionHistory"],
        summary: "Obtener historial de adopción por ID",
        description:
            "Retorna el historial de adopción de una mascota específica usando su ID. Requiere autenticación.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico del historial de adopción",
                schema: { type: "integer", example: 42 },
            },
        ],
        responses: {
            200: {
                description: "Historial de adopción obtenido exitosamente",
                content: { "application/json": { schema: AdoptionHistoryByIdResponseSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Historial no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno del servidor",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/entities/adoption-history",
        tags: ["AdoptionHistory"],
        summary: "Crear nuevo historial de adopción",
        description:
            "Crea un nuevo historial de adopción asociado a una mascota y registro de la fecha/usuario.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: { "application/json": { schema: CreateAdoptionHistoryRequestSchema } },
            },
        },
        responses: {
            201: {
                description: "Historial creado exitosamente",
                content: { "application/json": { schema: CreateAdoptionHistoryResponseSchema } },
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
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "put",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["AdoptionHistory"],
        summary: "Actualizar historial de adopción",
        description:
            "Actualiza los datos de un historial de adopción existente identificado por su ID.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del historial a actualizar",
                schema: { type: "integer" },
            },
        ],
        request: {
            body: {
                content: { "application/json": { schema: UpdateAdoptionHistoryRequestSchema } },
            },
        },
        responses: {
            200: {
                description: "Historial actualizado exitosamente",
                content: { "application/json": { schema: UpdateAdoptionHistoryResponseSchema } },
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
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "No encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "delete",
        path: "/v1/entities/adoption-history/{id}",
        tags: ["AdoptionHistory"],
        summary: "Eliminar historial de adopción",
        description:
            "Elimina un historial de adopción por su ID. Operación restringida a usuarios autorizados.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del historial a eliminar",
                schema: { type: "integer" },
            },
        ],
        responses: {
            200: {
                description: "Historial eliminado exitosamente",
                content: { "application/json": { schema: DeleteAdoptionHistoryResponseSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            403: {
                description: "No autorizado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "No encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
