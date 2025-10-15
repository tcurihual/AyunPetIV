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
            // Role 21 y 22 son givers/shelter, van a (shelter)
            // Role 19 y 20 son admin/user, van a (home)
            const isGiverOrShelter = user.role === 21 || user.role === 22
            const isInCorrectGroup =
                (isGiverOrShelter && segments[0] === "(shelter)") ||
                (!isGiverOrShelter && segments[0] === "(home)")

            if (!isInCorrectGroup && !redirected.current) {
                redirected.current = true
                router.replace(isGiverOrShelter ? "/(shelter)" : "/(home)")
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
