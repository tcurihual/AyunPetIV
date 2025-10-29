import { http } from "@/services/http"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import * as FileSystem from "expo-file-system"
import { toMediaUrl } from "@/utils/mediaUrl"

export type UploadedFile = {
    url: string
    fileName: string
    size: number
    mime: string
}

type PostFilesResponse = { message: string; data: UploadedFile[] }
type GetFilesResponse = { message: string; data: string[] }

export function getFileUrl(relativeOrAbsolute: string): string {
    return toMediaUrl(relativeOrAbsolute)
}

/** Sube múltiples imágenes (campo "files") al microservicio Media a través del gateway */
export async function uploadMedia(
    entityType: string,
    entityId: string | number,
    assets: ImagePicker.ImagePickerAsset[]
): Promise<UploadedFile[]> {
    // Comprimir cada asset antes de armar el FormData.
    // Parámetros recomendados: calidad 0.7-0.85 y maxWidth 1920.
    async function compressAsset(a: ImagePicker.ImagePickerAsset, quality = 0.75, maxWidth = 1920) {
        const actions: ImageManipulator.Action[] = []
        // Obtener tamaño original cuando sea posible
        let originalSize = 0
        try {
            const originalInfo = await FileSystem.getInfoAsync(a.uri, { size: true })
            originalSize = (originalInfo as any).size ?? 0
        } catch (e) {
            // ignore
        }
        if (a.width && a.width > maxWidth) actions.push({ resize: { width: maxWidth } })

        const result = await ImageManipulator.manipulateAsync(a.uri, actions, {
            compress: quality,
            format: ImageManipulator.SaveFormat.JPEG,
        })

        const info = await FileSystem.getInfoAsync(result.uri, { size: true })
        const size = (info as any).size ?? 0

        // (debug logs removed)
        return {
            uri: result.uri,
            fileName: a.fileName ?? `photo-${Date.now()}.jpg`,
            mimeType: "image/jpeg",
            size,
            originalSize,
        }
    }

    // Comprimir en paralelo
    const compressed = await Promise.all(assets.map((a) => compressAsset(a)))

    const form = new FormData()
    for (const c of compressed) {
        form.append("files", {
            uri: c.uri,
            name: c.fileName,
            type: c.mimeType,
        } as any)
    }

    const { data } = await http.post<PostFilesResponse>(
        `/v1/media/uploads/${entityType}/${entityId}`,
        form
    )
    return data.data
}

export async function listMedia(entityType: string): Promise<string[]> {
    const { data } = await http.get<GetFilesResponse>(`/v1/media/uploads/${entityType}`)
    return data.data
}
