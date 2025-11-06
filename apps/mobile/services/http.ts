import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { router } from "expo-router"
import { DeviceEventEmitter, Platform } from "react-native"

let accessToken: string | null = null

function resolveGatewayBaseURL() {
    let baseURL = process.env.EXPO_PUBLIC_API_GATEWAY;
    
    if (!baseURL) {
        baseURL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
    }
    
    // Remover trailing slash si existe para evitar URLs con doble slash
    return baseURL.replace(/\/+$/, "");
}

export const http = axios.create({
    baseURL: resolveGatewayBaseURL(),
})

export function setAuthToken(token: string | null) {
    accessToken = token
}

let loadingHandler: {
    showLoading: () => void
    hideLoading: () => void
} | null = null

export const registerLoadingHandler = (handler: typeof loadingHandler) => {
    loadingHandler = handler
}

http.interceptors.request.use(
    (config) => {
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        loadingHandler?.showLoading()

        return config
    },
    (error) => {
        loadingHandler?.hideLoading()
        return Promise.reject(error)
    }
)

http.interceptors.response.use(
    (response) => {
        loadingHandler?.hideLoading()
        return response
    },
    async (error) => {
        loadingHandler?.hideLoading()

        if (error.response?.status === 401) {
            DeviceEventEmitter.emit("SESSION_EXPIRED")
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

        files.forEach((file) => {
            formData.append("files", {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any)
        })

        const response = await http.post(`/v1/media/uploads/${entityType}/${entityId}`, formData)
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
