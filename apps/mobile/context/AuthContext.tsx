import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { setAuthToken } from "@/services/http"
import { authService } from "@/services/auth"
import {
    clearAuth,
    clearToken,
    getToken,
    getUser,
    savePlainPassword,
    saveToken,
    saveUser,
} from "@/utils/storage"
import { useRouter } from "expo-router"

type Role = 19 | 20 | 21 | 22

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
    rut: string
    phone?: string
    address?: string
    description?: string
    variation?: "user" | "giver" | "shelter"
}

type Status = "loading" | "authenticated" | "unauthenticated"

interface SignUpResult {
    requiresEmailVerification: boolean
    variation: "user" | "giver" | "shelter"
}

interface AuthContextType {
    status: Status
    user: User | null
    token: string | null
    signIn: (data: LoginPayload) => Promise<void>
    signUp: (data: RegisterPayload, variation?: "user" | "giver" | "shelter") => Promise<SignUpResult>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [status, setStatus] = useState<Status>("loading")
    const [user, setUser] = useState<User | null>(null)
    const [token, setTokenState] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        ;(async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([getToken(), getUser<User>()])

                if (storedToken && storedUser) {
                    setAuthToken(storedToken)
                    setTokenState(storedToken)
                    setUser(storedUser)
                    setStatus("authenticated")
                } else {
                    setStatus("unauthenticated")
                }
            } catch (e) {
                await clearDown()
                setStatus("unauthenticated")
            }
        })()
    }, [])

    async function signIn(data: LoginPayload) {
        setStatus("loading")
        try {
            const response = await authService.login(data)
            const { token, user } = response.data

            if (!user.validated) {
                setStatus("unauthenticated")

                const error = new Error("Tu cuenta aún no ha sido validada.")
                ;(error as any).code = "UNVERIFIED_ACCOUNT"
                throw error
            }

            const userFormatted: User = {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role as Role,
                rut: user.rut,
                address: user.address,
                description: user.description,
            }

            await afterAuthSuccess(token, userFormatted)
            await savePlainPassword(data.password)
        } catch (e) {
            console.error("Error al iniciar sesión:", e)
            setStatus("unauthenticated")
            throw e
        }
    }

    async function signUp(
        data: RegisterPayload,
        variation: "user" | "giver" | "shelter" = "user"
    ): Promise<SignUpResult> {
        setStatus("loading")
        try {
            const response = await authService.register(data, variation)

            if (response.message) {
                console.log("Registro exitoso:", response.message)
                setStatus("unauthenticated")
            }

            // Los roles giver (22) y shelter (21) no requieren verificación por email
            // Los roles user (20) sí requieren verificación
            const requiresEmailVerification = variation === "user"

            return {
                requiresEmailVerification,
                variation,
            }
        } catch (e: any) {
            console.error("Error al registrar usuario:", e)
            setStatus("unauthenticated")

            if (e.response?.data?.error) {
                throw new Error(e.response.data.error)
            }
            throw e
        }
    }

    async function signOut() {
        await clearDown()
        router.replace("/(auth)/login")
        setStatus("unauthenticated")
    }

    async function afterAuthSuccess(tk: string, usr: User) {
        await Promise.all([saveToken(tk), saveUser(usr)])
        setAuthToken(tk)
        setTokenState(tk)
        setUser(usr)
        setStatus("authenticated")
    }

    async function clearDown() {
        await clearToken()
        setAuthToken(null)
        setTokenState(null)
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
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
    return ctx
}
