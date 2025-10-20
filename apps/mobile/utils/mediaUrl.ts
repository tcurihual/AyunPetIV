import { Platform } from "react-native"

/**
 * Convierte una URL relativa o absoluta de Media a una URL completa
 * que pasa a través del API Gateway.
 *
 * @param relativeOrAbsolute - URL relativa (ej: "/uploads/pet/123/foto.jpg") o absoluta
 * @returns URL completa que apunta al API Gateway
 *
 * @example
 * toMediaUrl("/uploads/pet/123/foto.jpg")
 * // → "http://10.0.2.2:3000/v1/media/uploads/pet/123/foto.jpg"
 */
export function toMediaUrl(relativeOrAbsolute?: string): string {
    if (!relativeOrAbsolute) return ""

    // Si ya es una URL completa (http/https), devolverla tal cual
    if (/^https?:\/\//i.test(relativeOrAbsolute)) {
        // Si la URL absoluta contiene "/uploads/" preferimos reescribirla
        // hacia el API Gateway para que sea accesible desde el dispositivo móvil.
        const uploadsIndex = relativeOrAbsolute.indexOf("/uploads/")
        if (uploadsIndex !== -1) {
            const rel = relativeOrAbsolute.substring(uploadsIndex)
            // Reusar la lógica de path relativo abajo
            const gatewayBase =
                (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_GATEWAY?.trim()) ||
                (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000")

            const cleanBase = gatewayBase.replace(/\/+$/, "")
            const cleanPath = rel.replace(/^\/+/, "")

            if (cleanPath.startsWith("uploads/")) {
                return `${cleanBase}/v1/media/${cleanPath}`
            }
            return `${cleanBase}/v1/media/uploads/${cleanPath}`
        }

        return relativeOrAbsolute
    }

    // Obtener la base URL del API Gateway desde variable de entorno o usar fallback
    const gatewayBase =
        (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_GATEWAY?.trim()) ||
        (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000")

    // Limpiar las barras para evitar duplicados
    const cleanBase = gatewayBase.replace(/\/+$/, "")
    const cleanPath = relativeOrAbsolute.replace(/^\/+/, "")

    // Construir la URL completa a través del gateway
    // Si la ruta ya incluye /uploads, agregar solo /v1/media
    // Si no, agregar /v1/media/uploads
    if (cleanPath.startsWith("uploads/")) {
        return `${cleanBase}/v1/media/${cleanPath}`
    } else {
        return `${cleanBase}/v1/media/uploads/${cleanPath}`
    }
}
