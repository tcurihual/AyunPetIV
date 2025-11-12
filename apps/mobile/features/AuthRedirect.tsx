import { useEffect, useRef } from "react"
import { useRouter, useSegments } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function AuthRedirect() {
    const router = useRouter()
    const segments = useSegments()
    const { status, user } = useAuthContext()
    const redirected = useRef(false)

    useEffect(() => {
        if (status === "loading") return
        if (!user) return

        const currentPath = `/${segments.join("/")}`
        const firstSegment = segments[0]
        const inPrivateGroup = firstSegment === "(home)" || firstSegment === "(shelter)"
        const isGiverOrShelter = user.role === 21 || user.role === 22
        const correctGroup = isGiverOrShelter ? "(shelter)" : "(home)"

        // Solo redirigir si está autenticado y en un grupo incorrecto
        if (status === "authenticated" && inPrivateGroup) {
            if (firstSegment !== correctGroup && !redirected.current) {
                redirected.current = true
                router.replace(isGiverOrShelter ? "/(shelter)" : "/(home)")
            }
            return
        }

        // Si no está autenticado y está en una ruta privada
        if (status === "unauthenticated" && inPrivateGroup) {
            const target = "/(auth)/(login)/"
            if (!redirected.current && currentPath !== target) {
                redirected.current = true
                router.replace(target)
            }
        }
    }, [status, user, segments])

    return null
}
