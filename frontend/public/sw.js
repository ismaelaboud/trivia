self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: { url: data.url },
    requireInteraction: false,
    silent: false
  };

  // Add vibration only if supported (not available on iOS)
  if ('vibrate' in navigator) {
    options.vibrate = [200, 100, 200];
  }

  // Add actions only if supported (limited on iOS)
  if ('actions' in Notification.prototype) {
    options.actions = [
      { action: 'answer', title: 'Answer Now' }
    ];
  }

  self.registration.showNotification(data.title, options);
});

// Click notification → open question page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    // Try to open in existing window first, then fall back to new window
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle notification close (for analytics/cleanup)
self.addEventListener('notificationclose', (event) => {
  // Could add analytics here if needed
  console.log('Notification was closed:', event.notification);
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});
