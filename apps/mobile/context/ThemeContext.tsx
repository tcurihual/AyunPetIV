import React, { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Appearance } from "react-native"

type Theme = "light" | "dark"
type ThemeContextType = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "app-theme"

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemTheme = useColorScheme() ?? "light"
    const [theme, setThemeState] = useState<Theme>(systemTheme)

    // 1. Cargar la preferencia guardada al iniciar la app
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = (await AsyncStorage.getItem(THEME_STORAGE_KEY)) as Theme | null
                if (savedTheme) {
                    setThemeState(savedTheme)
                    Appearance.setColorScheme(savedTheme)
                } else {
                    setThemeState(systemTheme)
                    Appearance.setColorScheme(systemTheme)
                }
            } catch (error) {
                console.error("Failed to load theme from storage", error)
                setThemeState(systemTheme)
            }
        }
        loadTheme()
    }, [systemTheme])

    // 2. Función para cambiar el tema y guardarlo
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        Appearance.setColorScheme(newTheme)
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch((error) =>
            console.error("Failed to save theme to storage", error)
        )
    }

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// Hook para usar el contexto en cualquier componente
export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
