import React, { useEffect, useRef, useState } from "react"
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native"
import { useRouter } from "expo-router"
import { CameraView, useCameraPermissions } from "expo-camera"
import * as MediaLibrary from "expo-media-library"
import * as FileSystem from "expo-file-system"
import { Colors } from "@/constants/Colors"

type Captured = { uri: string; saved?: boolean }

export default function CameraScreen() {
    const router = useRouter()

    // Permisos
    const [camPerm, requestCamPerm] = useCameraPermissions()
    const [libPerm, requestLibPerm] = MediaLibrary.usePermissions()

    // Cámara
    const camRef = useRef<CameraView>(null)
    const [flashOn, setFlashOn] = useState(false)
    const [taking, setTaking] = useState(false)

    // Fotos en sesión (múltiples)
    const [photos, setPhotos] = useState<Captured[]>([])
    const [previewIdx, setPreviewIdx] = useState<number | null>(null)

    // Pedir permisos en montaje
    useEffect(() => {
        ;(async () => {
            if (!camPerm?.granted) await requestCamPerm()
            if (!libPerm?.granted) await requestLibPerm()
        })()
    }, [])

    if (!camPerm) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        )
    }

    if (!camPerm.granted) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
                <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 12 }}>
                    Necesitas otorgar permiso de cámara para usar esta función.
                </Text>
                <TouchableOpacity
                    onPress={requestCamPerm}
                    style={{
                        backgroundColor: "Colors.light.shadow",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ color: "#fff" }}>Conceder permisos</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const takePhoto = async () => {
        try {
            if (!camRef.current) return
            setTaking(true)
            const photo = await camRef.current.takePictureAsync({
                quality: 0.85,
                skipProcessing: true,
            })
            setPhotos((p) => [...p, { uri: photo.uri }])
            setPreviewIdx((idx) => (idx === null ? 0 : idx + 1))
        } catch (e) {
            console.error(e)
            Alert.alert("Error", "No se pudo capturar la foto.")
        } finally {
            setTaking(false)
        }
    }

    const retakeLast = async () => {
        setPhotos((p) => {
            if (p.length === 0) return p
            const next = [...p]
            next.pop()
            return next
        })
        setPreviewIdx((idx) => {
            if (idx === null) return null
            const next = idx - 1
            return next >= 0 ? next : null
        })
    }

    const saveAll = async () => {
        if (!libPerm?.granted) {
            const { granted } = await requestLibPerm()
            if (!granted) {
                Alert.alert("Permiso requerido", "Se necesita permiso para guardar en la galería.")
                return
            }
        }
        try {
            for (let i = 0; i < photos.length; i++) {
                const p = photos[i]
                if (!p.saved) {
                    await MediaLibrary.saveToLibraryAsync(p.uri)
                    const filename = p.uri.split("/").pop() || `photo_${Date.now()}.jpg`
                    const dest = FileSystem.documentDirectory + "photos/" + filename
                    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "photos", {
                        intermediates: true,
                    }).catch(() => {})
                    await FileSystem.copyAsync({ from: p.uri, to: dest })
                    photos[i] = { ...p, saved: true }
                }
            }
            setPhotos([...photos])
            Alert.alert("Listo", "Fotos guardadas en la galería y en el almacenamiento de la app.")
        } catch (e) {
            console.error(e)
            Alert.alert("Error", "No se pudieron guardar algunas fotos.")
        }
    }

    const doneAndBack = () => router.back()
    const toggleFlash = () => setFlashOn((f) => !f)

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            {/* Botón volver fijo arriba */}
            <View style={{ position: "absolute", top: 40, left: 20, zIndex: 5 }}>
                <TouchableOpacity
                    onPress={doneAndBack}
                    style={{
                        backgroundColor: "rgba(0,0,0,0.6)",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ color: "#fff" }}>Volver</Text>
                </TouchableOpacity>
            </View>

            {previewIdx === null ? (
                <>
                    <CameraView
                        ref={camRef}
                        style={{ flex: 1 }}
                        facing="back"
                        enableTorch={flashOn}
                    />
                    <View
                        style={{
                            position: "absolute",
                            bottom: 30,
                            left: 0,
                            right: 0,
                            alignItems: "center",
                            gap: 14,
                        }}
                    >
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            <TouchableOpacity
                                onPress={toggleFlash}
                                style={{
                                    backgroundColor: "Colors.light.shadow",
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                    borderRadius: 999,
                                }}
                            >
                                <Text style={{ color: "white" }}>
                                    {flashOn ? "Flash: ON" : "Flash: OFF"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={takePhoto}
                                disabled={taking}
                                style={{
                                    backgroundColor: taking ? "#6b7280" : Colors.light.warning,
                                    paddingVertical: 10,
                                    paddingHorizontal: 24,
                                    borderRadius: 999,
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "600" }}>
                                    {taking ? "..." : "Capturar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            <TouchableOpacity
                                onPress={() => (photos.length ? setPreviewIdx(0) : null)}
                                disabled={!photos.length}
                                style={{
                                    backgroundColor: photos.length ? "Colors.light.shadow" : "#374151",
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 999,
                                }}
                            >
                                <Text style={{ color: "white" }}>
                                    Previsualizar ({photos.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={doneAndBack}
                                style={{
                                    backgroundColor: Colors.light.success,
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 999,
                                }}
                            >
                                <Text style={{ color: "white" }}>Listo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                <View style={{ flex: 1, backgroundColor: "black", padding: 12 }}>
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Image
                            source={{ uri: photos[previewIdx].uri }}
                            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                        />
                    </View>

                    <View style={{ paddingVertical: 10, gap: 12 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                onPress={() => setPreviewIdx((i) => (i! > 0 ? i! - 1 : i))}
                                style={{
                                    backgroundColor: "Colors.light.shadow",
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: "white" }}>⟵ Anterior</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPreviewIdx(null)}
                                style={{
                                    backgroundColor: "Colors.light.shadow",
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: "white" }}>Abrir cámara</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() =>
                                    setPreviewIdx((i) => (i! < photos.length - 1 ? i! + 1 : i))
                                }
                                style={{
                                    backgroundColor: "Colors.light.shadow",
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: "white" }}>Siguiente ⟶</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                onPress={retakeLast}
                                style={{
                                    backgroundColor: "#ef4444",
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: "white" }}>Rehacer última</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveAll}
                                style={{
                                    backgroundColor: Colors.secondary,
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: "white" }}>Guardar todas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={doneAndBack}
                                style={{
                                    backgroundColor: Colors.light.success,
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: "white" }}>Listo y volver</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: "#9ca3af", textAlign: "center" }}>
                            {previewIdx + 1} / {photos.length}{" "}
                            {photos[previewIdx].saved ? "· Guardada" : ""}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}
