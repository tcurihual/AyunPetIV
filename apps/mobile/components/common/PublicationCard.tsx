import React, { useMemo, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image as RNImage } from "react-native"
import { useRouter } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"
import { Pet } from "@/interfaces/pet"

interface PublicationCardProps {
  pet: Pet
}

const API = process.env.EXPO_PUBLIC_MEDIA_BASE ?? "http://10.0.2.2:3000"


const PublicationCard: React.FC<PublicationCardProps> = ({ pet }) => {
  const router = useRouter()
  const scale = useSharedValue(1)

  // URLs del endpoint (thumb para Home, full para detalle)
  const thumbUri = useMemo(() => `${API}/api/pets/${pet.id}/image?variant=thumb`, [pet.id])
  const fullUri  = useMemo(() => `${API}/api/pets/${pet.id}/image?variant=full`,  [pet.id])

  // Usamos el thumb por defecto; si falla, caemos al pet.image existente
  const [imgUri, setImgUri] = useState<string | undefined>(thumbUri)

  const handleViewDetails = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
    setTimeout(() => {
      router.push({
        pathname: "/(home)/publication/[id]",
        params: { id: String(pet.id) }, // en la pantalla de detalle usa fullUri
      })
      scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    }, 100)
  }

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 250 })
    // pre-carga la imagen en alta mientras el usuario presiona
    RNImage.prefetch(fullUri).catch(() => {})
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 })
  }

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
    console.log("thumbUri =>", `${process.env.EXPO_PUBLIC_MEDIA_BASE}/api/pets/${pet.id}/image?variant=thumb`)

  return (
    <Animated.View style={[styles.card, animatedStyle]} sharedTransitionTag={`pet-card-${pet.id}`}>
      <Animated.Image
        style={styles.image}
        // baja calidad desde el endpoint; si falla, usa el valor original que ya traía el pet
        source={
          imgUri
            ? { uri: imgUri }
            : typeof pet.image === "string"
              ? { uri: pet.image }
              : pet.image
        }
        onError={() => setImgUri(undefined)}
        sharedTransitionTag={`pet-image-${pet.id}`}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <Animated.Text style={styles.name} sharedTransitionTag={`pet-name-${pet.id}`}>
          {pet.name}
        </Animated.Text>
        <Text style={styles.details}>{`${pet.gender} ${pet.age}`}</Text>
        <Text style={styles.publisher}>Publicado por: {pet.publisher}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleViewDetails}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Ver Información</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#eee",
  },
  infoContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, alignItems: "flex-start" },
  name: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 2 },
  details: { fontSize: 13, color: "#666", marginBottom: 2 },
  publisher: { fontSize: 12, color: "#999", marginBottom: 4 },
  button: { backgroundColor: "#FFD700", borderRadius: 8, paddingVertical: 8, marginHorizontal: 12, marginBottom: 12, alignItems: "center" },
  buttonText: { fontSize: 15, fontWeight: "bold", color: "#222" },
})

export default PublicationCard
