import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    MineRequestResponseSchema,
    ErrorValuesSchema,
    ConfirmAcceptResponseSchema,
    ValidateCodeRequestSchema,
    ValidateCodeResponseSchema,
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
