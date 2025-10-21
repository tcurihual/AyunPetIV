import { http } from "./http"

/**
 * Servicio para gestionar la recuperación de contraseña mediante códigos de 6 dígitos
 * Diseñado específicamente para la aplicación móvil
 */

export interface PasswordResetRequest {
    email: string
}

export interface PasswordResetResponse {
    type: "success" | "error"
    message: string
    data?: any
}

export interface PasswordVerifyRequest {
    email: string
    code: string
    newPassword: string
}

export interface PasswordVerifyResponse {
    type: "success" | "error"
    message: string
    data?: any
}

/**
 * Solicita un código de recuperación de 6 dígitos para el email proporcionado
 * @param email - Email del usuario
 * @returns Promise con la respuesta del servidor
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
        const response = await http.post(
            "/v1/auth/mobile/reset-password",
            { email: email.toLowerCase().trim() },
            { headers: { "x-platform": "mobile" } }
        )

        return {
            type: "success",
            message: response.data.message || "Código de recuperación enviado",
            data: response.data.data,
        }
    } catch (error: any) {
        console.error("❌ Error al solicitar código de recuperación:", error)

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error al solicitar el código de recuperación"

        return {
            type: "error",
            message: errorMessage,
            data: null,
        }
    }
}

/**
 * Verifica el código de 6 dígitos y cambia la contraseña
 * @param email - Email del usuario
 * @param code - Código de 6 dígitos
 * @param newPassword - Nueva contraseña
 * @returns Promise con la respuesta del servidor
 */
export async function verifyResetCode(
    email: string,
    code: string,
    newPassword: string
): Promise<PasswordVerifyResponse> {
    try {
        // Validaciones básicas
        if (!email || !code || !newPassword) {
            return {
                type: "error",
                message: "Todos los campos son requeridos",
                data: null,
            }
        }

        // Normalizar code (quitar espacios) antes de validar
        const normalizedCode = code.replace(/\s/g, "")

        if (normalizedCode.length !== 6 || !/^\d{6}$/.test(normalizedCode)) {
            return {
                type: "error",
                message: "El código debe ser de 6 dígitos numéricos",
                data: null,
            }
        }

        if (newPassword.length < 6) {
            return {
                type: "error",
                message: "La contraseña debe tener al menos 6 caracteres",
                data: null,
            }
        }

        const response = await http.post(
            "/v1/auth/mobile/verify-reset-code",
            {
                email: email.toLowerCase().trim(),
                code: normalizedCode,
                newPassword: newPassword,
            },
            { headers: { "x-platform": "mobile" } }
        )

        return {
            type: "success",
            message: response.data.message || "Contraseña cambiada correctamente",
            data: response.data.data,
        }
    } catch (error: any) {
        console.error("❌ Error al verificar código:", error)

        let errorMessage = "Error al verificar el código"

        if (error.response?.status === 400) {
            errorMessage = error.response.data?.message || "Código incorrecto"
        } else if (error.response?.status === 401) {
            errorMessage = "El código ha expirado. Solicita uno nuevo"
        } else if (error.response?.status === 404) {
            errorMessage = "Código no encontrado o ya utilizado"
        } else {
            errorMessage =
                error.response?.data?.message || error.message || "Error al verificar el código"
        }

        return {
            type: "error",
            message: errorMessage,
            data: null,
        }
    }
}

/**
 * Valida si un código tiene el formato correcto (6 dígitos numéricos)
 * @param code - Código a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidCode(code: string): boolean {
    return code.length === 6 && /^\d{6}$/.test(code)
}

/**
 * Valida si un email tiene un formato básico correcto
 * @param email - Email a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Formatea el código agregando espacios para mejor visualización
 * Ejemplo: "123456" -> "123 456"
 * @param code - Código a formatear
 * @returns Código formateado
 */
export function formatCode(code: string): string {
    const onlyDigits = (code || "").replace(/\D/g, "").slice(0, 6)
    if (onlyDigits.length <= 3) return onlyDigits
    return `${onlyDigits.slice(0, 3)} ${onlyDigits.slice(3)}`
}

// Hook personalizado para gestionar el estado de recuperación de contraseña
export interface UsePasswordResetState {
    isLoading: boolean
    error: string | null
    success: boolean
    step: "email" | "code" | "completed"
}

export const passwordResetService = {
    requestPasswordReset,
    verifyResetCode,
    isValidCode,
    isValidEmail,
    formatCode,
}
