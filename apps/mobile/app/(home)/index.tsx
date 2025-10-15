import React, { useEffect, useMemo, useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    Image,
    ActivityIndicator,
    Platform,
} from "react-native"
import { useRouter } from "expo-router"
import PublicationCard from "@/components/common/PublicationCard"
import FilterModal, { FilterOptions } from "@/components/common/modals/FilterModal"
import { Pet } from "@/interfaces/pet"
import ayunData from "@/data/mockData"
import { hasPrefsDone } from "@/utils/storage"
import { getLocalPets } from "@/services/petStorage"
import { useAuthContext } from "@/context/AuthContext"
import { toMediaUrl } from "@/utils/mediaUrl"

const { width } = Dimensions.get("window")

export default function Home() {
    const router = useRouter()

    const [checking, setChecking] = useState(true)

    const [localPets, setLocalPets] = useState<Pet[]>([])
    const [speciesMap, setSpeciesMap] = useState<Map<string, string>>(new Map())

    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false)
    const [activeFilters, setActiveFilters] = useState<FilterOptions>({
        type: "all",
        gender: "all",
        age: "all",
    })

    const { user } = useAuthContext()
    useEffect(() => {
        ;(async () => {
            const done = await hasPrefsDone()
            if (!done) {
                router.replace("/(home)/IntermediateView")
                return
            }
            setChecking(false)
        })()
    }, [router])

    const toType = (species?: string) => {
        const s = (species ?? "").toLowerCase()
        if (s === "perro") return "dog"
        if (s === "gato") return "cat"
        return "other"
    }

    const userNameById = useMemo(() => {
        const map = new Map<number, string>()
        for (const u of ayunData.users ?? []) {
            if (u?.id != null) map.set(u.id, u.name ?? u.email ?? "Usuario")
        }
        return map
    }, [])

    useEffect(() => {
        const base = new Map<string, string>()
        for (const p of ayunData.pet ?? []) base.set(String(p.id), p.species ?? "")
        setSpeciesMap(base)
    }, [])

    const assetByName: Record<string, any> = {
        firulais: require("@/assets/images/perro1.jpg"),
        michi: require("@/assets/images/Gato1-1.jpg"),
        rocky: require("@/assets/images/perro2.jpg"),
        luna: require("@/assets/images/Gato1-2.jpg"),
    }
    const resolveMockImage = (name?: string) => {
        const key = (name ?? "").toLowerCase().trim()
        return assetByName[key]
    }

    const dataPets: Pet[] = useMemo(() => {
        return (ayunData.pet ?? []).map((p) => ({
            id: String(p.id),
            name: p.name,
            gender: p.gender,
            age: `${p.age} años`,
            publisher: userNameById.get(p.ownerid) ?? "Fundación Demo",
            description: p.description,
            image: resolveMockImage(p.name),
        }))
    }, [userNameById])

    useEffect(() => {
        ;(async () => {
            try {
                const locals = await getLocalPets()
                const mapped: Pet[] = locals.map((p) => {
                    const abs =
                        toMediaUrl(p.imageUrls?.[0]) ||
                        "https://placehold.co/400x400?text=Mascota"
                    return {
                        id: `local-${p.id}`,
                        name: p.name,
                        gender: p.gender,
                        age: `${p.ageYears} años`,
                        publisher: p.ownerName || "Yo",
                        description: p.description ?? "",
                        image: { uri: abs },
                    }
                })
                setLocalPets(mapped)

                setSpeciesMap((prev) => {
                    const next = new Map(prev)
                    for (const p of locals) next.set(`local-${p.id}`, p.species ?? "")
                    return next
                })
            } catch {}
        })()
    }, [])

    const mergedPets: Pet[] = useMemo(() => {
        const seen = new Set<string>()
        const out: Pet[] = []
        for (const p of localPets) {
            if (!seen.has(p.id)) {
                out.push(p)
                seen.add(p.id)
            }
        }
        for (const p of dataPets) {
            if (!seen.has(p.id)) {
                out.push(p)
                seen.add(p.id)
            }
        }
        return out
    }, [localPets, dataPets])

    const matchAge = (ageStr: string, bucket: string) => {
        const num = parseInt(ageStr) || 0
        if (bucket === "young") return num <= 2
        if (bucket === "adult") return num >= 3 && num <= 6
        if (bucket === "senior") return num > 6
        return true
    }

    const filteredPets = useMemo(() => {
        return mergedPets.filter((pet) => {
            const species = speciesMap.get(pet.id)
            const petType = toType(species)

            if (selectedCategory === "dog" && petType !== "dog") return false
            if (selectedCategory === "cat" && petType !== "cat") return false

            if (activeFilters.type !== "all" && petType !== activeFilters.type) return false

            if (activeFilters.gender !== "all") {
                if (activeFilters.gender === "male" && pet.gender !== "Macho") return false
                if (activeFilters.gender === "female" && pet.gender !== "Hembra") return false
            }

            if (activeFilters.age !== "all" && !matchAge(pet.age, activeFilters.age)) return false

            return true
        })
    }, [mergedPets, selectedCategory, activeFilters, speciesMap])

    const handleApplyFilters = (filters: FilterOptions) => {
        setActiveFilters(filters)
        if (filters.type !== "all") setSelectedCategory("all")
    }

    const renderPetItem = ({ item }: { item: Pet }) => (
        <View style={styles.cardContainer}>
            <PublicationCard pet={item} />
        </View>
    )

    if (checking) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
                <Text style={styles.loaderText}>Preparando tu inicio…</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.categoriesSection}>
                <Text style={styles.categoriesTitle}>Categorías</Text>
                <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            selectedCategory === "dog" && styles.categoryButtonActive,
                        ]}
                        onPress={() => setSelectedCategory("dog")}
                    >
                        <Text style={styles.categoryEmoji}>🐕</Text>
                        <Text style={styles.categoryText}>Perro</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            selectedCategory === "cat" && styles.categoryButtonActive,
                        ]}
                        onPress={() => setSelectedCategory("cat")}
                    >
                        <Text style={styles.categoryEmoji}>🐱</Text>
                        <Text style={styles.categoryText}>Gato</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            (activeFilters.type !== "all" ||
                                activeFilters.gender !== "all" ||
                                activeFilters.age !== "all") &&
                                styles.categoryButtonActive,
                        ]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Image
                            source={require("@/assets/images/filtrar.png")}
                            style={styles.categoryIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => router.push("/(home)/my-publications")}
                    >
                        <Text style={styles.categoryEmoji}>📋</Text>
                        <Text style={styles.categoryText}>Mis Publicaciones</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredPets}
                renderItem={renderPetItem}
                numColumns={2}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.petsGrid}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />

            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onApplyFilters={handleApplyFilters}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, marginTop: 16, backgroundColor: "#fff" },
    categoriesSection: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#fff" },
    categoriesTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 12 },
    categoriesContainer: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
    categoryButton: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryButtonActive: { backgroundColor: "#FFD700" },
    categoryEmoji: { fontSize: 16, lineHeight: 18 },
    categoryIcon: { width: 16, height: 16, resizeMode: "contain" },
    categoryText: { fontSize: 14, fontWeight: "600", color: "#000" },
    petsGrid: { paddingHorizontal: 16, paddingBottom: 20 },
    row: { justifyContent: "space-between" },
    cardContainer: {
        flex: 1,
        maxWidth: (width - 48) / 2,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
    loaderText: { marginTop: 8, color: "#000" },
})
