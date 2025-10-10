import { Colors } from "@/constants/Colors"

export const StatusBarConfig = {
    yellow: {
        style: "dark" as const,
        backgroundColor: Colors.yellow,
    },

    white: {
        style: "dark" as const,
        backgroundColor: "#ffffff",
    },

    dark: {
        style: "light" as const,
        backgroundColor: "#000000",
    },

    transparent: {
        style: "light" as const,
        backgroundColor: "transparent",
    },
} as const

export function getStatusBarStyle(backgroundColor: string): "dark" | "light" {
    if (backgroundColor === "transparent") return "light"

    const hex = backgroundColor.replace("#", "")

    if (hex.length !== 6) return "dark"

    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? "dark" : "light"
}

export function getStatusBarConfig(backgroundColor: string) {
    const style = getStatusBarStyle(backgroundColor)
    return {
        style,
        backgroundColor,
    }
}
