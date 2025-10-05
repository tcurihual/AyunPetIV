import { mediaHttp } from "@/services/http"
import * as ImagePicker from "expo-image-picker"

export type UploadedFile = {
  url: string
  fileName: string
  size: number
  mime: string
}

type PostFilesResponse = { message: string; data: UploadedFile[] }
type GetFilesResponse  = { message: string; data: string[] }

export function getFileUrl(relativeOrAbsolute: string): string {
  if (!relativeOrAbsolute) return ""
  if (/^https?:\/\//i.test(relativeOrAbsolute)) return relativeOrAbsolute

  const base =
    (mediaHttp as any)?.defaults?.baseURL ||
    process.env.EXPO_PUBLIC_MEDIA_BASE || // usa tu var ya existente
    "http://localhost:8080"

  // asegura que solo haya una /
  return `${String(base).replace(/\/+$/,"")}/${String(relativeOrAbsolute).replace(/^\/+/,"")}`
}

/** Sube múltiples imágenes (campo "files") al microservicio Media */
export async function uploadMedia(
  entityType: string,
  entityId: string | number,
  assets: ImagePicker.ImagePickerAsset[]
): Promise<UploadedFile[]> {
  const form = new FormData()
  for (const a of assets) {
    form.append("files", {
      uri: a.uri,
      name: a.fileName ?? `photo-${Date.now()}.jpg`,
      type: a.mimeType ?? "image/jpeg",
    } as any)
  }

  const { data } = await mediaHttp.post<PostFilesResponse>(
    `/uploads/${entityType}/${entityId}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data.data
}

export async function listMedia(entityType: string): Promise<string[]> {
  const { data } = await mediaHttp.get<GetFilesResponse>(`/uploads/${entityType}`)
  return data.data
}
