import { View, Text, StyleSheet, Image, FlatList } from "react-native";

export type Publication = { id: string; title: string; image?: string };
export type GiverProfile = {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  activePublications: Publication[];
};

type Props = { profile: GiverProfile };

export function GiverProfileCard({ profile }: Props) {
  return (
    <View style={s.card}>
      <View style={s.header}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, s.fallback]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{profile.name}</Text>
          {!!profile.bio && <Text style={s.bio}>{profile.bio}</Text>}
        </View>
      </View>

      <Text style={s.section}>Publicaciones activas</Text>
      <FlatList
        data={profile.activePublications}
        keyExtractor={(p) => p.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={s.pub}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={s.pubImg} />
            ) : (
              <View style={[s.pubImg, s.pubFallback]} />
            )}
            <Text numberOfLines={1} style={s.pubTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", gap: 10 },
  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#eee" },
  fallback: { backgroundColor: "#ddd" },
  name: { fontSize: 16, fontWeight: "700" },
  bio: { color: "#4b5563" },
  section: { marginTop: 6, fontWeight: "700" },
  pub: { width: 120, marginRight: 10 },
  pubImg: { width: 120, height: 90, borderRadius: 10, backgroundColor: "#eee" },
  pubFallback: { backgroundColor: "#ddd" },
  pubTitle: { marginTop: 4, fontSize: 12 },
});