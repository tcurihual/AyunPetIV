import AsyncStorage from "@react-native-async-storage/async-storage"

const TOKEN_KEY = "@ayunpet/token"
const USER_KEY = "@ayunpet/user"

export const saveToken = (t: string) => AsyncStorage.setItem(TOKEN_KEY, t)
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY)
export const removeToken = () => AsyncStorage.removeItem(TOKEN_KEY)

export async function saveUser(user: unknown) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function getUser<T = any>() {
    const raw = await AsyncStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as T) : null
}

export const removeUser = () => AsyncStorage.removeItem(USER_KEY)

export async function clearAuth() {
    await Promise.all([removeToken(), removeUser()])
}
