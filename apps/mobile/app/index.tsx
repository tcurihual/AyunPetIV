import React, { useEffect } from "react"
import { useRouter } from "expo-router"

export default function Index() {
    const router = useRouter()

    useEffect(() => {
        router.replace("/splash")
    }, [router])

    return null
}
