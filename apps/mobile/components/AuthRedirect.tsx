import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function AuthRedirect() {
    const router = useRouter()
    const { status, user } = useAuthContext()
    const [hasRedirected, setHasRedirected] = useState(false)

    useEffect(() => {
        if (hasRedirected) {
            return
        }

        if (status === "loading") {
            return
        }

        if (status === "unauthenticated") {
            setHasRedirected(true)
            router.replace("/(auth)/login")
            return
        }

        if (status === "authenticated" && user) {
            const isShelter =
                user.id === "21" ||
                user.id === "5" ||
                user.role === "shelter" ||
                (typeof user.role === "number" && user.role === 21)

            if (isShelter) {
                setHasRedirected(true)
                router.replace("/(shelter)")
            } else {
                setHasRedirected(true)
                router.replace("/(home)")
            }
        }
    }, [status, user, router, hasRedirected])

    useEffect(() => {
        if (status === "loading") {
            setHasRedirected(false)
        }
    }, [status])

    return null
}
