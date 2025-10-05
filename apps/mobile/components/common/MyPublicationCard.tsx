import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

interface Publication {
    id: string
    name: string
    image: string | number
    publishedDate: string
    status: "activo" | "inactivo" | "cerrado"
    requestsCount: number
}

interface MyPublicationCardProps {
    publication: Publication
    onViewRequests: () => void
    onToggleStatus: () => void
    onEdit: () => void
    onDelete: () => void
}

export default function MyPublicationCard({
    publication,
    onViewRequests,
    onToggleStatus,
    onEdit,
    onDelete,
}: MyPublicationCardProps) {
    const getStatusConfig = (status: Publication["status"]) => {
        switch (status) {
            case "activo":
                return {
                    label: "Activa",
                    backgroundColor: "#4CAF50",
                    textColor: "#fff",
                }
            case "inactivo":
                return {
                    label: "Inactiva",
                    backgroundColor: "#FF9800",
                    textColor: "#fff",
                }
            case "cerrado":
                return {
                    label: "Cerrada",
                    backgroundColor: "#F44336",
                    textColor: "#fff",
                }
        }
    }

    const statusConfig = getStatusConfig(publication.status)

    const getActionButton = () => {
        if (publication.status === "cerrado") {
            return (
                <TouchableOpacity style={styles.disabledButton} disabled>
                    <Text style={styles.disabledButtonText}>No disponible</Text>
                </TouchableOpacity>
            )
        }

        return (
            <TouchableOpacity style={styles.actionButton} onPress={onViewRequests}>
                <Text style={styles.actionButtonText}>Revisar Solicitudes</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <Image
                source={
                    typeof publication.image === "string"
                        ? { uri: publication.image }
                        : publication.image
                }
                style={styles.image}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name}>{publication.name}</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                            <Text style={styles.deleteButtonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.secondRow}>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusConfig.backgroundColor },
                        ]}
                    >
                        <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.publishDateContainer}>
                    <Text style={styles.publishDateLabel}>Publicado el:</Text>
                    <Text style={styles.publishDateValue}>{publication.publishedDate}</Text>
                </View>

                <View style={styles.actions}>{getActionButton()}</View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: width * 0.25,
        height: width * 0.25,
        borderRadius: 8,
        marginRight: 16,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    secondRow: {
        marginBottom: 8,
    },
    headerRight: {
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        marginRight: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    publishDateContainer: {
        marginBottom: 12,
    },
    publishDateLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
        marginBottom: 2,
    },
    publishDateValue: {
        fontSize: 13,
        color: "#333",
        fontWeight: "600",
    },
    actions: {
        alignSelf: "flex-start",
    },
    actionButton: {
        backgroundColor: "#FBC02D",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    editButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    deleteButton: {
        backgroundColor: "#FF3B30",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    disabledButton: {
        backgroundColor: "#E0E0E0",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    disabledButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#999",
    },
})
