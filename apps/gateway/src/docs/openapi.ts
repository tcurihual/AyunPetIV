import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registerAuthPaths } from "./endpoints/auth"
import {
    mineRequestDocs,
    ConfirmAcceptDocs,
    validateCodeDocs,
    listPublicationsDocs,
    getPublicationByIdDocs,
    mineRequestWithImagesDocs,
} from "./endpoints/adoptions"
import {
    giverRequestDocs,
    adoptionHistory,
    validateGiverAccountDocs,
    getAdoptionHistoryByIdDocs,
    createAdoptionHistoryDocs,
    updateAdoptionHistoryDocs,
    deleteAdoptionHistoryDocs,
    getUsersDocs,
    getUserByIdDocs,
    getAdoptionRequestsDocs,
    getAdoptionRequestByIdDocs,
} from "./endpoints/entities"
import {
    createVerificationCodeDocs,
    validateVerificationCodeDocs,
    getUserVerificationCodesDocs,
} from "./endpoints/verificationCodes"

import {
    listFormResponsesDocs,
    createFormResponseDocs,
    updateFormResponseDocs,
    deleteFormResponseDocs,
    listByPublicationFormResponsesDocs,
} from "./endpoints/formResponses"

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
    mineRequestDocs(registry)
    ConfirmAcceptDocs(registry)
    validateCodeDocs(registry)

    // Adoptions endpoints con imágenes (comunicación entre microservicios)
    listPublicationsDocs(registry)
    getPublicationByIdDocs(registry)
    mineRequestWithImagesDocs(registry)

    // Entities endpoints
    giverRequestDocs(registry)
    validateGiverAccountDocs(registry)
    adoptionHistory(registry)
    getAdoptionHistoryByIdDocs(registry)
    createAdoptionHistoryDocs(registry)
    updateAdoptionHistoryDocs(registry)
    deleteAdoptionHistoryDocs(registry)

    // Entities endpoints con imágenes (comunicación entre microservicios)
    getUsersDocs(registry)
    getUserByIdDocs(registry)
    getAdoptionRequestsDocs(registry)
    getAdoptionRequestByIdDocs(registry)

    // Verification Codes endpoints
    createVerificationCodeDocs(registry)
    validateVerificationCodeDocs(registry)
    getUserVerificationCodesDocs(registry)

    // Form Responses endpoints
    listFormResponsesDocs(registry)
    createFormResponseDocs(registry)
    updateFormResponseDocs(registry)
    deleteFormResponseDocs(registry)
    listByPublicationFormResponsesDocs(registry)

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
