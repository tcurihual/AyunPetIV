import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    LoginSchema,
    LoginResponseSchema,
    RegisterSchema,
    BaseResponseSchema,
    ErrorValuesSchema,
} from "@repo/utils"

export function registerAuthPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/auth/login",
        tags: ["Auth"],
        request: {
            body: {
                content: { "application/json": { schema: LoginSchema } },
            },
        },
        responses: {
            200: {
                description: "Inicio de sesión exitoso",
                content: { "application/json": { schema: LoginResponseSchema } },
            },
            404: {
                description: "Usuario no existe",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "Credenciales inválidas",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/auth/register",
        tags: ["Auth"],
        request: {
            body: {
                content: { "application/json": { schema: RegisterSchema } },
            },
        },
        responses: {
            201: {
                description: "Creación de cuenta exitosa",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            409: {
                description: "Conflicto de crendeciales",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
