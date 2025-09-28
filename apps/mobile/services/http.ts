import axios from "axios"
import { Platform } from "react-native"

let accessToken: string | null = null

function resolveAuthBaseURL() {
    const env = process.env.EXPO_PUBLIC_API_AUTH?.trim()
    if (env && !env.includes("localhost")) return env
    if (Platform.OS === "android") return "http://10.0.2.2:4000/api/auth"
    return "http://localhost:4000/api/auth"
}

function resolveMediaBaseURL() {
    const env = process.env.EXPO_PUBLIC_MEDIA_BASE?.trim()
    if (env) return env

    if (Platform.OS === "android") return "http://10.0.2.2:8080"
    return "http://localhost:8080"
}

export const http = axios.create({
    baseURL: resolveAuthBaseURL(),
})

console.log(">>> ENV EXPO_PUBLIC_MEDIA_BASE =", process.env.EXPO_PUBLIC_MEDIA_BASE)

export const mediaHttp = axios.create({
    baseURL: resolveMediaBaseURL(),
})

export function setAuthToken(token: string | null) {
    accessToken = token
}

http.interceptors.request.use((config) => {
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

mediaHttp.interceptors.request.use((config) => {
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

export interface UploadedFile {
    url: string
    fileName: string
    size: number
    mime: string
}

export interface UploadResponse {
    message: string
    data: UploadedFile[]
}

export interface FileInfo {
    uri: string
    name: string
    type: string
}

export const mediaService = {
    uploadFiles: async (
        entityType: string,
        entityId: string,
        files: FileInfo[]
    ): Promise<UploadResponse> => {
        const formData = new FormData()

        files.forEach((file, index) => {
            formData.append("files", {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any)
        })

        const response = await mediaHttp.post(`/uploads/${entityType}/${entityId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    },

    getFiles: async (entityType: string): Promise<{ message: string; data: string[] }> => {
        const response = await mediaHttp.get(`/uploads/${entityType}`)
        return response.data
    },

    deleteFiles: async (
        entityType: string,
        entityId: string,
        fileNames: string[]
    ): Promise<any> => {
        const response = await mediaHttp.delete(`/uploads/${entityType}/${entityId}`, {
            data: { fileNamesArray: fileNames },
        })
        return response.data
    },
}
