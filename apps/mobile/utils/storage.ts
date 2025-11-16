import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"

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

export async function clearToken() {
    await AsyncStorage.removeItem(TOKEN_KEY)
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

export async function isFirstLaunch(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem("first_launch")
        return value === null || value === undefined
    } catch (error) {
        console.error("Error al leer AsyncStorage:", error)
        return false
    }
}

export async function getFirstLaunch() {
    await AsyncStorage.getItem("first_launch")
}

export async function markFirstLaunch() {
    await AsyncStorage.setItem("first_launch", "done")
}

export async function savePlainPassword(password: string) {
    await SecureStore.setItemAsync("plainPassword", password)
}

export async function getPlainPassword() {
    return await SecureStore.getItemAsync("plainPassword")
}

const HAS_COMPLETED_AUTH_KEY = "@ayun/has_completed_auth"

export async function saveHasCompletedAuth(value: boolean) {
    try {
        await AsyncStorage.setItem(HAS_COMPLETED_AUTH_KEY, value ? "true" : "false")
    } catch (e) {
        console.error("Error saving hasCompletedAuth", e)
    }
}

export async function getHasCompletedAuth(): Promise<boolean> {
    try {
        const stored = await AsyncStorage.getItem(HAS_COMPLETED_AUTH_KEY)
        return stored === "true"
    } catch (e) {
        console.error("Error getting hasCompletedAuth", e)
        return false
    }
}

export async function clearHasCompletedAuth() {
    try {
        await AsyncStorage.removeItem(HAS_COMPLETED_AUTH_KEY)
    } catch (e) {
        console.error("Error clearing hasCompletedAuth", e)
    }
}
