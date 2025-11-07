import * as ImagePicker from "expo-image-picker"
import { Camera } from "expo-camera"

export const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
        alert("Se requieren permisos para acceder a la galería.")
        return null
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
    })

    if (!result.canceled) {
        return result.assets[0].uri
    }

    return null
}

export const takePhotoWithCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    if (status !== "granted") {
        alert("Se requieren permisos para usar la cámara.")
        return null
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
    })

    if (!result.canceled) {
        return result.assets[0].uri
    }

    return null
}
