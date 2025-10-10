import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registerAuthPaths } from "./endpoints/auth"

export function buildOpenApi() {
    const registry = new OpenAPIRegistry()

    // Registrar esquemas de seguridad
    registry.registerComponent("securitySchemes", "bearerAuth", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
    })

    registerAuthPaths(registry)

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
