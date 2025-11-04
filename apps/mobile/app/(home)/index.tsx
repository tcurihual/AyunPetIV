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
    RefreshControl,
    useColorScheme,
} from "react-native"
import { useRouter } from "expo-router"
import PublicationCard from "@/components/common/PublicationCard"
import FilterModal, { FilterOptions } from "@/components/common/modals/FilterModal"
import { hasPrefsDone } from "@/utils/storage"
import { useAuthContext } from "@/context/AuthContext"
import { usePublications } from "@/context/PublicationContext"
import { useAlert } from "@/context/AlertContext"
import { Colors } from "../../constants/Colors"

// import petsData from "@/assets/data/pets.json"

const { width } = Dimensions.get("window")

const toAbsoluteMediaUrl = (u?: string): string | undefined => {
    if (!u) return undefined
    if (/^https?:\/\//i.test(u)) return u
    const base = process.env.EXPO_PUBLIC_MEDIA_BASE?.trim()
    if (!base) return u
    return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`
}

export default function Home() {
    const router = useRouter()
    const { user } = useAuthContext()
    const { petsForHome, loading, error, refreshPublications, clearError } = usePublications()

    const colorScheme = useColorScheme() ?? "light"
    const themeColors = Colors[colorScheme]

    //    const petsForHome = petsData
    //    const loading = false
    //    const error = null
    //    const refreshPublications = async () => {}
    //    const clearError = () => {}

    const { showAlert } = useAlert()

    const [checking, setChecking] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false)
    const [activeFilters, setActiveFilters] = useState<FilterOptions>({
        type: "all",
        gender: "all",
        age: "all",
    })
    const [refreshing, setRefreshing] = useState(false)

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

    // Mostrar errores al usuario
    useEffect(() => {
        if (error) {
            showAlert(error, "error")
            clearError()
        }
    }, [error, showAlert, clearError])

    const getFilteredPets = (pets: any[], category: string, filters: FilterOptions) => {
        const toType = (species?: string) => {
            const s = (species ?? "").toLowerCase()
            if (s === "perro" || s === "dog") return "dog"
            if (s === "gato" || s === "cat") return "cat"
            return "other"
        }

        const matchAge = (ageStr: string, bucket: string) => {
            const num = parseInt(ageStr as string) || 0
            if (bucket === "puppy") return num <= 1
            if (bucket === "young") return num >= 1 && num <= 3
            if (bucket === "adult") return num >= 3 && num <= 7
            if (bucket === "senior") return num > 7
            return true
        }

        return pets.filter((pet) => {
            const petType = toType(pet.species as unknown as string)

            if (category === "dog" && petType !== "dog") return false
            if (category === "cat" && petType !== "cat") return false

            if (filters.type !== "all" && petType !== filters.type) return false

            if (filters.gender !== "all") {
                const petGender = String(pet.gender ?? "").toLowerCase()
                if (
                    filters.gender === "male" &&
                    !petGender.includes("macho") &&
                    !petGender.includes("male")
                )
                    return false
                if (
                    filters.gender === "female" &&
                    !petGender.includes("hembra") &&
                    !petGender.includes("female")
                )
                    return false
            }

            if (filters.age !== "all" && !matchAge(String(pet.age), filters.age)) return false

            return true
        })
    }

    const filteredPets = useMemo(
        () => getFilteredPets(petsForHome, selectedCategory, activeFilters),
        [petsForHome, selectedCategory, activeFilters]
    )

    const handleApplyFilters = (filters: FilterOptions) => {
        setActiveFilters(filters)
        if (filters.type !== "all") setSelectedCategory("all")
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            await refreshPublications()
        } catch (err) {
            showAlert("Error al actualizar las publicaciones", "error")
        } finally {
            setRefreshing(false)
        }
    }

    const renderPetItem = ({ item }: { item: any }) => (
        <View style={[styles.cardContainer, { backgroundColor: themeColors.card }]}>
            <PublicationCard pet={item} />
        </View>
    )

    if (checking) {
        return (
            <View style={[styles.loader, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size="large" />
                <Text style={[styles.loaderText, { color: themeColors.text }]}>
                    Preparando tu inicio…
                </Text>
            </View>
        )
    }

    return (
        // 6. Aplicar color de fondo al contenedor principal
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* 7. Aplicar color de fondo a la sección de categorías */}
            <View style={[styles.categoriesSection, { backgroundColor: themeColors.background }]}>
                {/* 8. Aplicar color de texto al título */}
                <Text style={[styles.categoriesTitle, { color: themeColors.text }]}>
                    Categorías
                </Text>
                <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            { backgroundColor: themeColors.card }, // 9. Color de tarjeta
                            selectedCategory === "dog" && {
                                backgroundColor: themeColors.tint, // Color mostaza
                            },
                        ]}
                        onPress={() => setSelectedCategory("dog")}
                    >
                        <Text style={styles.categoryEmoji}>🐕</Text>
                        <Text style={[styles.categoryText, { color: themeColors.text }]}>
                            Perro
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            { backgroundColor: themeColors.card }, // 10. Color de tarjeta
                            selectedCategory === "cat" && {
                                backgroundColor: themeColors.tint, // Color mostaza
                            },
                        ]}
                        onPress={() => setSelectedCategory("cat")}
                    >
                        <Text style={styles.categoryEmoji}>🐱</Text>
                        <Text style={[styles.categoryText, { color: themeColors.text }]}>Gato</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            { backgroundColor: themeColors.card }, // 11. Color de tarjeta
                            (showFilterModal ||
                                activeFilters.type !== "all" ||
                                activeFilters.gender !== "all" ||
                                activeFilters.age !== "all") && {
                                backgroundColor: themeColors.tint, // Color mostaza
                            },
                        ]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Image
                            source={require("@/assets/images/filtrar.png")}
                            style={styles.categoryIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            { backgroundColor: themeColors.card }, // 12. Color de tarjeta
                        ]}
                        onPress={() => router.push("/(home)/my-publications")}
                    >
                        <Text style={styles.categoryEmoji}>📋</Text>
                        <Text style={[styles.categoryText, { color: themeColors.text }]}>
                            Mis Publicaciones
                        </Text>
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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.tint]} // 13. Color mostaza
                        tintColor={themeColors.tint} // 14. Color mostaza
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <>
                                <ActivityIndicator size="large" color={themeColors.tint} />
                                <Text style={[styles.emptyText, { color: themeColors.text }]}>
                                    Cargando publicaciones...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.emptyEmoji}>🐾</Text>
                                <Text
                                    style={[
                                        styles.emptyText,
                                        { color: themeColors.text, opacity: 0.7 },
                                    ]}
                                >
                                    No hay publicaciones disponibles
                                </Text>
                                <Text
                                    style={[
                                        styles.emptySubtext,
                                        { color: themeColors.text, opacity: 0.5 },
                                    ]}
                                >
                                    Desliza hacia abajo para actualizar
                                </Text>
                            </>
                        )}
                    </View>
                )}
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
    container: { flex: 1, marginTop: 16 },
    categoriesSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    categoriesTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    categoriesContainer: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
    categoryButton: {
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
    categoryButtonActive: {
        backgroundColor: "#FFD700",
    },
    categoryEmoji: { fontSize: 16, lineHeight: 18 },
    categoryIcon: { width: 16, height: 16, resizeMode: "contain" },
    categoryText: { fontSize: 14, fontWeight: "600" },
    petsGrid: { paddingHorizontal: 16, paddingBottom: 20 },
    row: { justifyContent: "space-between" },
    cardContainer: {
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 1,
        flex: 1,
        maxWidth: (width - 48) / 2,
        marginBottom: 16,
    },
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loaderText: { marginTop: 8 },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtext: { fontSize: 14, textAlign: "center" },
})
