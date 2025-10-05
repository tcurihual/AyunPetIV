import AsyncStorage from "@react-native-async-storage/async-storage"

const PETS_STORAGE_KEY = "ayun_pets_storage"

export interface Pet {
    id: string
    name: string
    species: string
    gender: string
    age: number
    size: string
    description: string
    sterilized: boolean
    adopted: boolean
    ownerId: string
    status: "activo" | "inactivo" | "cerrado"
    createdAt: string
    updatedAt: string
    imageId?: number
}

const initializePetsFromMock = async (): Promise<Pet[]> => {
    const mockData = require("@/data/mockData").default
    const initialPets: Pet[] = mockData.pet.map((pet: any) => ({
        id: pet.id.toString(),
        name: pet.name,
        species: pet.species,
        gender: pet.gender,
        age: pet.age,
        size: pet.size,
        description: pet.description,
        sterilized: pet.sterilized,
        adopted: pet.adopted,
        ownerId: pet.ownerid.toString(),
        status: pet.adopted ? "cerrado" : "activo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageId: pet.id, // Para mapear a las imágenes
    }))

    await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(initialPets))
    return initialPets
}

export const getAllPets = async (): Promise<Pet[]> => {
    try {
        const storedPets = await AsyncStorage.getItem(PETS_STORAGE_KEY)
        if (storedPets) {
            return JSON.parse(storedPets)
        } else {
            return await initializePetsFromMock()
        }
    } catch (error) {
        console.error("Error getting pets from storage:", error)
        return []
    }
}

export const getPetsByOwner = async (ownerId: string): Promise<Pet[]> => {
    const allPets = await getAllPets()
    return allPets.filter((pet) => pet.ownerId === ownerId)
}

export const getPetById = async (petId: string): Promise<Pet | null> => {
    const allPets = await getAllPets()
    return allPets.find((pet) => pet.id === petId) || null
}

export const updatePet = async (petId: string, updatedData: Partial<Pet>): Promise<boolean> => {
    try {
        const allPets = await getAllPets()
        const petIndex = allPets.findIndex((pet) => pet.id === petId)

        if (petIndex === -1) {
            return false
        }

        allPets[petIndex] = {
            ...allPets[petIndex],
            ...updatedData,
            updatedAt: new Date().toISOString(),
        }

        await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(allPets))
        return true
    } catch (error) {
        console.error("Error updating pet:", error)
        return false
    }
}

export const createPet = async (
    petData: Omit<Pet, "id" | "createdAt" | "updatedAt">
): Promise<Pet | null> => {
    try {
        const allPets = await getAllPets()
        const newId = (Math.max(...allPets.map((p) => parseInt(p.id)), 0) + 1).toString()

        const newPet: Pet = {
            ...petData,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        allPets.push(newPet)
        await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(allPets))
        return newPet
    } catch (error) {
        console.error("Error creating pet:", error)
        return null
    }
}

export const deletePet = async (petId: string): Promise<boolean> => {
    try {
        const allPets = await getAllPets()
        const filteredPets = allPets.filter((pet) => pet.id !== petId)

        await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(filteredPets))
        return true
    } catch (error) {
        console.error("Error deleting pet:", error)
        return false
    }
}

export const clearAllPets = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(PETS_STORAGE_KEY)
    } catch (error) {
        console.error("Error clearing pets:", error)
    }
}

export const getPetImage = (imageId?: number): number | string => {
    if (imageId === 101) return require("@/assets/images/perro1.jpg")
    if (imageId === 102) return require("@/assets/images/Gato1-1.jpg")
    if (imageId === 103) return require("@/assets/images/perro2.jpg")
    if (imageId === 104) return require("@/assets/images/Gato1-2.jpg")
    return "https://placehold.co/400x400?text=Mascota"
}
