import { http, FileInfo } from "./http"

export interface UpdateProfileData {
    name?: string
    address?: string
    description?: string
}

export const userService = {
    deleteMe: async (): Promise<any> => {
        const response = await http.delete(`/v1/entities/users/me`)
        return response.data
    },

    /**
     * Actualiza el perfil del usuario actual
     * @param data - Datos del perfil a actualizar (name, address, description)
     * @returns Usuario actualizado
     */
    updateProfile: async (data: UpdateProfileData): Promise<any> => {
        const response = await http.patch(`/v1/entities/users/me`, data)
        return response.data
    },

    /**
     * Obtiene la URL de la foto de perfil del usuario
     * @param userId - ID del usuario
     * @returns URL de la foto de perfil o null si no tiene
     */
    getProfilePicture: async (userId: string | number): Promise<string | null> => {
        try {
            const response = await http.get(`/v1/media/uploads/profile_picture/${userId}`)
            const urls = response.data?.data as string[]

            // Retornar la primera imagen encontrada
            if (urls && urls.length > 0) {
                return urls[0]
            }

            return null
        } catch (error) {
            console.log(`No profile picture found for user ${userId}`)
            return null
        }
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
