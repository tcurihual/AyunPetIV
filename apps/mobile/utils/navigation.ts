import { useRouter, usePathname } from "expo-router"
import type { Href } from "expo-router"

export function useSafeNavigation() {
    const router = useRouter()
    const pathname = usePathname()

    function normalizePath(path: string) {
        return path
            .replace(/\((.*?)\)/g, "")
            .replace(/\/+$/, "")
            .toLowerCase()
    }

    function navigate(path: Href) {
        const current = normalizePath(pathname)
        const target = normalizePath(path.toString())

        if (current === target) return

        if (current.split("/").pop() === target.split("/").pop()) {
            router.replace(path)
        } else {
            router.push(path)
        }
    }

    return { navigate }
}
