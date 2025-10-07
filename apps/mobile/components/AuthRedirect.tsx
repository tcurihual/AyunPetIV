import { useEffect, useState } from "react"
import { useRouter, useSegments } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { isFirstLaunch } from "@/utils/storage"

export default function AuthRedirect() {
    const router = useRouter()
    const segments = useSegments()
    const { status, user } = useAuthContext()

    useEffect(() => {
        if (status === "loading") return

        const inPrivateGroup = segments[0] === "(home)" || segments[0] === "(shelter)"

        if (status === "authenticated" && user) {
            router.replace(user.role === 21 ? "/(shelter)" : "/(home)")
        }

        if (status === "unauthenticated" && inPrivateGroup) {
            const target = user ? "/(auth)/remembered-login" : "/(auth)/login"
            router.replace(target)
            return
        }
    }, [status, user, segments])

    return null
}
