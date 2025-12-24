---
description: Apply the T-Rex Solution for Cross-Device System Notifications
---

# T-Rex Solution 🦖

**Purpose:** Fix missing system notifications on mobile devices (Android/iOS) by triggering them from the client-side Realtime event listener.

## 1. Prerequisites
- [ ] Valid PWA structure (`manifest.json` with correct icons).
- [ ] Service Worker registered and active.
- [ ] `pwa-192x192.png` icon must exist in `/icons/`.

## 2. Update Service Worker (`public/service-worker.js`)
Ensure the Service Worker listens for `SHOW_NOTIFICATION` messages:

```javascript
self.addEventListener('message', (event) => {
    // ... existing message handlers ...
    
    // T-Rex Handler 🦖
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        
        // Android-Optimized Options
        const notificationOptions = {
            ...options,
            icon: options.icon || '/icons/pwa-192x192.png',
            badge: options.badge || '/icons/pwa-192x192.png',
            vibrate: options.vibrate || [200, 100, 200, 100, 200],
            requireInteraction: true,
            silent: false,
            renotify: true
        };
        
        event.waitUntil(
            self.registration.showNotification(title, notificationOptions)
        );
    }
});
```

## 3. Update Client Logic (`components/Layout.tsx`)
Subscribe to Realtime `INSERT` events and trigger the Service Worker:

```typescript
// Inside useEffect or subscription logic
const channel = supabase
  .channel('notifications-listener')
  .on(
    'postgres_changes',
    {
      event: 'INSERT', // Listen for NEW notifications
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      // 1. Update UI
      updateUnreadCount();
      
      // 2. T-REX TRIGGER 🦖 -> Send to Service Worker
      if (payload.new && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const newNotif = payload.new as any;
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: newNotif.title,
          options: {
            body: newNotif.message,
            icon: '/icons/pwa-192x192.png',
            badge: '/icons/pwa-192x192.png',
            tag: `notification-${newNotif.id}`,
            data: { 
                url: window.location.origin, 
                type: newNotif.type 
            }
          }
        });
      }
    }
  )
  .subscribe();
```

## 4. Verify
- Open app on phone.
- Send notification from another device.
- Verify system tray notification appears with sound/vibration.
