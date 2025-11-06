/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#f7c316ff" // 1. Color Mostaza (Brand)
const tintColorDark = "#f7c316ff" // El brand suele ser el mismo

// --- Tus colores de marca ---
const brandPurple = "#9C27B0"
const brandLightYellow = "#FEF3C7"
const brandGray = "#666"

export const Colors = {
    light: {
        text: "#000",
        background: "#F2F2F2",
        card: "#FFFFFF",
        tint: tintColorLight,

        // Colores de Navbar
        navBackground: tintColorLight,
        navIconActive: brandPurple,
        navIconInactive: brandGray,
        navActiveTabBg: brandLightYellow,
        navAddButton: brandPurple,

        primary: "#A47CF3",       // El violeta de los bordes
        textSecondary: "#666",    // Texto gris (ej. "Seleccionar Foto")
        textMuted: "#333",        // Texto gris oscuro (ej. "Nombre", "Edad")
        textInverted: "#222",     // Texto sobre fondos de color (ej. header, botón)
        danger: "#e74c3c",        // Para mensajes de error
        disabled: "#E0E0E0",      // Fondo de botón deshabilitado
        shadow: "#000",
        border: "#e5e7eb",

        tabIconDefault: "#ccc",
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: "#fff",
        background: "#121212",
        card: "#1E1E1E",
        tint: tintColorDark,

        // Colores de Navbar
        navBackground: tintColorDark,
        navIconActive: brandPurple,
        navIconInactive: "#888",
        navActiveTabBg: "#333",
        navAddButton: brandPurple,

        textSecondary: "#ddd",
        border: "#333",
        danger: "#ff5252",
        shadow: "#000",
        primary: "#A47CF3",
        textMuted: "#bbb",
        textInverted: "#ffffff",
        disabled: "#444",

        tabIconDefault: "#888",
        tabIconSelected: tintColorDark,
    },
    yellow: "#F9C53D",
    purple: "#9B6DD7",
}
