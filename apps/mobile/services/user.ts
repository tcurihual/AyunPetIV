import { http } from "./http"

export const userService = {
    deleteMe: async (): Promise<any> => {
        const response = await http.delete(`/v1/entities/users/me`)
        return response.data
    },
}
