import axios from "axios"

// URL base de la API de autenticación (definida en .env como EXPO_PUBLIC_API_AUTH)
export const API_BASE =
  process.env.EXPO_PUBLIC_API_AUTH ?? "http://localhost:4000/api/auth"

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

export function setAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete http.defaults.headers.common.Authorization
  }
}
