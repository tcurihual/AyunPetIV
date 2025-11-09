import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registerAuthPaths } from "./endpoints/auth"
import {
    ConfirmAcceptDocs,
    validateCodeDocs,
    mineRequestWithImagesDocs,
    registerAdoptionRequestDocs,
} from "./endpoints/adoptions"
import { registerAllEntitiesDocs } from "./endpoints/entities"

import { registerReportsDocs } from "./endpoints/reports"
import { registerMessagesDocs } from "./endpoints/messages"
import { PublicationRegistryPaths } from "./endpoints/publications"
import { registerPostFormDocs } from "./endpoints/postForm"
import { NewsRegistryPaths } from "./endpoints/news"

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
    mineRequestWithImagesDocs(registry)
    registerAdoptionRequestDocs(registry)

    // Entities
    registerAllEntitiesDocs(registry)

    // Reports endpoints
    registerReportsDocs(registry)

    // Messages endpoints
    registerMessagesDocs(registry)

    registerPostFormDocs(registry)
    // Saved Posts y Public Posts
    // savedPostsDocs(registry)
    // postsDocs(registry)

    // Publications
    PublicationRegistryPaths(registry)
    NewsRegistryPaths(registry)

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
