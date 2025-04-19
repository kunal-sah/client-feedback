import { PushSubscription } from '@/lib/push-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  const permission = await requestNotificationPermission();
  if (!permission) {
    return null;
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    return null;
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    return subscription as unknown as PushSubscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }

  return false;
}

export async function updatePushSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await subscribeToPushNotifications();
    
    if (!subscription) {
      return false;
    }

    const response = await fetch(`/api/users/${userId}/push-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to update push subscription:', error);
    return false;
  }
}

export async function removePushSubscription(userId: string): Promise<boolean> {
  try {
    await unsubscribeFromPushNotifications();

    const response = await fetch(`/api/users/${userId}/push-subscription`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return false;
  }
} 