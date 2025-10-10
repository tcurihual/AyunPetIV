import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { Platform } from "react-native"
import { getStatusBarStyle } from "@/utils/statusBar"

export function useStatusBar(backgroundColor: string, translucent: boolean = false) {
    const style = getStatusBarStyle(backgroundColor)

    useEffect(() => {
        if (Platform.OS === "android") {
        }
    }, [backgroundColor])

    return {
        style,
        backgroundColor,
        translucent,
    }
}

export function useYellowStatusBar() {
    return useStatusBar("#F9C53D")
}

export function useWhiteStatusBar() {
    return useStatusBar("#ffffff")
}

export function useDarkStatusBar() {
    return useStatusBar("#000000")
}
