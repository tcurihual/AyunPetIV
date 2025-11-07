import { Colors } from "../constants/Colors"
import { useTheme } from "@/context/ThemeContext"

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
    const { theme: appTheme } = useTheme()

    const theme = appTheme

    const colorFromProps = props[theme]

    if (colorFromProps) {
        return colorFromProps
    } else {
        return Colors[theme][colorName]
    }
}
