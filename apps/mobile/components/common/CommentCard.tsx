import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"

export type Comment = {
    id: string
    ownerName: string
    ownerAvatar?: string
    createdAt: string
    text: string
}

type Props = {
    comment: Comment
    onReport?: (id: string) => void
}

export function CommentCard({ comment, onReport }: Props) {
    return (
        <View style={s.card}>
            <View style={s.header}>
                {comment.ownerAvatar ? (
                    <Image source={{ uri: comment.ownerAvatar }} style={s.avatar} />
                ) : (
                    <View style={[s.avatar, s.avatarFallback]} />
                )}
                <View style={{ flex: 1 }}>
                    <Text style={s.owner}>{comment.ownerName}</Text>
                    <Text style={s.date}>{new Date(comment.createdAt).toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={() => onReport?.(comment.id)}>
                    <Text style={s.report}>Reportar</Text>
                </TouchableOpacity>
            </View>
            <Text style={s.text}>{comment.text}</Text>
        </View>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eee",
        gap: 8,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#eee" },
    avatarFallback: { backgroundColor: "#ddd" },
    owner: { fontWeight: "700" },
    date: { color: "#6b7280", fontSize: 12 },
    report: { color: "#7c3aed", fontWeight: "600" },
    text: { color: "#111827" },
})
