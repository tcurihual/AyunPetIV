import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registerAuthPaths } from "./endpoints/auth"
import { mineRequestDocs, ConfirmAcceptDocs, validateCodeDocs } from "./endpoints/adoptions"
import { giverRequestDocs, adoptionHistory } from "./endpoints/entities"

export function buildOpenApi() {
    const registry = new OpenAPIRegistry()

    // Registrar esquemas de seguridad
    registry.registerComponent("securitySchemes", "bearerAuth", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
    })

    registerAuthPaths(registry)

    mineRequestDocs(registry)
    ConfirmAcceptDocs(registry)
    validateCodeDocs(registry)

    giverRequestDocs(registry)
    adoptionHistory(registry)

    const generator = new OpenApiGeneratorV3(registry.definitions)

    return generator.generateDocument({
        openapi: "3.0.3",
        info: { 
            title: "Ayün Pet API Gateway", 
            version: "1.0.0",
            description: "API Gateway para el sistema Ayün Pet - Plataforma de adopción de mascotas"
        },
        servers: [{ url: "/" }],
    })
}
