import React, { useEffect, useMemo, useState, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Platform,
} from "react-native"
import MyPublicationCard from "@/components/common/MyPublicationCard"
import { getLocalPets } from "@/services/petStorage"

const { width } = Dimensions.get("window")

type FilterType = "all" | "pending" | "adopted" | "no-requests"

type PubItem = {
  id: string
  name: string
  image: string
  publishedDate: string
  status: "active" | "inactive" | "closed"
  requestsCount: number
}

const toAbsoluteMediaUrl = (u?: string): string | undefined => {
  if (!u) return undefined
  if (/^https?:\/\//i.test(u)) return u
  const base =
    (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_MEDIA_BASE?.trim()) ||
    (Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080")
  return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`
}

export default function MyPublications() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all")
  const [items, setItems] = useState<PubItem[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const filters = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendientes" },
    { key: "adopted", label: "Adoptados" },
    { key: "no-requests", label: "Sin Solicitud" },
  ]

  const load = useCallback(async () => {
    const locals = await getLocalPets()
    const mapped: PubItem[] = locals.map((p) => ({
      id: `local-${p.id}`,
      name: p.name,
      image: toAbsoluteMediaUrl(p.imageUrls?.[0]) ?? "https://placehold.co/400x400?text=Mascota",
      publishedDate: new Date(p.createdAt).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "active",
      requestsCount: 0,
    }))
    setItems(mapped)
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const filteredPublications = useMemo(() => {
    return items.filter((publication) => {
      switch (selectedFilter) {
        case "pending":
          return publication.status === "active" && publication.requestsCount > 0
        case "adopted":
          return publication.status === "closed"
        case "no-requests":
          return publication.requestsCount === 0
        default:
          return true
      }
    })
  }, [items, selectedFilter])

  const renderPublication = ({ item }: { item: PubItem }) => (
    <MyPublicationCard
      publication={item}
      onViewRequests={() => console.log("Ver solicitudes para", item.name)}
      onToggleStatus={() => console.log("Cambiar estado (offline)", item.name)}
      onEdit={() => console.log("Editar publicación", item.name)}
      onDelete={() => {
        console.log("Eliminar publicación (offline)", item.name)
      }}
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
      </View>

      <Text style={styles.subtitle}>Revisa tus publicaciones de adopción</Text>

      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key as FilterType)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPublications}
        renderItem={renderPublication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: "center", color: "#666" }}>
              Aún no tienes publicaciones.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F9C80E",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  subtitle: { fontSize: 14, color: "#666", paddingHorizontal: 20, paddingVertical: 15 },
  filtersContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20, flexWrap: "wrap", gap: 10 },
  filterButton: { backgroundColor: "#E0E0E0", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterButtonActive: { backgroundColor: "#FBC02D" },
  filterText: { fontSize: 14, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#000", fontWeight: "600" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
})