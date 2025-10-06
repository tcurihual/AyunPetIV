import AsyncStorage from "@react-native-async-storage/async-storage"
import mock from "@/data/mockData"

export type RoleType = "fundacion" | "adoptante"

export type Session = {
    token: string
    userId: number
    roleId: number
    email: string
    name: string
}

export type MockUser = {
    id: number
    role: number
    email: string
    name: string
    password?: string
    avatar?: string
    phone?: string
    address?: string
    city?: string
    region?: string
    rut?: string
    description?: string
}

const STORAGE = {
    USERS: "ayun.mock.users.added",
    SESSION: "ayun.mock.session",
}

const normalizeEmail = (e: string) => e.trim().toLowerCase()

const roleIdByType = (t: RoleType) =>
    (mock.role as Array<{ id: number; roletype: string }>).find((r) => r.roletype === t)?.id ?? 2

const tokenGen = (userId: number, email: string) =>
    `mock.${userId}.${Date.now()}.${Math.random().toString(36).slice(2)}`

function nextUserId(all: MockUser[]) {
    return Math.max(0, ...all.map((u) => u.id)) + 1
}

export async function getAddedUsers(): Promise<MockUser[]> {
    const raw = await AsyncStorage.getItem(STORAGE.USERS)
    return raw ? JSON.parse(raw) : []
}

export async function saveAddedUsers(users: MockUser[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE.USERS, JSON.stringify(users))
}

export async function getAllUsers(): Promise<MockUser[]> {
    const base = (mock.users as unknown as MockUser[]) ?? []
    const added = await getAddedUsers()
    return [...base, ...added]
}

export async function getUserById(id: number): Promise<MockUser | null> {
    const all = await getAllUsers()
    return all.find((u) => u.id === id) ?? null
}

export async function getUserByEmail(email: string): Promise<MockUser | null> {
    const all = await getAllUsers()
    const e = normalizeEmail(email)
    return all.find((u) => normalizeEmail(u.email) === e) ?? null
}

// ---------- “Endpoints” MOCK ----------
/**
 * Login mock: valida email y (opcionalmente) password.
 * Si el usuario tiene `password` definida en el mock/added, se exige coincidencia exacta.
 * Si no tiene `password`, no se valida la contraseña (modo “compat”).
 */
export async function login(email: string, password: string = "mock"): Promise<Session> {
    const user = await getUserByEmail(email)
    if (!user) {
        throw new Error("Usuario no encontrado. Regístrate para continuar.")
    }

    if (
        typeof user.password === "string" &&
        user.password.length > 0 &&
        user.password !== password
    ) {
        throw new Error("Contraseña incorrecta.")
    }

    const token = tokenGen(user.id, user.email)
    const session: Session = {
        token,
        userId: user.id,
        roleId: user.role,
        email: user.email,
        name: user.name,
    }

    await AsyncStorage.setItem(STORAGE.SESSION, JSON.stringify(session))
    return session
}

/**
 * Register mock: crea usuario persistente en AsyncStorage y hace autologin.
 * Si `password` no viene, se usa "mock".
 */
export async function register(params: {
    email: string
    name: string
    role: RoleType
    password?: string
}): Promise<Session> {
    const e = normalizeEmail(params.email)
    const base = (mock.users as unknown as MockUser[]) ?? []
    const added = await getAddedUsers()
    const all = [...base, ...added]

    if (all.some((u) => normalizeEmail(u.email) === e)) {
        throw new Error("El correo ya está registrado.")
    }

    const newUser: MockUser = {
        id: nextUserId(all),
        role: roleIdByType(params.role),
        email: e,
        name: params.name.trim(),
        password: params.password ?? "mock",
    }

    await saveAddedUsers([...added, newUser])

    return login(newUser.email, newUser.password!)
}

export async function restoreSession(): Promise<Session | null> {
    const raw = await AsyncStorage.getItem(STORAGE.SESSION)
    return raw ? (JSON.parse(raw) as Session) : null
}

export async function logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE.SESSION)
}

export async function clearMockAuth() {
    await AsyncStorage.multiRemove([STORAGE.USERS, STORAGE.SESSION])
}
