import { Colors } from "../constants/Colors"
import { useTheme } from "@/context/ThemeContext"

// Tipo auxiliar para filtrar solo valores string
type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: StringKeys<typeof Colors.light> | StringKeys<typeof Colors.dark>
): string {
    const { theme: appTheme } = useTheme()
    const theme = appTheme

    const colorFromProps = props[theme]
    if (colorFromProps) {
        return colorFromProps
    } else {
        const color = Colors[theme][colorName]
        return typeof color === 'string' ? color : '#000000'
    }
}
