import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function CheckRoleScreen() {
    const { user } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!user) return router.replace("/(auth)/login")

        switch (user.role) {
            case 20:
                router.replace("/(home)")
                break
            case 21:
                router.replace("/(shelter)")
                break
            case 19:
                router.replace("/(admin)")
                break
            case 22:
                router.replace("/(shelter)")
                break
            default:
                router.replace("/(home)")
                break
        }
    }, [user])

    return null
}
