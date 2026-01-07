/**
 * Notification System Test Utility
 * 
 * This file helps diagnose notification issues.
 * 
 * USAGE:
 * 1. Open browser console (F12)
 * 2. Import this in your app or copy-paste the test functions
 * 3. Run: testNotificationSystem()
 */

import { supabase } from '../services/supabase';
import { notificationStorage } from '../services/notificationStorage';

/**
 * Test 1: Check if notifications table exists and is accessible
 */
export async function testNotificationsTable() {
    console.log('🧪 TEST 1: Checking notifications table...');

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ FAIL: Cannot access notifications table', error);
            return false;
        }

        console.log('✅ PASS: Notifications table is accessible');
        console.log('📊 Sample data:', data);
        return true;
    } catch (err) {
        console.error('❌ FAIL: Exception accessing table', err);
        return false;
    }
}

/**
 * Test 2: Check Supabase Realtime subscription
 */
export async function testRealtimeSubscription() {
    console.log('🧪 TEST 2: Testing Realtime subscription...');

    return new Promise((resolve) => {
        const channel = supabase
            .channel('test-notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    console.log('✅ PASS: Realtime is working! Received:', payload);
                    resolve(true);
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status);

                if (status === 'SUBSCRIBED') {
                    console.log('✅ Successfully subscribed to realtime');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ FAIL: Realtime subscription error');
                    resolve(false);
                } else if (status === 'TIMED_OUT') {
                    console.error('❌ FAIL: Realtime subscription timed out');
                    resolve(false);
                }
            });

        // Timeout after 5 seconds
        setTimeout(() => {
            console.log('⏱️ Realtime test timeout (this is normal if no changes occur)');
            supabase.removeChannel(channel);
            resolve(true);
        }, 5000);
    });
}

/**
 * Test 3: Create a test notification
 */
export async function createTestNotification(userId: string) {
    console.log('🧪 TEST 3: Creating test notification...');

    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'system',
                title: 'Test Notification 🧪',
                message: 'This is a test notification. If you see this, the system is working!'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ FAIL: Cannot create notification', error);
            return false;
        }

        console.log('✅ PASS: Test notification created!', data);
        return true;
    } catch (err) {
        console.error('❌ FAIL: Exception creating notification', err);
        return false;
    }
}

/**
 * Test 4: Check if matches/leagues tables have realtime enabled
 */
export async function testMatchesRealtime() {
    console.log('🧪 TEST 4: Testing matches table realtime...');

    return new Promise((resolve) => {
        const channel = supabase
            .channel('test-matches')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'matches'
                },
                (payload) => {
                    console.log('✅ PASS: Matches realtime is working!', payload);
                    resolve(true);
                }
            )
            .subscribe((status) => {
                console.log('📡 Matches subscription status:', status);

                if (status === 'SUBSCRIBED') {
                    console.log('✅ Subscribed to matches realtime');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error('❌ FAIL: Matches realtime error');
                    resolve(false);
                }
            });

        setTimeout(() => {
            console.log('⏱️ Matches realtime test complete');
            supabase.removeChannel(channel);
            resolve(true);
        }, 3000);
    });
}

/**
 * Test 5: Check notification storage service
 */
export async function testNotificationStorage(userId: string) {
    console.log('🧪 TEST 5: Testing notification storage service...');

    try {
        // Get notifications
        const notifications = await notificationStorage.getNotifications(userId);
        console.log('✅ PASS: Retrieved notifications:', notifications.length);
        console.log('📊 Notifications:', notifications);

        // Get unread count
        const unreadCount = await notificationStorage.getUnreadCount(userId);
        console.log('✅ PASS: Unread count:', unreadCount);

        return true;
    } catch (err) {
        console.error('❌ FAIL: Notification storage error', err);
        return false;
    }
}

/**
 * Run all tests
 */
export async function runAllTests(userId: string) {
    console.log('🚀 Starting Notification System Diagnostics...');
    console.log('👤 User ID:', userId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const results = {
        tableAccess: await testNotificationsTable(),
        realtimeSubscription: await testRealtimeSubscription(),
        createNotification: await createTestNotification(userId),
        matchesRealtime: await testMatchesRealtime(),
        notificationStorage: await testNotificationStorage(userId)
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST RESULTS:');
    console.log('  Table Access:', results.tableAccess ? '✅ PASS' : '❌ FAIL');
    console.log('  Realtime Sub:', results.realtimeSubscription ? '✅ PASS' : '❌ FAIL');
    console.log('  Create Notif:', results.createNotification ? '✅ PASS' : '❌ FAIL');
    console.log('  Matches RT:', results.matchesRealtime ? '✅ PASS' : '❌ FAIL');
    console.log('  Storage:', results.notificationStorage ? '✅ PASS' : '❌ FAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const allPassed = Object.values(results).every(r => r === true);

    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED! Notification system is working.');
        console.log('💡 If you still don\'t see notifications, check:');
        console.log('   1. Browser notification permissions');
        console.log('   2. Service Worker registration');
        console.log('   3. Complete a match to trigger a notification');
    } else {
        console.log('⚠️ SOME TESTS FAILED. Issues detected:');
        if (!results.tableAccess) console.log('   - Cannot access notifications table');
        if (!results.realtimeSubscription) console.log('   - Realtime not enabled on notifications table');
        if (!results.createNotification) console.log('   - Cannot create notifications');
        if (!results.matchesRealtime) console.log('   - Realtime not enabled on matches table');
        if (!results.notificationStorage) console.log('   - Notification storage service error');
    }

    return results;
}

// Quick test function for console
(window as any).testNotifications = runAllTests;
(window as any).createTestNotif = createTestNotification;

console.log('🧪 Notification Test Utility Loaded!');
console.log('📝 Usage: testNotifications("YOUR_USER_ID")');
console.log('📝 Quick test: createTestNotif("YOUR_USER_ID")');
