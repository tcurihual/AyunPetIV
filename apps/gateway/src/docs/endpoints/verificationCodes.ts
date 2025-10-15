import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { ErrorValuesSchema } from "@repo/utils"

// ===== VERIFICATION CODE ENDPOINTS =====

export function createVerificationCodeDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/entities/verification-codes",
        tags: ["Entities", "Verification Codes"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["verify", "reset", "adoption"],
                                    description: "Tipo de código de verificación"
                                },
                                userId: {
                                    type: "number",
                                    description: "ID del usuario (opcional, usa el del token si no se proporciona)"
                                },
                                duration: {
                                    type: "number",
                                    minimum: 1,
                                    maximum: 1440,
                                    description: "Duración personalizada en minutos (opcional)"
                                }
                            },
                            required: ["type"],
                            example: {
                                type: "verify",
                                duration: 30
                            }
                        }
                    }
                }
            }
        },
        responses: {
            201: {
                description: "Código de verificación creado exitosamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                type: { type: "string", enum: ["success"] },
                                message: { type: "string" },
                                data: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        code: { type: "string", description: "Código de 6 dígitos (solo para desarrollo)" },
                                        type: { type: "string", enum: ["verify", "reset", "adoption"] },
                                        expires_at: { type: "string", format: "date-time" },
                                        user_id: { type: "number" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            400: {
                description: "Datos inválidos",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            401: {
                description: "No autorizado - Token requerido",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            404: {
                description: "Usuario no encontrado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            }
        }
    })
}

export function validateVerificationCodeDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/v1/entities/verification-codes/validate",
        tags: ["Entities", "Verification Codes"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                code: {
                                    type: "string",
                                    pattern: "^\\d{6}$",
                                    description: "Código de verificación de 6 dígitos"
                                },
                                type: {
                                    type: "string",
                                    enum: ["verify", "reset", "adoption"],
                                    description: "Tipo de código de verificación"
                                },
                                userId: {
                                    type: "number",
                                    description: "ID del usuario al que pertenece el código"
                                }
                            },
                            required: ["code", "type", "userId"],
                            example: {
                                code: "123456",
                                type: "verify",
                                userId: 1
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Código validado exitosamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                type: { type: "string", enum: ["success"] },
                                message: { type: "string" },
                                data: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        type: { type: "string", enum: ["verify", "reset", "adoption"] },
                                        user_id: { type: "number" },
                                        validated_at: { type: "string", format: "date-time" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            400: {
                description: "Código inválido o expirado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            404: {
                description: "Código no encontrado",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            }
        }
    })
}

export function getUserVerificationCodesDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/verification-codes/user/{userId}",
        tags: ["Entities", "Verification Codes"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                    pattern: "^\\d+$"
                },
                description: "ID del usuario"
            }
        ],
        responses: {
            200: {
                description: "Códigos de verificación obtenidos exitosamente",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                type: { type: "string", enum: ["success"] },
                                message: { type: "string" },
                                data: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "number" },
                                            type: { type: "string", enum: ["verify", "reset", "adoption"] },
                                            used: { type: "boolean" },
                                            created_at: { type: "string", format: "date-time" },
                                            expires_at: { type: "string", format: "date-time" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            401: {
                description: "No autorizado - Token requerido",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            403: {
                description: "Sin permisos para ver estos códigos",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            },
            500: {
                description: "Error interno del servidor",
                content: {
                    "application/json": {
                        schema: ErrorValuesSchema
                    }
                }
            }
        }
    })
}