/**
 * Servicio para guardar el push token en el backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const PUSH_TOKEN_SAVED_KEY = "push_token_saved";
const PUSH_TOKEN_USER_KEY = "push_token_user_id";

function resolveGatewayBaseURL() {
    let baseURL = process.env.EXPO_PUBLIC_API_GATEWAY;
    
    if (!baseURL) {
        baseURL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
    }
    
    // Remover trailing slash si existe
    return baseURL.replace(/\/+$/, "");
}

export interface SavePushTokenResponse {
    success: boolean;
    error?: string;
}

/**
 * Guarda el push token en el backend
 * @param pushToken El token de Expo Push Notifications
 * @returns Resultado de la operación
 */
export async function savePushTokenToBackend(
    pushToken: string,
    userId?: string
): Promise<SavePushTokenResponse> {
    try {
        const authToken = await AsyncStorage.getItem("auth_token");

        if (!authToken) {
            return { success: false, error: "No authenticated" };
        }

        const url = `${resolveGatewayBaseURL()}/v1/auth/push-token`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ pushToken }),
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, error };
        }

        await AsyncStorage.setItem(PUSH_TOKEN_SAVED_KEY, pushToken);
        if (userId) {
            await AsyncStorage.setItem(PUSH_TOKEN_USER_KEY, userId);
        }
        return { success: true };
    } catch (error) {
        console.error("Error al guardar push token en backend:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Verifica si el push token actual ya fue guardado para este usuario
 * @param currentToken El token actual
 * @param userId El ID del usuario actual
 * @returns true si ya fue guardado para este usuario, false si no
 */
export async function isPushTokenSaved(currentToken: string, userId?: string): Promise<boolean> {
    try {
        const savedToken = await AsyncStorage.getItem(PUSH_TOKEN_SAVED_KEY);
        const savedUserId = await AsyncStorage.getItem(PUSH_TOKEN_USER_KEY);
        
        if (!userId) {
            return savedToken === currentToken;
        }
        
        const tokenMatches = savedToken === currentToken;
        const userMatches = savedUserId === userId;
        
        return tokenMatches && userMatches;
    } catch (error) {
        console.error("Error al verificar push token guardado:", error);
        return false;
    }
}

/**
 * Limpia el estado de push token guardado (útil al hacer logout)
 */
export async function clearPushTokenSaved(): Promise<void> {
    try {
        await AsyncStorage.removeItem(PUSH_TOKEN_SAVED_KEY);
        await AsyncStorage.removeItem(PUSH_TOKEN_USER_KEY);
    } catch (error) {
        console.error("Error al limpiar estado de push token:", error);
    }
}
