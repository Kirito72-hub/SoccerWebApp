# PWA Cache Busting - Quick Reference

## 🚀 **Quick Start**

### **Build and Deploy:**
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### **Verify It's Working:**
1. Open browser console
2. Look for: `🚀 Rakla Service Worker loaded! rakla-pwa-v1.5.0-[timestamp]`
3. Check DevTools → Application → Cache Storage
4. Should see: `rakla-pwa-v1.5.0-[timestamp]-static`

---

## 📋 **Key Files**

| File | Purpose |
|------|---------|
| `vite.config.ts` | Injects build timestamp |
| `public/service-worker.js` | Cache-busting logic |
| `vite-env.d.ts` | TypeScript declarations |

---

## 🔧 **How It Works (Simple)**

1. **Build** → Generates unique timestamp
2. **Deploy** → Service worker gets new timestamp
3. **User visits** → New SW installs
4. **Activation** → Old caches deleted
5. **Result** → User gets latest version

---

## ✅ **What's Cached**

### **Network-First (Always Fresh):**
- HTML files
- JavaScript files
- CSS files

### **Cache-First (Fast Loading):**
- Images
- Fonts
- Icons

### **Never Cached:**
- API requests (`/rest/v1/`, `/auth/v1/`)
- Cross-origin requests

---

## 🧪 **Testing**

### **Test Update Flow:**
```bash
# 1. Build and deploy
npm run build

# 2. Note the timestamp in console
# Example: rakla-pwa-v1.5.0-1735905600000

# 3. Make a change and rebuild
npm run build

# 4. Deploy again

# 5. Refresh browser
# Old cache should be deleted
# New cache should appear with new timestamp
```

### **Test Offline Mode:**
```
1. Load page normally
2. DevTools → Network → Offline
3. Refresh page
4. Should still load ✅
```

---

## ⚠️ **Troubleshooting**

### **Problem: Old version still showing**
```
Solution:
1. Hard refresh (Ctrl+Shift+R)
2. Check console for SW logs
3. Clear all caches manually (DevTools → Application → Clear storage)
4. Reload page
```

### **Problem: Service worker not registering**
```
Solution:
1. Check console for errors
2. Verify service-worker.js exists in public/
3. Check HTTPS (required for SW)
4. Try incognito mode
```

### **Problem: Offline mode broken**
```
Solution:
1. Check STATIC_ASSETS array in service-worker.js
2. Verify files are being cached (DevTools → Application → Cache)
3. Check Network tab for failed requests
```

---

## 📊 **Cache Sizes**

| Cache | Max Entries | Auto-Cleanup |
|-------|-------------|--------------|
| Static | 50 | Yes (FIFO) |
| Dynamic | 100 | Yes (FIFO) |
| Images | 60 | Yes (FIFO) |

**FIFO** = First In, First Out (oldest deleted first)

---

## 🔄 **Update Process**

### **What Happens on Update:**
```
New version deployed
  ↓
User refreshes page
  ↓
New service worker detected
  ↓
New SW installs (background)
  ↓
skipWaiting() called
  ↓
New SW activates immediately
  ↓
Old caches deleted
  ↓
clients.claim() takes control
  ↓
User gets new version ✅
```

---

## 📝 **Maintenance**

### **Update Cache Version:**
Edit `public/service-worker.js`:
```javascript
const CACHE_VERSION = 'v1.6.0'; // Change this
```

### **Add Static Asset:**
Edit `STATIC_ASSETS` in service-worker.js:
```javascript
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/new-file.js' // Add here
];
```

### **Adjust Cache Limits:**
Edit `MAX_CACHE_SIZE` in service-worker.js:
```javascript
const MAX_CACHE_SIZE = {
    static: 50,   // Increase if needed
    dynamic: 100, // Increase if needed
    images: 60    // Increase if needed
};
```

---

## 🎯 **Expected Console Logs**

### **On First Load:**
```
🔧 Service Worker installing... rakla-pwa-v1.5.0-1735905600000
📦 Caching static assets...
✅ Static assets cached successfully
🔄 Service Worker activating... rakla-pwa-v1.5.0-1735905600000
✅ All old caches deleted!
✅ Service Worker activated!
🚀 Rakla Service Worker loaded! rakla-pwa-v1.5.0-1735905600000
```

### **On Update:**
```
🔧 Service Worker installing... rakla-pwa-v1.5.0-1735906000000
🔄 Service Worker activating... rakla-pwa-v1.5.0-1735906000000
🗑️ Deleting old cache: rakla-pwa-v1.5.0-1735905600000-static
🗑️ Deleting old cache: rakla-pwa-v1.5.0-1735905600000-dynamic
🗑️ Deleting old cache: rakla-pwa-v1.5.0-1735905600000-images
✅ All old caches deleted!
✅ Service Worker activated!
```

---

## 🔗 **Related Docs**

- `CACHE-BUSTING-IMPLEMENTATION.md` - Full technical details
- `SOLUTION-1-COMPLETE.md` - Implementation summary
- `PWA-UPDATE-PROMPT-REMOVAL.md` - Update prompt removal

---

## ✨ **Key Benefits**

- ✅ No manual cache clearing
- ✅ No update popups
- ✅ Always fresh content
- ✅ Works offline
- ✅ Fast loading
- ✅ Works on iOS

---

**Last Updated**: 2026-01-03  
**Version**: 1.5.0  
**Status**: ✅ Production Ready
