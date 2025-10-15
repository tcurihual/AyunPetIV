import { http } from "@/services/http"
import * as ImagePicker from "expo-image-picker"
import { toMediaUrl } from "@/utils/mediaUrl"

export type UploadedFile = {
  url: string
  fileName: string
  size: number
  mime: string
}

type PostFilesResponse = { message: string; data: UploadedFile[] }
type GetFilesResponse  = { message: string; data: string[] }

export function getFileUrl(relativeOrAbsolute: string): string {
  return toMediaUrl(relativeOrAbsolute)
}

/** Sube múltiples imágenes (campo "files") al microservicio Media a través del gateway */
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

  const { data } = await http.post<PostFilesResponse>(
    `/v1/media/uploads/${entityType}/${entityId}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data.data
}

export async function listMedia(entityType: string): Promise<string[]> {
  const { data } = await http.get<GetFilesResponse>(`/v1/media/uploads/${entityType}`)
  return data.data
}
