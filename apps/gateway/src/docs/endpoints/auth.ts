import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    LoginSchema,
    LoginResponseSchema,
    UserRegisterSchema,
    BaseResponseSchema,
    ErrorValuesSchema,
    GiverRegisterSchema,
    VerifyEmailRequestSchema,
    ForgotPasswordRequestSchema,
    ResetPasswordRequestSchema,
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
        path: "/v1/auth/register/user",
        tags: ["Auth"],
        summary: "Registrar un nuevo usuario adoptante en la plataforma",
        description:
            "Crea un nuevo usuario adoptante, durante el registro," +
            ", se enviará un correo de verificación " +
            "con un token único para validar su dirección de correo electrónico.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UserRegisterSchema,
                        examples: {
                            sinDocuments: {
                                summary: "Registro con valores obligatorios",
                                value: {
                                    name: "Julio",
                                    email: "julio@acme.com",
                                    password: "********",
                                    rut: "12.345.678-9",
                                },
                            },
                            conDocuments: {
                                summary: "Registro con valores opcionales",
                                value: {
                                    name: "Julio",
                                    email: "julio@acme.com",
                                    password: "********",
                                    rut: "12.345.678-9",
                                    description: "Julio el bakan",
                                    address: "Av. Siempre Viva 742",
                                },
                            },
                        },
                    },
                },
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
        path: "/v1/auth/register/{variation}",
        tags: ["Auth"],
        summary: "Registrar un nuevo usuario dador de adopción en la plataforma",
        description:
            "Crea un nuevo usuario con base en la variación indicada (`giver` o `shelter`). " +
            "Este tipo de usuario debe ser validado por un `administrador`",
        parameters: [
            {
                name: "variation",
                in: "path",
                required: true,
                description: "Tipo de usuario a registrar ( `giver`, `shelter`)",
                schema: { type: "string", example: "user" },
            },
        ],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: GiverRegisterSchema,
                        examples: {
                            sinDocuments: {
                                summary: "Registro con valores obligatorios",
                                value: {
                                    name: "Patitas Sucias",
                                    email: "patsu@acme.com",
                                    password: "********",
                                    rut: "12.345.678-9",
                                    documents: ["doc_123", "doc_456"],
                                },
                            },
                            conDocuments: {
                                summary: "Registro con valores opcionales",
                                value: {
                                    name: "Patitas Sucias",
                                    email: "patsu@acme.com",
                                    password: "********",
                                    rut: "12.345.678-9",
                                    description: "Fundación Patitas Sucias",
                                    address: "Av. Siempre Viva 742",
                                    documents: ["doc_123", "doc_456"],
                                },
                            },
                        },
                    },
                },
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
                        schema: VerifyEmailRequestSchema,
                        example: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
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
            "Recibe un email registrado y envía un enlace con un token válido por 30 minutos para restablecer contraseña.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ForgotPasswordRequestSchema,
                        example: {
                            email: "usuario@ejemplo.com",
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
            "Permite al usuario establecer una nueva contraseña usando el token recibido por correo.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ResetPasswordRequestSchema,
                        example: {
                            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            password: "*********",
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
