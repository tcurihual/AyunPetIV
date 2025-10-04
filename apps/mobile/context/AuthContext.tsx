import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http, setAuthToken } from "@/services/http"
import { clearAuth, getToken, getUser, saveToken, saveUser } from "@/utils/storage"

import {
    login as mockLogin,
    register as mockRegister,
    restoreSession as mockRestore,
    logout as mockLogout,
    getUserById,
    getAllUsers,
    type Session as MockSession,
} from "@/services/mockAuth"

type Role = "adoptante" | "fundacion" | "admin" | "shelter"

export interface User {
    id: string
    name: string
    email: string
    role: Role
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

const USE_MOCK = false
const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [status, setStatus] = useState<Status>("loading")
    const [user, setUser] = useState<User | null>(null)
    const [token, setTokenState] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([getToken(), getUser<User>()])

                if (!mounted) return

                if (!storedToken) {
                    setStatus("unauthenticated")
                    return
                }

                setAuthToken(storedToken)
                setTokenState(storedToken)

                try {
                    if (USE_MOCK) {
                        const session = await mockRestore()
                        if (!session) throw new Error("No session")
                        const me = await resolveUserFromMock(session)
                        await saveUser(me)
                        setUser(me)
                        setStatus("authenticated")
                    } else {
                        const me = await http.get<User>("/me").then((r) => r.data)
                        await saveUser(me)
                        setUser(me)
                        setStatus("authenticated")
                    }
                } catch (error) {
                    await clearDown()
                    setStatus("unauthenticated")
                }
            } catch {
                await clearDown()
                if (mounted) setStatus("unauthenticated")
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    async function signIn(data: LoginPayload) {
        setStatus("loading")
        try {
            const response = USE_MOCK
                ? await signInViaMock(data)
                : await http.post("/v1/auth/login", data).then((r) => r.data)

            const { token: tk, user } = response.data
            await afterAuthSuccess(tk, user)
        } catch (e: any) {
            setStatus("unauthenticated")
            throw e
        }
    }

    async function signUp(data: RegisterPayload) {
        setStatus("loading")
        try {
            const { token: tk, user } = USE_MOCK
                ? await signUpViaMock(data)
                : await http
                      .post<AuthResponse>(`/register/${data.role || "adoptante"}`, data)
                      .then((r) => r.data)

            await afterAuthSuccess(tk, user)
        } catch (e) {
            setStatus("unauthenticated")
            throw e
        }
    }

    async function signOut() {
        if (USE_MOCK) await mockLogout().catch(() => {})
        await clearDown()
        setStatus("unauthenticated")
    }

    async function refreshUser() {
        try {
            const me = USE_MOCK
                ? await httpLikeGetMeFromMock()
                : await http.get<User>("/me").then((r) => r.data)

            setUser(me)
            await saveUser(me)
        } catch (e) {
            await clearDown()
            setStatus("unauthenticated")
            throw e
        }
    }

    const value = useMemo(
        () => ({ status, user, token, signIn, signUp, signOut, refreshUser }),
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

    async function signInViaMock(data: LoginPayload): Promise<AuthResponse> {
        const s = await mockLogin(data.email, data.password)
        const me = await resolveUserFromMock(s)
        return { token: s.token, user: me }
    }

    async function signUpViaMock(data: RegisterPayload): Promise<AuthResponse> {
        const roleType = data.role === "fundacion" ? "fundacion" : "adoptante"
        const s = await mockRegister({
            email: data.email,
            name: data.name,
            role: roleType,
            password: data.password,
        })
        const me = await resolveUserFromMock(s)
        return { token: s.token, user: me }
    }

    async function httpLikeGetMeFromMock(): Promise<User> {
        const session = await mockRestore()
        if (session) return resolveUserFromMock(session)
        const all = await getAllUsers()
        if (!all.length) throw new Error("Usuario mock no encontrado")
        const anything = all[0]
        return mapMockToUser(anything.id, anything.email, anything.name, anything.role)
    }

    async function resolveUserFromMock(session: MockSession): Promise<User> {
        const m = await getUserById(session.userId)
        if (!m) throw new Error("Usuario mock no encontrado")
        return mapMockToUser(m.id, m.email, m.name, m.role)
    }

    function mapMockToUser(id: number, email: string, name: string, roleId: number): User {
        const data = require("@/data/mockData").default as any
        const roleName =
            (data.role as Array<{ id: number; roletype: string }>).find((r) => r.id === roleId)
                ?.roletype ?? "adoptante"
        return { id: String(id), email, name, role: roleName as Role }
    }
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
    return ctx
}
