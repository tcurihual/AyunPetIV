import AsyncStorage from "@react-native-async-storage/async-storage"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"
const PREFS_DONE_KEY = "prefs_done"

export async function saveToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token)
}
export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY)
}

export async function saveUser<T>(user: T) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
}
export async function getUser<T>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
}

export async function clearAuth() {
    await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)])
}

export async function setPrefsDone() {
    await AsyncStorage.setItem(PREFS_DONE_KEY, "1")
}

/** Retorna true si el usuario ya completó preferencias */
export async function hasPrefsDone(): Promise<boolean> {
    try {
        const v = await AsyncStorage.getItem(PREFS_DONE_KEY)
        return v === "1"
    } catch (e) {
        console.error("Error leyendo PREFS_DONE:", e)
        return false
    }
}

export async function FirstLaunch() {
    await AsyncStorage.setItem("first_launch", "true")
}
export async function isFirstLaunch(): Promise<boolean> {
    try {
        const hasLaunched = await AsyncStorage.getItem("first_launch")
        return hasLaunched === null
    } catch (error) {
        console.error("Error al leer AsyncStorage:", error)
        return false
    }
}
