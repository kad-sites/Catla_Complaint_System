'use server'

import { messaging } from '@/lib/firebaseAdmin';

export async function sendPushNotification(complaintId: string, message: string) {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized. Skipping push notification.');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const response = await messaging.send({
      topic: 'all_technicians',
      notification: {
        title: 'New Job Assignment',
        body: message,
      },
      data: {
        complaintId: complaintId,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'catla_jobs',
        },
      }
    });

    console.log('Successfully sent push notification:', response);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}
