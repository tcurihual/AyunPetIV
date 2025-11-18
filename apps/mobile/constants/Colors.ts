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
    textMuted: "#6b7280",
    textTertiary: "#9ca3af",
    background: "#F2F2F2",
    backgroundSecondary: "#f3f4f6",
    backgroundTertiary: "#f9fafb",
    card: "#FFFFFF",
    border: "#E5E7EB",
    borderLight: "#e6e7eb",
    disabled: "#E0E0E0",
    shadow: "#000000",
    icon: "#000000",

    // 👇 Clave: incluir tint dentro del tema
    tint: brandYellow,

    // Principales
    primary: brandYellow,
    secondary: brandPurple,
    success: "#4CAF50",
    danger: brandRed,
    warning: "#FFC107",
    info: "#2563EB",

    // Navbar y Tabs
    navBackground: brandYellow,
    navIconActive: brandPurple,
    navIconInactive: brandGray,
    navActiveTabBg: "#FEF3C7",
    navAddButton: brandPurple,

    tabIconDefault: "#CCCCCC",
    tabIconSelected: brandYellow,

    // Estados de solicitudes
    statusPending: { bg: "#FFE8A3", fg: "#6A4B00" },
    statusApproved: { bg: "#D1F3DA", fg: "#0E6B2B" },
    statusCompleted: { bg: "#B4E1FA", fg: "#0F4C75" },
    statusRejected: { bg: "#FAD2D2", fg: "#8B1A1A" },

    // Gráficos
    chartAxis: "#e5e7eb",
    chartRules: "#f0f0f0",
  },

  dark: {
    text: "#FFFFFF",
    textSecondary: "#DDDDDD",
    textMuted: "#9CA3AF",
    textTertiary: "#6B7280",
    background: "#121212",
    backgroundSecondary: "#1A1A1A",
    backgroundTertiary: "#222222",
    card: "#1E1E1E",
    border: "#333333",
    borderLight: "#2A2A2A",
    disabled: "#444444",
    shadow: "#000000",
    icon: "#FFFFFF",

    // 👇 Igual que en modo claro
    tint: brandYellow,

    // Principales
    primary: brandYellow,
    secondary: brandPurple,
    success: "#66BB6A",
    danger: "#EF5350",
    warning: "#FFC107",
    info: "#42A5F5",

    // Navbar y Tabs
    navBackground: brandYellow,
    navIconActive: brandPurple,
    navIconInactive: "#888888",
    navActiveTabBg: "#333333",
    navAddButton: brandPurple,

    tabIconDefault: "#888888",
    tabIconSelected: brandYellow,

    // Estados de solicitudes (ajustados para modo oscuro con mejor contraste)
    statusPending: { bg: "#554400", fg: "#FFE8A3" },
    statusApproved: { bg: "#0E4B1F", fg: "#A5D6A7" },
    statusCompleted: { bg: "#0F3A5A", fg: "#90CAF9" },
    statusRejected: { bg: "#5A1A1A", fg: "#EF9A9A" },

    // Gráficos
    chartAxis: "#444444",
    chartRules: "#2A2A2A",
  },

  // 👇 Accesos rápidos (para uso directo sin depender del tema)
  primary: brandYellow,
  secondary: brandPurple,
  yellow: brandYellow,
  purple: brandPurple,
  danger: brandRed,
  gray: brandGray,
}

