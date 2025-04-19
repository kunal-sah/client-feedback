// Service Worker for handling push notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: data.badge || '/badge.png',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [100, 50, 100],
      requireInteraction: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action) {
    // Handle custom actions
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  } else {
    // Default click behavior
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
}); 