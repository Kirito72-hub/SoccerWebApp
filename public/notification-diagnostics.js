/**
 * Notification Diagnostics
 * Run this in browser console to check notification status
 */

async function diagnoseNotifications() {
    console.log('🔍 NOTIFICATION DIAGNOSTICS\n');

    // 1. Check if Notification API exists
    console.log('1️⃣ Notification API:', 'Notification' in window ? '✅ Available' : '❌ Not available');

    // 2. Check permission status
    if ('Notification' in window) {
        console.log('2️⃣ Permission:', Notification.permission);

        if (Notification.permission === 'denied') {
            console.log('   ⚠️ BLOCKED! User denied notifications');
            console.log('   Fix: Settings → Apps → Rakla → Notifications → Enable');
        }
    }

    // 3. Check Service Worker
    if ('serviceWorker' in navigator) {
        console.log('3️⃣ Service Worker: ✅ Supported');

        try {
            const registration = await navigator.serviceWorker.ready;
            console.log('   Registration:', registration ? '✅ Active' : '❌ Not registered');

            if (registration) {
                console.log('   Scope:', registration.scope);
                console.log('   Active:', registration.active ? '✅ Yes' : '❌ No');
            }
        } catch (error) {
            console.log('   ❌ Error:', error.message);
        }
    } else {
        console.log('3️⃣ Service Worker: ❌ Not supported');
    }

    // 4. Check if PWA is installed
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
    console.log('4️⃣ PWA Mode:', isPWA ? '✅ Installed' : '⚠️ Browser mode');

    // 5. Test notification
    console.log('\n5️⃣ Testing notification...');

    if (Notification.permission === 'granted') {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification('Test Notification', {
                    body: 'If you see this, notifications work!',
                    icon: '/icons/pwa-192x192.png',
                    badge: '/icons/pwa-192x192.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: true,
                    tag: 'test-notification'
                });
                console.log('   ✅ Test notification sent!');
                console.log('   Check if you saw/heard it');
            }
        } catch (error) {
            console.log('   ❌ Failed:', error.message);
        }
    } else {
        console.log('   ⚠️ Cannot test - permission not granted');
    }

    // 6. Platform info
    console.log('\n6️⃣ Platform Info:');
    console.log('   User Agent:', navigator.userAgent);
    console.log('   Platform:', navigator.platform);
    console.log('   Online:', navigator.onLine ? '✅ Yes' : '❌ No');

    // 7. Recommendations
    console.log('\n📋 RECOMMENDATIONS:');

    if (Notification.permission !== 'granted') {
        console.log('   ⚠️ Grant notification permission');
    }

    if (!isPWA) {
        console.log('   ⚠️ Install as PWA for better notifications');
    }

    if (Notification.permission === 'granted' && isPWA) {
        console.log('   ✅ Everything looks good!');
        console.log('   If notifications still don\'t work:');
        console.log('   1. Check Android Settings → Apps → Rakla → Notifications');
        console.log('   2. Make sure "Show notifications" is ON');
        console.log('   3. Make sure sound/vibration is enabled');
        console.log('   4. Disable battery optimization for Rakla');
    }

    console.log('\n✅ Diagnostics complete!');
}

// Run diagnostics
diagnoseNotifications();
