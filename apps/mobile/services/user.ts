import { http, FileInfo } from "./http"

export const userService = {
    deleteMe: async (): Promise<any> => {
        const response = await http.delete(`/v1/entities/users/me`)
        return response.data
    },

    /**
     * Enviar solicitud para convertirse en dador
     * Usuario normal (rol 20) envía documentos para solicitar ser dador
     */
    submitGiverRequest: async (documents: FileInfo[]) => {
        const formData = new FormData()

        // Agregar cada documento al FormData
        documents.forEach((doc) => {
            formData.append("documents", {
                uri: doc.uri,
                name: doc.name,
                type: doc.type,
            } as any)
        })

        const response = await http.post("/v1/entities/giver-request/submit", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    },
}
