import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http, setAuthToken } from "@/services/http"
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
import { DeviceEventEmitter } from "react-native"
import { saveHasCompletedAuth, clearHasCompletedAuth, getHasCompletedAuth } from "@/utils/storage"

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
    profileImage?: {
        uri: string
        name: string
        type: string
    }
    documents?: Array<{
        uri: string
        name: string
        type: string
    }>
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
    hasCompletedAuth: boolean
    signIn: (data: LoginPayload) => Promise<void>
    signUp: (
        data: RegisterPayload,
        variation?: "user" | "giver" | "shelter"
    ) => Promise<SignUpResult>
    signOut: (partial?: boolean) => Promise<void>
    updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [status, setStatus] = useState<Status>("loading")
    const [user, setUser] = useState<User | null>(null)
    const [hasCompletedAuth, setHasCompletedAuthState] = useState<boolean>(false)
    const [token, setTokenState] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        ;(async () => {
            try {
                const [storedToken, storedUser, completed] = await Promise.all([
                    getToken(),
                    getUser<User>(),
                    getHasCompletedAuth(),
                ])

                setHasCompletedAuthState(completed)

                if (!storedUser) throw new Error("No user stored")

                setUser(storedUser)

                if (!storedToken) {
                    setStatus("unauthenticated")
                    return
                }

                setAuthToken(storedToken)
                await http.get("/v1/check-auth")

                setTokenState(storedToken)
                setStatus("authenticated")
            } catch (err) {
                console.log("Auth init error:", err)
                setStatus("unauthenticated")
            }
        })()
    }, [])

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener("SESSION_EXPIRED", async () => {
            await clearDown()
            setStatus("unauthenticated")
            router.replace("/(auth)/(login)/")
        })

        return () => sub.remove()
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

            await saveHasCompletedAuth(true)
            setHasCompletedAuthState(true)

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

            const requiresEmailVerification = variation === "user"

            if (variation === "giver" || variation === "shelter") {
                await saveHasCompletedAuth(true)
                setHasCompletedAuthState(true)
            } else {
                await saveHasCompletedAuth(false)
                setHasCompletedAuthState(false)
            }

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

    async function signOut(full: boolean = false) {
        if (full) await clearFull()
        else await clearDown()

        if (full) {
            await clearHasCompletedAuth()
            setHasCompletedAuthState(false)
        }

        router.replace("/(auth)/(login)/")
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

    async function clearFull() {
        await clearAuth()
        await clearHasCompletedAuth()
        setAuthToken(null)
        setTokenState(null)
        setUser(null)

        try {
            const { clearPushTokenSaved } = await import("@/services/pushTokenService")
            await clearPushTokenSaved()
        } catch (error) {
            console.error("Error al limpiar push token:", error)
        }
    }

    async function updateUser(userData: Partial<User>) {
        if (!user) return

        const updatedUser = { ...user, ...userData }
        setUser(updatedUser)
        await saveUser(updatedUser)
    }

    const value = useMemo(
        () => ({
            status,
            user,
            token,
            hasCompletedAuth,
            signIn,
            signUp,
            signOut,
            updateUser,
        }),
        [status, user, token, hasCompletedAuth]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
    return ctx
}
