/**
 * Servicio de Notificaciones Push para el Backend
 * 
 * Este servicio maneja el envío de notificaciones push usando Expo Push Notifications API
 * NOTA: Esta es una implementación simple. Los tokens se pasan directamente.
 */

import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { supabase } from '../index';

// Crear instancia del cliente de Expo
const expo = new Expo();

/**
 * Tipos de notificaciones soportadas
 */
export type NotificationType =
    | 'adoption_approved'
    | 'adoption_rejected';

/**
 * Envía una notificación push directamente a un token de Expo
 * 
 * @param pushToken Token de Expo Push (ExponentPushToken[xxx])
 * @param title Título de la notificación
 * @param body Cuerpo de la notificación
 * @param data Datos adicionales opcionales
 * @param type Tipo de notificación
 * @returns true si se envió exitosamente, false en caso contrario
 */
export async function sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
    type: NotificationType = 'adoption_approved'
): Promise<boolean> {
    try {
        // Verificar que el token sea válido
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`❌ Token push inválido: ${pushToken}`);
            return false;
        }

        // Construir el mensaje de notificación
        const message: ExpoPushMessage = {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data: {
                ...data,
                type,
            },
            priority: 'high',
            channelId: 'default',
        };

        // Enviar la notificación
        const tickets = await expo.sendPushNotificationsAsync([message]);
        
        // Verificar si hubo errores
        const ticket = tickets[0];
        if (ticket.status === 'error') {
            console.error(`❌ Error al enviar notificación:`, ticket.message);
            return false;
        }

        console.log(`✅ Notificación enviada exitosamente`);
        return true;
    } catch (error) {
        console.error('Error al enviar notificación push:', error);
        return false;
    }
}

/**
 * Notificación: Solicitud de adopción aprobada
 * Obtiene el token push del usuario y envía la notificación
 */
export async function sendAdoptionApprovedNotification(
    userId: number,
    petName: string,
    requestId: number,
    confirmationCode?: string
): Promise<void> {
    try {
        // Obtener el token push del usuario
        const { data: user, error } = await supabase
            .from('users')
            .select('push_token')
            .eq('id', userId)
            .single();

        if (error || !user?.push_token) {
            console.log(`⚠️ No se encontró push token para usuario ${userId}`);
            return;
        }

        const bodyText = confirmationCode
            ? `¡Tu solicitud para adoptar a ${petName} fue aprobada! Código: ${confirmationCode}`
            : `¡Tu solicitud para adoptar a ${petName} fue aprobada!`;

        // Enviar la notificación
        const sent = await sendPushNotification(
            user.push_token,
            '✅ ¡Solicitud aprobada!',
            bodyText,
            { requestId, confirmationCode, petName },
            'adoption_approved'
        );

        if (sent) {
            console.log(`✅ Notificación de aprobación enviada a usuario ${userId}`);
        }
    } catch (error) {
        console.error('Error al enviar notificación de adopción aprobada:', error);
    }
}

/**
 * Notificación: Solicitud de adopción rechazada
 * Obtiene el token push del usuario y envía la notificación
 */
export async function sendAdoptionRejectedNotification(
    userId: number,
    petName: string,
    requestId: number,
    reason?: string
): Promise<void> {
    try {
        // Obtener el token push del usuario
        const { data: user, error } = await supabase
            .from('users')
            .select('push_token')
            .eq('id', userId)
            .single();

        if (error || !user?.push_token) {
            console.log(`⚠️ No se encontró push token para usuario ${userId}`);
            return;
        }

        const bodyText = reason
            ? `Tu solicitud para adoptar a ${petName} fue rechazada. Razón: ${reason}`
            : `Tu solicitud para adoptar a ${petName} fue rechazada.`;

        // Enviar la notificación
        const sent = await sendPushNotification(
            user.push_token,
            '❌ Solicitud rechazada',
            bodyText,
            { requestId, reason, petName },
            'adoption_rejected'
        );

        if (sent) {
            console.log(`✅ Notificación de rechazo enviada a usuario ${userId}`);
        }
    } catch (error) {
        console.error('Error al enviar notificación de adopción rechazada:', error);
    }
}

/**
 * @deprecated Use sendAdoptionApprovedNotification instead
 */
export function logAdoptionApproved(
    petName: string,
    requestId: number,
    confirmationCode?: string
): void {
    const bodyText = confirmationCode
        ? `¡Tu solicitud para adoptar a ${petName} fue aprobada! Código: ${confirmationCode}`
        : `¡Tu solicitud para adoptar a ${petName} fue aprobada!`;

    console.log(`📬 Notificación lista para enviar:`);
    console.log(`   Título: ✅ ¡Solicitud aprobada!`);
    console.log(`   Cuerpo: ${bodyText}`);
    console.log(`   Datos: requestId=${requestId}, code=${confirmationCode}`);
}

/**
 * @deprecated Use sendAdoptionRejectedNotification instead
 */
export function logAdoptionRejected(
    petName: string,
    requestId: number,
    reason?: string
): void {
    const bodyText = reason
        ? `Tu solicitud para adoptar a ${petName} fue rechazada. Razón: ${reason}`
        : `Tu solicitud para adoptar a ${petName} fue rechazada.`;

    console.log(`📬 Notificación lista para enviar:`);
    console.log(`   Título: ❌ Solicitud rechazada`);
    console.log(`   Cuerpo: ${bodyText}`);
    console.log(`   Datos: requestId=${requestId}, reason=${reason}`);
}
