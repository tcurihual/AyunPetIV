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
        summary: "Iniciar sesión en la plataforma",
        description:
            "Permite que un usuario inicie sesión proporcionando su correo electrónico y contraseña. " +
            "Si las credenciales son válidas, devuelve un token JWT y los datos básicos del usuario autenticado.",
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
                description: "El usuario no existe",
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
        path: "/v1/auth/register/{variation}",
        tags: ["Auth"],
        summary: "Registrar un nuevo usuario en la plataforma",
        description:
            "Crea un nuevo usuario con base en la variación indicada (`user`, `giver` o `shelter`). " +
            "Durante el registro, si el usuario es de tipo normal (`user`), se enviará un correo de verificación " +
            "con un token único para validar su dirección de correo electrónico.",
        parameters: [
            {
                name: "variation",
                in: "path",
                required: true,
                description: "Tipo de usuario a registrar (`user`, `giver`, `shelter`)",
                schema: { type: "string", example: "user" },
            },
        ],
        request: {
            body: {
                content: { "application/json": { schema: RegisterSchema } },
            },
        },
        responses: {
            201: {
                description: "Usuario creado exitosamente — correo de verificación enviado",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            409: {
                description: "El correo o RUT ya están registrados",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error interno al registrar el usuario",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/auth/verify-email",
        tags: ["Auth"],
        summary: "Verificar correo electrónico del usuario",
        description:
            "Endpoint utilizado por el frontend tras hacer clic en el enlace de verificación enviado por correo. " +
            "Recibe un token generado durante el registro, lo valida y actualiza el campo `validated` del usuario a `true`.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                token: {
                                    type: "string",
                                    description:
                                        "Token único recibido desde el correo de verificación",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                },
                            },
                            required: ["token"],
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Correo verificado correctamente",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            400: {
                description: "Token inválido o expirado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            404: {
                description: "Usuario no encontrado para este token",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/auth/forgot-password",
        tags: ["Auth"],
        summary: "Solicitar recuperación de contraseña",
        description:
            "Recibe una dirección de correo electrónico registrada en la plataforma y envía un correo con un enlace " +
            "que contiene un token único con validez de 30 minutos para restablecer la contraseña.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: {
                                    type: "string",
                                    format: "email",
                                    example: "usuario@ejemplo.com",
                                },
                            },
                            required: ["email"],
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Correo de recuperación enviado correctamente",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            404: {
                description: "Correo no asociado a ningún usuario",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error al enviar el correo de recuperación",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/auth/reset-password",
        tags: ["Auth"],
        summary: "Restablecer contraseña mediante token",
        description:
            "Permite al usuario establecer una nueva contraseña utilizando el token recibido en el correo de recuperación. " +
            "El token es validado y, si es correcto, la contraseña se actualiza en la base de datos con el hash correspondiente.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                token: {
                                    type: "string",
                                    description: "Token único enviado por correo",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                },
                                password: {
                                    type: "string",
                                    description: "Nueva contraseña segura del usuario",
                                    example: "Nuev@Contr4seña123!",
                                },
                            },
                            required: ["token", "password"],
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Contraseña restablecida correctamente",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            400: {
                description: "Token inválido o expirado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            500: {
                description: "Error al actualizar la contraseña",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })
}
