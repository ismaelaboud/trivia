self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: { url: data.url },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'answer', title: 'Answer Now' }
    ]
  });
});

// Click notification → open question page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    clients.openWindow(url);
  }
});
