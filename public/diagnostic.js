// Rakla PWA Diagnostic Tool
// Run this in the browser console to diagnose notification issues

console.log('🔍 RAKLA PWA DIAGNOSTIC TOOL');
console.log('================================\n');

// 1. Check Notification Permission
console.log('1️⃣ NOTIFICATION PERMISSION:');
console.log('  Status:', Notification.permission);
if (Notification.permission === 'granted') {
    console.log('  ✅ Permission granted');
} else if (Notification.permission === 'denied') {
    console.log('  ❌ Permission denied - user must enable in browser settings');
} else {
    console.log('  ⚠️ Permission not requested yet');
}
console.log('');

// 2. Check Service Worker Support
console.log('2️⃣ SERVICE WORKER SUPPORT:');
console.log('  Supported:', 'serviceWorker' in navigator);
if ('serviceWorker' in navigator) {
    console.log('  ✅ Service Worker API available');

    // Check controller
    console.log('  Controller:', navigator.serviceWorker.controller);
    if (navigator.serviceWorker.controller) {
        console.log('  ✅ Service Worker is controlling the page');
        console.log('    - Script URL:', navigator.serviceWorker.controller.scriptURL);
        console.log('    - State:', navigator.serviceWorker.controller.state);
    } else {
        console.log('  ❌ No Service Worker controller - SW not active!');
    }
} else {
    console.log('  ❌ Service Worker not supported in this browser');
}
console.log('');

// 3. Check Service Worker Registration
console.log('3️⃣ SERVICE WORKER REGISTRATION:');
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('  Registered SWs:', registrations.length);
    if (registrations.length === 0) {
        console.log('  ❌ No service workers registered!');
        console.log('  → Check if service-worker.js file exists');
        console.log('  → Check browser console for registration errors');
    } else {
        registrations.forEach((reg, i) => {
            console.log(`  SW ${i + 1}:`);
            console.log('    - Scope:', reg.scope);
            console.log('    - Active:', reg.active);
            console.log('    - Installing:', reg.installing);
            console.log('    - Waiting:', reg.waiting);
            if (reg.active) {
                console.log('    ✅ Service Worker is active');
            }
        });
    }
    console.log('');

    // 4. Check if SW file exists
    console.log('4️⃣ SERVICE WORKER FILE:');
    return fetch('/service-worker.js');
}).then(response => {
    console.log('  Status:', response.status);
    if (response.ok) {
        console.log('  ✅ service-worker.js file exists');
    } else {
        console.log('  ❌ service-worker.js file not found (404)');
        console.log('  → File is missing from deployment');
        console.log('  → Check vite.config.ts publicDir setting');
    }
    console.log('');

    // 5. Test notification
    console.log('5️⃣ TEST NOTIFICATION:');
    if (Notification.permission === 'granted' && navigator.serviceWorker.controller) {
        console.log('  Attempting to show test notification...');
        return navigator.serviceWorker.ready.then(reg => {
            return reg.showNotification('🧪 Test Notification', {
                body: 'If you see this, notifications work!',
                icon: '/icons/pwa-192x192.png',
                badge: '/icons/pwa-192x192.png',
                tag: 'test',
                requireInteraction: false
            });
        }).then(() => {
            console.log('  ✅ Test notification shown successfully!');
            console.log('  → Check your notification tray');
        }).catch(err => {
            console.error('  ❌ Failed to show test notification:', err);
        });
    } else {
        if (Notification.permission !== 'granted') {
            console.log('  ⚠️ Cannot test - permission not granted');
        }
        if (!navigator.serviceWorker.controller) {
            console.log('  ⚠️ Cannot test - no SW controller');
        }
    }
}).catch(error => {
    console.error('  ❌ Error checking SW file:', error);
}).finally(() => {
    console.log('');
    console.log('================================');
    console.log('📊 DIAGNOSTIC COMPLETE');
    console.log('');
    console.log('SUMMARY:');
    console.log('--------');
    console.log('Permission:', Notification.permission);
    console.log('SW Controller:', navigator.serviceWorker.controller ? '✅ Active' : '❌ Not Active');
    console.log('');
    console.log('If SW Controller is "Not Active", the issue is:');
    console.log('1. Service worker file is missing from deployment');
    console.log('2. Service worker registration failed');
    console.log('3. Hard refresh needed (Ctrl+Shift+R)');
    console.log('');
    console.log('Share these results for further diagnosis!');
});
