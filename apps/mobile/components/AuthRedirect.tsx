import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { isFirstLaunch } from "@/utils/storage"

export default function AuthRedirect() {
    const router = useRouter()
    const { status, user } = useAuthContext()

    useEffect(() => {
        if (status === "loading") return

        if (status === "authenticated" && user) {
            router.replace(user.role === 21 ? "/(shelter)" : "/(home)")
        }
    }, [status, user])

    return null
}
