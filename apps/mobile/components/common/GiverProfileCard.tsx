import React from "react"
import { View, Text, StyleSheet, Image, FlatList } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"

export type Publication = { id: string; title: string; image?: string }
export type GiverProfile = {
    id: string
    name: string
    avatar?: string
    bio?: string
    activePublications: Publication[]
}

type Props = { profile: GiverProfile }

export function GiverProfileCard({ profile }: Props) {
    const cardBgColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textMutedColor = useThemeColor({}, "textMuted")
    const borderColor = useThemeColor({}, "border")
    const disabledColor = useThemeColor({}, "disabled")
    const backgroundSecondary = useThemeColor({}, "backgroundSecondary")

    return (
        <View style={[s.card, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
            <View style={s.header}>
                {profile.avatar ? (
                    <Image source={{ uri: profile.avatar }} style={[s.avatar, { backgroundColor: disabledColor }]} />
                ) : (
                    <View style={[s.avatar, s.fallback, { backgroundColor: backgroundSecondary }]} />
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[s.name, { color: textColor }]}>{profile.name}</Text>
                    {!!profile.bio && <Text style={[s.bio, { color: textMutedColor }]}>{profile.bio}</Text>}
                </View>
            </View>

            <Text style={[s.section, { color: textColor }]}>Publicaciones activas</Text>
            <FlatList
                data={profile.activePublications}
                keyExtractor={(p) => p.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={s.pub}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={[s.pubImg, { backgroundColor: disabledColor }]} />
                        ) : (
                            <View style={[s.pubImg, s.pubFallback, { backgroundColor: backgroundSecondary }]} />
                        )}
                        <Text numberOfLines={1} style={[s.pubTitle, { color: textColor }]}>
                            {item.title}
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 10,
    },
    header: { flexDirection: "row", gap: 12, alignItems: "center" },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    fallback: {},
    name: { fontSize: 16, fontWeight: "700" },
    bio: {},
    section: { marginTop: 6, fontWeight: "700" },
    pub: { width: 120, marginRight: 10 },
    pubImg: { width: 120, height: 90, borderRadius: 10 },
    pubFallback: {},
    pubTitle: { marginTop: 4, fontSize: 12 },
})
