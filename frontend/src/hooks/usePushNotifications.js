import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export function usePushNotifications(channelId) {
  const [permission, setPermission] = useState(
    Notification.permission
  );
  const [subscribed, setSubscribed] = useState(false);
  
  useEffect(() => {
    // Check subscription status on mount
    checkSubscriptionStatus();
  }, [channelId]);

  const checkSubscriptionStatus = async () => {
    if (!channelId) return;
    
    try {
      // Check if service worker is registered and has subscription
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };
  
  const subscribe = async () => {
    try {
      // Register service worker
      const reg = await navigator.serviceWorker
        .register('/sw.js');
      
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;
      
      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 
          process.env.REACT_APP_VAPID_PUBLIC_KEY
      });
      
      // Send to backend
      await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscription: sub, 
          channelId 
        })
      });
      
      setSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };
  
  const unsubscribe = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/unsubscribe`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
      });
      setSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };
  
  return { permission, subscribed, 
           subscribe, unsubscribe };
}
