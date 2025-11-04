import { http } from "./http"

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
    rut: string
    phone?: string
    address?: string
    description?: string
}

export interface AuthResponse {
    type: string
    message: string
    data: {
        token: string
        user: {
            id: number
            name: string
            email: string
            role: number
            rut: string
            validated: boolean
            address?: string
            description?: string
        }
    }
}

export interface RegisterResponse {
    type: string
    message: string
    data: Record<string, never>
}

export interface CheckUserExistsRequest {
    email?: string
    rut?: string
}

export interface CheckUserExistsResponse {
    type: string
    message: string
    data: {
        available: boolean
    }
}

/**
 * Servicio de autenticación para comunicarse con la API
 */
export const authService = {
    /**
     * Inicia sesión con email y contraseña
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await http.post<AuthResponse>("/v1/auth/login", credentials)
        return response.data
    },

    /**
     * Registra un nuevo usuario adoptante
     * @param data - Datos del usuario a registrar
     * @param variation - Tipo de usuario: "user" (adoptante), "giver" (dador), "shelter" (refugio)
     */
    register: async (
        data: RegisterData,
        variation: "user" | "giver" | "shelter" = "user"
    ): Promise<RegisterResponse> => {
        // La API espera estos campos según RegisterSchema
        const payload = {
            name: data.name,
            email: data.email,
            password: data.password,
            rut: data.rut,
            role: 0, // Se sobrescribe en el backend según variation
            address: data.address || "",
            description: data.description || "",
        }
        const response = await http.post<RegisterResponse>(
            `/v1/auth/register/${variation}`,
            payload,
            {
                headers: {
                    "x-platform": "mobile",
                },
            }
        )

        return response.data
    },

    /**
     * Verifica si un email o RUT ya existe en la base de datos
     * @param data - Objeto con email y/o rut a verificar
     * @returns Promise<boolean> - true si está disponible, false si ya existe
     */
    checkUserExists: async (data: CheckUserExistsRequest): Promise<boolean> => {
        try {
            const response = await http.post<CheckUserExistsResponse>(
                "/v1/auth/check-user-exists",
                data
            )
            return response.data.data.available
        } catch (error: any) {
            // Si retorna 409, significa que el email/rut ya existe
            if (error?.response?.status === 409) {
                return false
            }
            // Si hay otro error, lo lanzamos
            throw error
        }
    },
}
