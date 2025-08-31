import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http, setAuthToken } from "../services/http"
import { clearAuth, getToken, getUser, saveToken, saveUser } from "../utils/storage"

// Definimos los roles posibles (ajústalo a tu backend)
type Role = "adoptante" | "fundacion" | "admin"

export interface User {
    id: string
    name: string
    email: string
    role: Role
}

// Datos que enviamos al login/registro
interface LoginPayload {
    email: string
    password: string
}
interface RegisterPayload {
    name: string
    email: string
    password: string
    role?: Role
}

// Lo que devuelve el backend
interface AuthResponse {
    token: string
    user: User
}

type Status = "loading" | "authenticated" | "unauthenticated"

interface AuthContextType {
    status: Status
    user: User | null
    token: string | null
    signIn: (data: LoginPayload) => Promise<void>
    signUp: (data: RegisterPayload) => Promise<void>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [status, setStatus] = useState<Status>("loading")
    const [user, setUser] = useState<User | null>(null)
    const [token, setTokenState] = useState<string | null>(null)

    // Al iniciar la app, revisamos si hay token guardado
    useEffect(() => {
        ;(async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([getToken(), getUser<User>()])

                if (storedToken) {
                    setAuthToken(storedToken)
                    setTokenState(storedToken)
                    setUser(storedUser)
                    await refreshUser().catch(() => {})
                    setStatus("authenticated")
                } else {
                    setStatus("unauthenticated")
                }
            } catch {
                setStatus("unauthenticated")
            }
        })()
    }, [])

    // Login
    async function signIn(data: LoginPayload) {
        setStatus("loading")
        const res = await http.post<AuthResponse>("/api/auth/login", data)
        const { token: tk, user } = res.data

        await Promise.all([saveToken(tk), saveUser(user)])
        setAuthToken(tk)
        setTokenState(tk)
        setUser(user)
        setStatus("authenticated")
    }

    // Registro
    async function signUp(data: RegisterPayload) {
        const res = await http.post<AuthResponse>("/api/auth/register", data)
        const { token: tk, user } = res.data

        await Promise.all([saveToken(tk), saveUser(user)])
        setAuthToken(tk)
        setTokenState(tk)
        setUser(user)
        setStatus("authenticated")
    }

    // Cerrar sesión
    async function signOut() {
        setStatus("loading")
        await clearAuth()
        setAuthToken(null)
        setTokenState(null)
        setUser(null)
        setStatus("unauthenticated")
    }

    // Refrescar datos del usuario actual
    async function refreshUser() {
        const res = await http.get<User>("/api/auth/me")
        const fresh = res.data
        setUser(fresh)
        await saveUser(fresh)
    }

    const value = useMemo(
        () => ({
            status,
            user,
            token,
            signIn,
            signUp,
            signOut,
            refreshUser,
        }),
        [status, user, token]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para consumir el contexto
export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
    return ctx
}
