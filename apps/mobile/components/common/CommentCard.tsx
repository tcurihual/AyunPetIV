import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColor } from "@/hooks/useThemeColor"

export type Comment = {
    id: string | number
    ownerName: string
    ownerAvatar?: string | null
    createdAt: string
    text: string
    ownerId?: number
}

type Props = {
    comment: Comment
    currentUserId?: number
    isAdmin?: boolean
    onEdit?: (id: string | number, newText: string) => Promise<void>
    onDelete?: (id: string | number) => Promise<void>
    onReport?: (id: string | number) => void
}

export function CommentCard({
    comment,
    currentUserId,
    isAdmin,
    onEdit,
    onDelete,
    onReport,
}: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(comment.text)
    const [isLoading, setIsLoading] = useState(false)
    
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const bgColor = useThemeColor({}, "background")
    const borderColor = useThemeColor({}, "border")
    const tintColor = useThemeColor({}, "tint")

    const isOwner = comment.ownerId === currentUserId
    const canEdit = isOwner
    const canDelete = isOwner || isAdmin

    const handleSaveEdit = async () => {
        if (!editText.trim()) {
            Alert.alert("Error", "El comentario no puede estar vacío")
            return
        }

        try {
            setIsLoading(true)
            if (onEdit) {
                await onEdit(comment.id, editText)
            }
            setIsEditing(false)
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar el comentario")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = () => {
        Alert.alert(
            "Eliminar comentario",
            "¿Estás seguro de que deseas eliminar este comentario?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true)
                            if (onDelete) {
                                await onDelete(comment.id)
                            }
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar el comentario")
                        } finally {
                            setIsLoading(false)
                        }
                    },
                },
            ]
        )
    }

    return (
        <View style={[s.card, { backgroundColor: cardColor, borderColor }]}>
            <View style={s.header}>
                {comment.ownerAvatar ? (
                    <Image source={{ uri: comment.ownerAvatar }} style={s.avatar} />
                ) : (
                    <View style={[s.avatar, s.avatarFallback, { backgroundColor: bgColor }]}>
                        <Ionicons name="person" size={20} color={textMutedColor} />
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[s.owner, { color: textColor }]}>{comment.ownerName}</Text>
                    <Text style={[s.date, { color: textMutedColor }]}>{new Date(comment.createdAt).toLocaleString()}</Text>
                </View>

                {/* Botones de acción */}
                <View style={s.actions}>
                    {canEdit && !isEditing && (
                        <TouchableOpacity onPress={() => setIsEditing(true)} disabled={isLoading}>
                            <Ionicons name="create-outline" size={20} color={tintColor} />
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity onPress={handleDelete} disabled={isLoading}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                    {!isOwner && onReport && (
                        <TouchableOpacity onPress={() => onReport(comment.id)}>
                            <Ionicons name="flag-outline" size={20} color="#f59e0b" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Contenido del comentario */}
            {isEditing ? (
                <View style={s.editContainer}>
                    <TextInput
                        style={[s.editInput, { backgroundColor: bgColor, color: textColor, borderColor }]}
                        value={editText}
                        onChangeText={setEditText}
                        placeholderTextColor={textMutedColor}
                        multiline
                        autoFocus
                    />
                    <View style={s.editButtons}>
                        <TouchableOpacity
                            style={[s.editButton, s.cancelButton, { backgroundColor: bgColor, borderColor }]}
                            onPress={() => {
                                setEditText(comment.text)
                                setIsEditing(false)
                            }}
                            disabled={isLoading}
                        >
                            <Text style={[s.cancelButtonText, { color: textColor }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.editButton, s.saveButton]}
                            onPress={handleSaveEdit}
                            disabled={isLoading}
                        >
                            <Text style={s.saveButtonText}>
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Text style={[s.text, { color: textColor }]}>{comment.text}</Text>
            )}
        </View>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarFallback: {},
    owner: { fontWeight: "700", fontSize: 14 },
    date: { fontSize: 12 },
    actions: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    text: { lineHeight: 20 },
    editContainer: { gap: 8 },
    editInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: "top",
    },
    editButtons: {
        flexDirection: "row",
        gap: 8,
        justifyContent: "flex-end",
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
    },
    cancelButton: {},
    cancelButtonText: {
        fontWeight: "600",
    },
    saveButton: {
        backgroundColor: "#7c3aed",
        borderColor: "#7c3aed",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
})
