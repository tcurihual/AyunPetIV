import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    GiverRequestResponseSchema,
    ErrorValuesSchema,
    AdoptionHistoryResponseSchema,
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
