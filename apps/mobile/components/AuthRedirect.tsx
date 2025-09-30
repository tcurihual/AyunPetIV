import { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"

export default function AuthRedirect() {
    const router = useRouter()
    const { status, user } = useAuthContext()

    useEffect(() => {
        if (status === "authenticated" && user) {
            const isShelter =
                user.id === "21" ||
                user.role === "shelter" ||
                (typeof user.role === "number" && user.role === 21)

            if (isShelter) {
                router.replace("/(shelter)")
            } else {
                router.replace("/(home)")
            }
        }
    }, [status, user, router])

    return null
}
