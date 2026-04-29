import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export function usePushNotifications(channelId) {
  const [permission, setPermission] = useState(
    Notification.permission
  );
  const [subscribed, setSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check device compatibility
    checkDeviceCompatibility();
    // Check subscription status on mount
    checkSubscriptionStatus();
  }, [channelId]);

  const checkDeviceCompatibility = () => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Check iOS version and PWA status
    if (isIOSDevice) {
      const iOSVersion = getIOSVersion();
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // iOS 16.4+ required for push notifications
      if (iOSVersion && iOSVersion < 16.4) {
        setIsSupported(false);
        setError('Push notifications require iOS 16.4 or later');
      } else if (!isStandalone) {
        setIsSupported(false);
        setError('Add this app to your home screen to enable notifications');
      }
    }

    // Check if service workers and notifications are supported
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setIsSupported(false);
      setError('Notifications not supported on this device');
    }
  };

  const getIOSVersion = () => {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };
  
  const checkSubscriptionStatus = async () => {
    if (!channelId || !isSupported) return;
    
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
      setError('Failed to check notification status');
    }
  };
  
  const subscribe = async () => {
    if (!isSupported) {
      setError('Notifications not supported on this device');
      return;
    }

    try {
      setError('');
      
      // Register service worker
      const reg = await navigator.serviceWorker
        .register('/sw.js');
      
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Notification permission denied');
        return;
      }
      
      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 
          process.env.REACT_APP_VAPID_PUBLIC_KEY
      });
      
      // Send to backend
      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscription: sub, 
          channelId 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register subscription');
      }
      
      setSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setError('Failed to subscribe to notifications');
    }
  };
  
  const unsubscribe = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/unsubscribe`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }
      
      setSubscribed(false);
      setError('');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setError('Failed to unsubscribe from notifications');
    }
  };
  
  return { 
    permission, 
    subscribed, 
    isSupported,
    isIOS,
    error,
    subscribe, 
    unsubscribe 
  };
}
