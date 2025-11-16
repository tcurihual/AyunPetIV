import { useEffect, useRef } from "react"
import { useRouter, useSegments } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function AuthRedirect() {
    const router = useRouter()
    const segments = useSegments()
    const { status, user, hasCompletedAuth } = useAuthContext()
    const redirected = useRef(false)

    useEffect(() => {
        if (status === "loading") return

        const root = segments[0] // "(auth)" | "(home)" | etc.
        const child = segments[1]?.toLowerCase() // "(login)" | "(register)" | "welcome"
        const sub = segments[2]?.toLowerCase() // "user" | "giver" | etc.

        const isPrivate = root === "(home)" || root === "(shelter)"
        const isAuthArea = root === "(auth)"

        const isInsideRegister = child === "(register)"
        const isInsideLogin = child === "(login)"
        const isWelcome = child === "welcome"
        const isPassword = child === "(password)"
        const isVerifyEmail = child === "verify-email"
        const isRegistrationSuccess = child === "registration-success"

        const allowedBeforeAuth = [
            "welcome",
            "(login)",
            "(register)",
            "(password)",
            "verify-email",
            "registration-success",
        ]

        const allowUnauth =
            allowedBeforeAuth.includes(child ?? "") || isInsideRegister || isInsideLogin

        // ============================================================
        // 1) AUTENTICADO → mandar al grupo correspondiente
        // ============================================================
        if (status === "authenticated" && user) {
            const isGiverOrShelter = user.role === 21 || user.role === 22
            const correctGroup = isGiverOrShelter ? "(shelter)" : "(home)"

            if (root !== correctGroup && !redirected.current) {
                redirected.current = true
                router.replace(isGiverOrShelter ? "/(shelter)" : "/(home)")
            }
            return
        }

        // ============================================================
        // 2) NO AUTENTICADO → lógica welcome
        // ============================================================
        if (status === "unauthenticated") {
            // --- Nunca completó → solo permitir rutas del auth flow
            if (!hasCompletedAuth) {
                if (!allowUnauth && !redirected.current) {
                    redirected.current = true
                    router.replace("/(auth)/welcome")
                }
                return
            }

            // --- Sí completó → NO debe ver Welcome jamás
            if (isWelcome && !redirected.current) {
                redirected.current = true
                router.replace("/(auth)/(login)/")
                return
            }

            // --- Sí completó → pero sin sesión → bloquear rutas privadas
            if (isPrivate && !redirected.current) {
                redirected.current = true
                router.replace("/(auth)/(login)/")
                return
            }
        }
    }, [status, user, segments, hasCompletedAuth])

    return null
}
