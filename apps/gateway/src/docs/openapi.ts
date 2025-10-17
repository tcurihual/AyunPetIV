import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registerAuthPaths } from "./endpoints/auth"
import {
    ConfirmAcceptDocs,
    validateCodeDocs,
    listPublicationsDocs,
    getPublicationByIdDocs,
    mineRequestWithImagesDocs,
} from "./endpoints/adoptions"
import { registerAllEntitiesDocs } from "./endpoints/entities"

import { registerReportsDocs } from "./endpoints/reports"
import { registerMessagesDocs } from "./endpoints/messages"
import { savedPostsDocs } from "./endpoints/savedPosts"

export function buildOpenApi() {
    const registry = new OpenAPIRegistry()

    // Registrar esquemas de seguridad
    registry.registerComponent("securitySchemes", "bearerAuth", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
    })

    registerAuthPaths(registry)

    // Adoptions endpoints
    ConfirmAcceptDocs(registry)
    validateCodeDocs(registry)

    // Adoptions endpoints con imágenes (comunicación entre microservicios)
    listPublicationsDocs(registry)
    getPublicationByIdDocs(registry)
    mineRequestWithImagesDocs(registry)

    // Entities
    registerAllEntitiesDocs(registry)

    // Reports endpoints
    registerReportsDocs(registry)

    // Messages endpoints
    registerMessagesDocs(registry)

    savedPostsDocs(registry)

    const generator = new OpenApiGeneratorV3(registry.definitions)

    return generator.generateDocument({
        openapi: "3.0.3",
        info: {
            title: "Ayün Pet API Gateway",
            version: "1.0.0",
            description:
                "API Gateway para el sistema Ayün Pet - Plataforma de adopción de mascotas",
        },
        servers: [{ url: "/" }],
    })
}
