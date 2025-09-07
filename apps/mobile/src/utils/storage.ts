import AsyncStorage from "@react-native-async-storage/async-storage"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

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
