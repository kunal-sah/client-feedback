import webpush from 'web-push';
import prisma from './prisma';

// Generate VAPID keys using webpush.generateVAPIDKeys()
// These should be stored in your environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn('VAPID keys are not set. Push notifications will not work.');
}

webpush.setVapidDetails(
  'mailto:' + (process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com'),
  vapidPublicKey,
  vapidPrivateKey
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      pushSubscription: subscription,
    },
  });
}

export async function removePushSubscription(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      pushSubscription: null,
    },
  });
}

export async function sendPushNotification(
  userId: string,
  notification: PushNotification
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pushSubscription: true,
        notificationPreferences: true,
      },
    });

    if (!user?.pushSubscription || !user.notificationPreferences?.push) {
      return { success: false, error: 'Push notifications not enabled' };
    }

    const payload = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString(),
    });

    await webpush.sendNotification(
      user.pushSubscription as PushSubscription,
      payload
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}

export async function sendPushNotificationToMany(
  userIds: string[],
  notification: PushNotification
) {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushNotification(userId, notification))
  );

  const succeeded = results.filter(
    (result) => result.status === 'fulfilled' && result.value.success
  ).length;

  const failed = results.filter(
    (result) => result.status === 'rejected' || !result.value.success
  ).length;

  return {
    success: true,
    stats: {
      total: userIds.length,
      succeeded,
      failed,
    },
  };
} 