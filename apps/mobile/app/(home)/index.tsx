import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import PublicationCard from "@/components/common/PublicationCard"
import FilterModal, { FilterOptions } from "@/components/common/modals/FilterModal"
import { Pet } from "@/interfaces/pet"
import { mockPets } from "@/data/mockPets"
import { hasPrefsDone } from "@/utils/storage" // <-- NUEVO

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true) // <-- NUEVO

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    type: "all",
    gender: "all",
    age: "all",
  })

  // --- Guardia de preferencias (primera vez) ---
  useEffect(() => {
    (async () => {
      const done = await hasPrefsDone()
      if (!done) {
        router.replace("/(home)/intermediate")
        return
      }
      setChecking(false)
    })()
  }, [router])

  const filteredPets = mockPets.filter((pet) => {
    if (selectedCategory === "dog") {
      if (!(pet.name === "Firulais" || pet.name === "Ayudante de Santa")) return false
    }
    if (selectedCategory === "cat") {
      if (!(pet.name === "Pelusa" || pet.name === "Bola de nieve")) return false
    }

    if (activeFilters.type !== "all") {
      if (activeFilters.type === "dog" && !(pet.name === "Firulais" || pet.name === "Ayudante de Santa")) return false
      if (activeFilters.type === "cat" && !(pet.name === "Pelusa" || pet.name === "Bola de nieve")) return false
    }

    if (activeFilters.gender !== "all") {
      if (activeFilters.gender === "male" && pet.gender !== "Macho") return false
      if (activeFilters.gender === "female" && pet.gender !== "Hembra") return false
    }

    return true
  })

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters)
    if (filters.type !== "all") {
      setSelectedCategory("all")
    }
  }

  const renderPetItem = ({ item }: { item: Pet }) => (
    <View style={styles.cardContainer}>
      <PublicationCard pet={item} />
    </View>
  )

  // --- Loader mientras se verifica el flag ---
  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: "#000" }}>Preparando tu inicio…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>Categorías</Text>
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === "dog" && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory("dog")}
          >
            <Text style={styles.categoryIcon}>🐕</Text>
            <Text style={styles.categoryText}>Perro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === "cat" && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory("cat")}
          >
            <Text style={styles.categoryIcon}>🐱</Text>
            <Text style={styles.categoryText}>Gato</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryButton,
              (activeFilters.type !== "all" || activeFilters.gender !== "all" || activeFilters.age !== "all") &&
                styles.categoryButtonActive,
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Image source={require("@/assets/images/filtrar.png")} style={styles.categoryIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredPets}
        renderItem={renderPetItem}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.petsGrid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal visible={showFilterModal} onClose={() => setShowFilterModal(false)} onApplyFilters={handleApplyFilters} />
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 16,
        backgroundColor: "#fff",
    },
    categoriesSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#fff",
    },
    categoriesTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 12,
    },
    categoriesContainer: {
        flexDirection: "row",
        gap: 12,
    },
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
    categoryButtonActive: {
        backgroundColor: "#FFD700",
    },
    categoryIcon: {
        width: 16,
        height: 16,
        resizeMode: "contain",
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    petsGrid: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    row: {
        justifyContent: "space-between",
    },
    cardContainer: {
        flex: 1,
        maxWidth: (width - 48) / 2,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
})
