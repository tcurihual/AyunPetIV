import { useEffect, useRef, useState } from "react"
import { useRouter, useSegments } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { isFirstLaunch } from "@/utils/storage"

export default function AuthRedirect() {
    const router = useRouter()
    const segments = useSegments()
    const { status, user } = useAuthContext()
    const redirected = useRef(false)

    useEffect(() => {
        if (status === "loading") return
        redirected.current = false

        const currentPath = `/${segments.join("/")}`
        const inPrivateGroup = segments[0] === "(home)" || segments[0] === "(shelter)"

        if (status === "authenticated" && user) {
            const isInCorrectGroup =
                (user.role === 21 && segments[0] === "(shelter)") ||
                (user.role !== 21 && segments[0] === "(home)")

            if (!isInCorrectGroup && !redirected.current) {
                redirected.current = true
                router.replace(user.role === 21 ? "/(shelter)" : "/(home)")
            }

            return
        }

        if (status === "unauthenticated" && inPrivateGroup) {
            const target = user ? "/(auth)/remembered-login" : "/(auth)/login"
            if (!redirected.current && currentPath !== target) {
                redirected.current = true
                router.replace(target)
            }
        }
    }, [status, user, segments])

    return null
}
