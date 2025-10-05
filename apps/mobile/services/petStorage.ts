import AsyncStorage from "@react-native-async-storage/async-storage"

export type LocalPet = {
  id: string
  ownerName: string
  name: string
  gender: "Macho" | "Hembra"
  ageYears: number
  species: "Perro" | "Gato" | "Otro"
  description?: string
  imageUrls: string[]
  createdAt: string
}

const KEY = "ayun.local.pets"

export async function addLocalPet(p: LocalPet) {
  const all = await getLocalPets()
  all.unshift(p)
  await AsyncStorage.setItem(KEY, JSON.stringify(all))
}

export async function getLocalPets(): Promise<LocalPet[]> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as LocalPet[]) : []
}

export async function clearLocalPets() {
  await AsyncStorage.removeItem(KEY)
}