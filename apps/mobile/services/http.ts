import axios from "axios"
import { Platform } from "react-native"

let accessToken: string | null = null

// Base URL del microservicio Auth
function resolveAuthBaseURL() {
  const env = process.env.EXPO_PUBLIC_API_AUTH?.trim()
  if (env && !env.includes("localhost")) return env
  if (Platform.OS === "android") return "http://10.0.2.2:4000/api/auth"
  return "http://localhost:4000/api/auth"
}

export const http = axios.create({
  baseURL: resolveAuthBaseURL(),
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
