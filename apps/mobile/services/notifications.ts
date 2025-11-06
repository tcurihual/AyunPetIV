/**
 * Servicio de Notificaciones Push
 * 
 * Este servicio maneja todas las operaciones relacionadas con notificaciones push:
 * - Solicitar permisos
 * - Registrar tokens de dispositivo
 * - Enviar notificaciones locales
 * - Configurar listeners de notificaciones
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Configuración global de cómo se manejan las notificaciones cuando la app está en primer plano
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Tipo para el token de notificación push
 */
export interface PushToken {
  data: string;
  type: 'ios' | 'android' | 'web';
}

/**
 * Solicita permisos para enviar notificaciones push al usuario
 * En iOS, mostrará un diálogo de sistema
 * En Android 13+, también pedirá permisos
 * 
 * @returns true si se otorgaron los permisos, false en caso contrario
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return false;
  }
}

/**
 * Registra el dispositivo y obtiene el token de notificación push (Expo Push Token)
 * Este token es necesario para enviar notificaciones desde el backend
 * 
 * @returns El token de notificación push o null si falla
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // NOTA: En Expo Go, Constants.isDevice puede ser false incluso en dispositivos físicos
    if (!Constants.isDevice) {
      console.warn('Constants.isDevice es false, pero intentaremos obtener el token (Expo Go)');
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones de Ayün Pet',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F9C80E',
        sound: 'default',
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('No se encontró projectId en app.json');
      return null;
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    return tokenData.data;
  } catch (error) {
    console.error('Error al registrar para notificaciones push:', error);
    return null;
  }
}

/**
 * Envía una notificación local (sin necesidad de servidor)
 * Útil para testing o notificaciones generadas localmente
 * 
 * @param title Título de la notificación
 * @param body Cuerpo/mensaje de la notificación
 * @param data Datos adicionales opcionales
 * @param delaySeconds Retraso en segundos antes de mostrar la notificación (0 = inmediato)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  delaySeconds: number = 0
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds, repeats: false } : null,
    });

    console.log('📬 Notificación local programada:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error al programar notificación local:', error);
    throw error;
  }
}

/**
 * Cancela todas las notificaciones programadas pendientes
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Todas las notificaciones programadas canceladas');
  } catch (error) {
    console.error('Error al cancelar notificaciones:', error);
  }
}

/**
 * Obtiene el número de notificaciones sin leer (badge)
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error al obtener badge count:', error);
    return 0;
  }
}

/**
 * Establece el número de notificaciones sin leer (badge)
 * En iOS aparece como el número rojo en el ícono de la app
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error al establecer badge count:', error);
  }
}

/**
 * Limpia el badge (establece a 0)
 */
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}

/**
 * Tipos de datos que pueden venir en una notificación
 */
export interface NotificationData {
  type?: 'adoption_request' | 'adoption_approved' | 'adoption_rejected' | 'message' | 'general';
  requestId?: number;
  postId?: number;
  userId?: number;
  [key: string]: any;
}

/**
 * Maneja la apertura de una notificación y navega a la pantalla correspondiente
 * Esta función debería ser llamada cuando el usuario toca una notificación
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  router: any
): void {
  try {
    const data = response.notification.request.content.data as NotificationData;
    console.log('📲 Notificación tocada, data:', data);

    // Navegar según el tipo de notificación
    switch (data.type) {
      case 'adoption_approved':
      case 'adoption_rejected':
        if (data.requestId) {
          router.push(`/(home)/(requests)/${data.requestId}`);
        }
        break;

      case 'adoption_request':
        if (data.requestId) {
          router.push(`/(shelter)/requests/${data.requestId}`);
        }
        break;

      case 'message':
        if (data.userId) {
          router.push(`/(home)/messages`);
        }
        break;

      default:
        console.log('Tipo de notificación no manejado:', data.type);
    }
  } catch (error) {
    console.error('Error al manejar respuesta de notificación:', error);
  }
}
