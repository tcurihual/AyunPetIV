import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { router } from "expo-router"
import { DeviceEventEmitter, Platform } from "react-native"

let accessToken: string | null = null

function resolveGatewayBaseURL() {
    if (process.env.EXPO_PUBLIC_API_GATEWAY) {
        return process.env.EXPO_PUBLIC_API_GATEWAY
    }

    return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000"
}

export const http = axios.create({
    baseURL: resolveGatewayBaseURL(),
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

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            DeviceEventEmitter.emit("SESSION_EXPIRED")
            console.log("hola")
        }
        return Promise.reject(error)
    }
)

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

        const response = await http.post(`/v1/media/uploads/${entityType}/${entityId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    },

    getFiles: async (entityType: string): Promise<{ message: string; data: string[] }> => {
        const response = await http.get(`/v1/media/uploads/${entityType}`)
        return response.data
    },

    deleteFiles: async (
        entityType: string,
        entityId: string,
        fileNames: string[]
    ): Promise<any> => {
        const response = await http.delete(`/v1/media/uploads/${entityType}/${entityId}`, {
            data: { fileNamesArray: fileNames },
        })
        return response.data
    },
}
