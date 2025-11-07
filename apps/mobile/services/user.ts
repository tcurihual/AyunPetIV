import { http } from "./http"

export const userService = {
    deleteMe: async (): Promise<any> => {
        const response = await http.delete(`/v1/entities/users/me`)
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
}
