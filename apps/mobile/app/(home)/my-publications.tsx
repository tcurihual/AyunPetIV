import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    SafeAreaView,
} from "react-native"
import MyPublicationCard from "@/components/common/MyPublicationCard"

const { width } = Dimensions.get("window")

const mockUserPublications = [
    {
        id: "1",
        name: "Dogito",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
        publishedDate: "11 de Abril de 2025",
        status: "active" as const,
        requestsCount: 3,
    },
    {
        id: "2",
        name: "Firulais",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400",
        publishedDate: "11 de Abril de 2025",
        status: "inactive" as const,
        requestsCount: 1,
    },
    {
        id: "3",
        name: "Scott",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
        publishedDate: "11 de Abril de 2025",
        status: "closed" as const,
        requestsCount: 0,
    },
]

type FilterType = "all" | "pending" | "adopted" | "no-requests"

export default function MyPublications() {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all")

    const filters = [
        { key: "all", label: "Todas" },
        { key: "pending", label: "Pendientes" },
        { key: "adopted", label: "Adoptados" },
        { key: "no-requests", label: "Sin Solicitud" },
    ]

    const filteredPublications = mockUserPublications.filter((publication) => {
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

    const renderPublication = ({ item }: { item: (typeof mockUserPublications)[0] }) => (
        <MyPublicationCard
            publication={item}
            onViewRequests={() => console.log("Ver solicitudes para", item.name)}
            onToggleStatus={() => console.log("Cambiar estado de", item.name)}
            onEdit={() => console.log("Editar publicación", item.name)}
            onDelete={() => console.log("Eliminar publicación", item.name)}
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
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#FFD24C",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    filtersContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 10,
    },
    filterButton: {
        backgroundColor: "#E0E0E0",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterButtonActive: {
        backgroundColor: "#FBC02D",
    },
    filterText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    filterTextActive: {
        color: "#000",
        fontWeight: "600",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
})
