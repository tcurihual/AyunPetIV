import React from "react"
import { StatusBar as ExpoStatusBar } from "expo-status-bar"
import { View, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getStatusBarConfig, StatusBarConfig } from "@/utils/statusBar"

type StatusBarProps = {
    backgroundColor?: string
    variant?: keyof typeof StatusBarConfig
    style?: "dark" | "light" | "auto"
    translucent?: boolean
}

export default function StatusBar({
    backgroundColor,
    variant = "yellow",
    style,
    translucent = false,
}: StatusBarProps) {
    const insets = useSafeAreaInsets()
    let config

    if (backgroundColor && !variant) {
        config = getStatusBarConfig(backgroundColor)
    } else if (style && backgroundColor) {
        config = { style, backgroundColor }
    } else {
        config = StatusBarConfig[variant]
    }

    return (
        <>
            <ExpoStatusBar style={config.style} translucent={translucent} />

            {!translucent && config.backgroundColor !== "transparent" && (
                <View
                    style={{
                        height: insets.top,
                        backgroundColor: config.backgroundColor,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}
                />
            )}
        </>
    )
}
