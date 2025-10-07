import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http, setAuthToken } from "@/services/http"
import { clearAuth, clearToken, getToken, getUser, saveToken, saveUser } from "@/utils/storage"
import { useRouter } from "expo-router"

type Role = 19 | 20 | 21

export interface User {
    id: string
    name: string
    email: string
    role: Role
    avatar?: string
    phone?: string
    address?: string
    city?: string
    region?: string
    rut?: string
    description?: string
    dateOfBirth?: string
    profileComplete?: boolean
}

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

interface AuthResponse {
    data: { token: string; user: User }
}

type Status = "loading" | "authenticated" | "unauthenticated"

interface AuthContextType {
    status: Status
    user: User | null
    token: string | null
    signIn: (data: LoginPayload) => Promise<void>
    signUp: (data: RegisterPayload) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [status, setStatus] = useState<Status>("loading")
    const [user, setUser] = useState<User | null>(null)
    const [token, setTokenState] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([getToken(), getUser<User>()])

                if (!storedToken && !storedUser) {
                    setStatus("unauthenticated")
                    return
                }

                if (!storedToken && storedUser) {
                    setUser(storedUser)
                    setStatus("unauthenticated")
                    return
                }

                setAuthToken(storedToken!)
                setTokenState(storedToken!)
                if (storedUser) setUser(storedUser)
                setStatus("authenticated")
            } catch (e) {
                console.error("Error al restaurar sesión:", e)
                await clearDown()
                setStatus("unauthenticated")
            }
        })()

        return () => {
            mounted = false
        }
    }, [])

    async function signIn(data: LoginPayload) {
        setStatus("loading")
        try {
            const response = await http.post<AuthResponse>("/v1/auth/login", data)
            const { token, user } = response.data.data
            await afterAuthSuccess(token, user)
        } catch (e) {
            console.error("Error al iniciar sesión:", e)
            setStatus("unauthenticated")
            throw e
        }
    }

    async function signUp(data: RegisterPayload) {
        setStatus("loading")
        try {
            const response = await http.post<AuthResponse>(
                `/v1/auth/register/${data.role || "adoptante"}`,
                data
            )
            if (response.status === 201) {
                console.log("logeo exitoso")
            }
        } catch (e) {
            console.error("Error al registrar usuario:", e)
            setStatus("unauthenticated")
            throw e
        }
    }

    async function signOut() {
        await clearToken()
        setAuthToken(null)
        setTokenState(null)
        router.replace("/(auth)/login")
        setStatus("unauthenticated")
    }

    const value = useMemo(
        () => ({
            status,
            user,
            token,
            signIn,
            signUp,
            signOut,
        }),
        [status, user, token]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

    async function afterAuthSuccess(tk: string, usr: User) {
        await Promise.all([saveToken(tk), saveUser(usr)])
        setAuthToken(tk)
        setTokenState(tk)
        setUser(usr)
        setStatus("authenticated")
    }

    async function clearDown() {
        await clearAuth()
        setAuthToken(null)
        setTokenState(null)
        setUser(null)
    }
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
    return ctx
}
