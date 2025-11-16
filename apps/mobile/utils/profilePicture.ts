import { toMediaUrl } from "./mediaUrl"

/**
 * Obtiene la URL de la foto de perfil de un usuario
 * @param userId - ID del usuario
 * @param fileName - Nombre del archivo (opcional, se puede obtener del servidor)
 * @returns URL completa de la foto de perfil o null si no tiene
 */
export function getProfilePictureUrl(userId?: string | number, fileName?: string): string | null {
    if (!userId) {
        return null
    }

    // Si no se proporciona el nombre del archivo, intentamos obtener la primera imagen
    // Esto será manejado por el backend que retornará las URLs
    if (fileName) {
        return toMediaUrl(`/uploads/profile_picture/${userId}/${fileName}`)
    }

    // Si solo tenemos el userId, retornamos el path base
    // El componente debería obtener la lista de archivos del servidor
    return toMediaUrl(`/uploads/profile_picture/${userId}`)
}

/**
 * Verifica si el usuario tiene una foto de perfil personalizada
 * @param avatarUrl - URL del avatar del usuario
 * @returns true si tiene foto personalizada, false si es la por defecto o randomuser
 */
export function hasCustomProfilePicture(avatarUrl?: string): boolean {
    if (!avatarUrl) return false
    return !avatarUrl.includes("randomuser.me") && !avatarUrl.includes("pp_placeholder")
}

/**
 * Obtiene el source para Image component
 * Retorna un objeto con uri o un require local para el placeholder
 * @param profileUrl - URL de la foto de perfil del servidor
 * @param contextAvatar - Avatar del contexto del usuario
 * @returns ImageSourcePropType para usar en <Image source={...} />
 */
export function getProfileImageSource(profileUrl?: string | null, contextAvatar?: string) {
    // Si hay foto de perfil del servidor, usar esa
    if (profileUrl) {
        return { uri: profileUrl }
    }
    // Si hay avatar en el contexto y no es la URL de randomuser, usar esa
    if (contextAvatar && !contextAvatar.includes("randomuser.me")) {
        return { uri: contextAvatar }
    }
    // Sino, usar el placeholder local
    return require("@images/pp_placeholder.png")
}
