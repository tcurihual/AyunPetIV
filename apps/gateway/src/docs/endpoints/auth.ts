import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    loginSchema,
    loginResponseSchema,
    registerSchema,
    baseResponseSchema,
    errorValuesSchema,
} from "@repo/utils"

export function registerAuthPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/auth/login",
        tags: ["Auth"],
        request: {
            body: {
                content: { "application/json": { schema: loginSchema } },
            },
        },
        responses: {
            200: {
                description: "Inicio de sesión exitoso",
                content: { "application/json": { schema: loginResponseSchema } },
            },
            401: {
                description: "Credenciales inválidas",
                content: { "application/json": { schema: errorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/auth/register",
        tags: ["Auth"],
        request: {
            body: {
                content: { "application/json": { schema: registerSchema } },
            },
        },
        responses: {
            200: {
                description: "Creación de cuenta exitosa",
                content: { "application/json": { schema: baseResponseSchema } },
            },
            401: {
                description: "Error al crear cuenta",
                content: { "application/json": { schema: errorValuesSchema } },
            },
        },
    })
}
