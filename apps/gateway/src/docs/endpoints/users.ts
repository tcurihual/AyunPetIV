import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import {
    AdoptionHistoryByIdResponseSchema,
    AdoptionHistoryResponseSchema,
    BaseResponseSchema,
    CreateAdoptionHistoryRequestSchema,
    CreateAdoptionHistoryResponseSchema,
    DeleteAdoptionHistoryResponseSchema,
    ErrorValuesSchema,
    UpdateAdoptionHistoryRequestSchema,
    UpdateAdoptionHistoryResponseSchema,
    UpdateUserSchema,
    UserByIdWithImagesResponseSchema,
    UserSchema,
    UsersWithImagesResponseSchema,
    UserWithImagesResponseSchema,
} from "@repo/utils"
import { z } from "zod"

export function registerUsersPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/v1/entities/users/me",
        tags: ["Users - me"],
        summary: "Listar usuario de la solicitud (obtiene el id del token)",
        description:
            "Del token enviado por el usuario, la api obtiene la id y en función de eso lista el usuario asociado a esa id",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Usuarios obtenidos exitosamente",
                content: { "application/json": { schema: UserWithImagesResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
        method: "patch",
        path: "/v1/entities/users/me",
        tags: ["Users - me"],
        summary: "Actualizar usuario de la solicitud (obtiene el id del token)",
        description:
            "Del token enviado por el usuario, la api obtiene la id y en función de eso actualiza el usuario asociado a esa id",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdateUserSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Usuario actualizado correctamente",
                content: { "application/json": { schema: UserWithImagesResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
        method: "delete",
        path: "/v1/entities/users/me",
        tags: ["Users - me"],
        summary: "Eliminar usuario de la solicitud (obtiene el id del token)",
        description:
            "Del token enviado por el usuario, la api obtiene la id y en función de eso elimina el usuario asociado a esa id",
        security: [{ bearerAuth: [] }],

        responses: {
            200: {
                description: "Usuario eliminado correctamente",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
        path: "/v1/entities/users",
        tags: ["Users"],
        summary: "Listar usuarios (admin)",
        description:
            "Obtiene un listado paginado de usuarios. Solo accesible para administradores. " +
            "Las imágenes de perfil se obtienen desde el microservicio de Media.",
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
                description: "Cantidad de usuarios por página",
                schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            },
        ],
        responses: {
            200: {
                description: "Usuarios obtenidos exitosamente",
                content: { "application/json": { schema: UsersWithImagesResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
        path: "/v1/entities/users/{id}",
        tags: ["Users"],
        summary: "Obtener usuario por ID",
        description: "Obtiene la información de un usuario específico con sus imágenes de perfil.",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del usuario",
                schema: { type: "integer", example: 7 },
            },
        ],
        responses: {
            200: {
                description: "Usuario obtenido exitosamente",
                content: { "application/json": { schema: UserByIdWithImagesResponseSchema } },
            },
            404: {
                description: "Usuario no encontrado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
            401: {
                description: "No autenticado",
                content: { "application/json": { schema: ErrorValuesSchema } },
            },
        },
    })

    registry.registerPath({
        method: "post",
        path: "/v1/entities/users",
        tags: ["Users"],
        summary: "Crear un usuario (admin)",
        description:
            "Endpoint que permite crear un usuario por parte del administrador" +
            ", el roleType puede ser: `ADMIN`, `USER`, `SHELTER`, `GIVER`",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: { type: "string" },
                                name: { type: "string" },
                                rut: { type: "string" },
                                password: { type: "string" },
                                address: { type: "string" },
                                description: { type: "string" },
                                roleType: {
                                    type: "string",
                                    enum: ["ADMIN", "USER", "SHELTER", "GIVER"],
                                },
                                validated: { type: "boolean" },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Usuario creado correctamente",
                content: { "application/json": { schema: UserWithImagesResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
        method: "put",
        path: "/v1/entities/users",
        tags: ["Users"],
        summary: "Crear un usuario (admin)",
        description: "Endpoint que permite actualizar un usuario por parte del administrador",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UserSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Usuario actualizado correctamente",
                content: { "application/json": { schema: UserWithImagesResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
        method: "delete",
        path: "/v1/entities/users",
        tags: ["Users"],
        summary: "Elimina un usuario (admin)",
        description: "Endpoint que permite eliminar un usuario por parte del administrador",
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID del usuario a eliminar",
                schema: { type: "string" },
            },
        ],
        responses: {
            200: {
                description: "Usuario eliminado correctamente",
                content: { "application/json": { schema: BaseResponseSchema } },
            },
            400: {
                description: "Error en los parámetros",
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
}
