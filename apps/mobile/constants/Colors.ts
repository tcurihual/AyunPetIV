/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * 🎨 Archivo centralizado de colores - Ayün Pet
 * Define la paleta de colores oficiales para ambos temas (light / dark)
 */

const brandYellow = "#F9C53D"   // Amarillo oficial (color de marca)
const brandPurple = "#9B6DD7"   // Púrpura oficial
const brandRed = "#E74C3C"      // Rojo (errores / alertas)
const brandGray = "#666666"     // Gris base para texto secundario

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: brandGray,
    background: "#F2F2F2",
    card: "#FFFFFF",
    border: "#E5E7EB",
    disabled: "#E0E0E0",
    shadow: "#000000",

    // 👇 Clave: incluir tint dentro del tema
    tint: brandYellow,

    // Principales
    primary: brandYellow,
    secondary: brandPurple,
    success: "#4CAF50",
    danger: brandRed,
    warning: "#FB8C00",

    // Navbar y Tabs
    navBackground: brandYellow,
    navIconActive: brandPurple,
    navIconInactive: brandGray,
    navActiveTabBg: "#FEF3C7",
    navAddButton: brandPurple,

    tabIconDefault: "#CCCCCC",
    tabIconSelected: brandYellow,
  },

  dark: {
    text: "#FFFFFF",
    textSecondary: "#DDDDDD",
    background: "#121212",
    card: "#1E1E1E",
    border: "#333333",
    disabled: "#444444",
    shadow: "#000000",

    // 👇 Igual que en modo claro
    tint: brandYellow,

    // Principales
    primary: brandYellow,
    secondary: brandPurple,
    success: "#4CAF50",
    danger: "#FF5252",
    warning: "#FB8C00",

    // Navbar y Tabs
    navBackground: brandYellow,
    navIconActive: brandPurple,
    navIconInactive: "#888888",
    navActiveTabBg: "#333333",
    navAddButton: brandPurple,

    tabIconDefault: "#888888",
    tabIconSelected: brandYellow,
  },

  // 👇 Accesos rápidos (para uso directo sin depender del tema)
  primary: brandYellow,
  secondary: brandPurple,
  yellow: brandYellow,
  purple: brandPurple,
  danger: brandRed,
  gray: brandGray,
}

