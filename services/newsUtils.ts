/**
 * News Notification Utilities
 * 
 * Use these functions to send news notifications to users.
 * Only works when users have "News Notifications" enabled in their Profile settings.
 */

import { notificationService } from './notificationService';

/**
 * Send app update notification to all users
 * Call this after deploying a new version
 * 
 * @param customMessage - Optional custom message (e.g., "v1.3.0 is here! Check out PWA features!")
 * 
 * @example
 * // After deploying v1.3.0
 * sendAppUpdateNotification("v1.3.0 is live! 🎉 Install the PWA for offline access!");
 */
export async function sendAppUpdateNotification(customMessage?: string) {
    await notificationService.broadcastNews('appUpdate', customMessage);
    console.log('✅ App update notification sent to all users');
}

/**
 * Send system announcement to all users
 * Use for important announcements, maintenance, events, etc.
 * 
 * @param message - The announcement message
 * 
 * @example
 * sendSystemAnnouncement("Server maintenance tonight at 2 AM. Expect 30min downtime.");
 * sendSystemAnnouncement("New tournament starting this weekend! 🏆 Sign up now!");
 */
export async function sendSystemAnnouncement(message: string) {
    await notificationService.broadcastNews('announcement', message);
    console.log('✅ System announcement sent to all users');
}

/**
 * Send news notification to a specific user
 * 
 * @param userId - User ID to send to
 * @param type - 'appUpdate' or 'announcement'
 * @param message - Optional custom message
 * 
 * @example
 * sendNewsToUser('user-123', 'announcement', 'You won the monthly tournament! 🏆');
 */
export function sendNewsToUser(
    userId: string,
    type: 'appUpdate' | 'announcement',
    message?: string
) {
    notificationService.handleNews(type, userId, message);
    console.log(`✅ News sent to user ${userId}`);
}

// Example usage in browser console:
// import { sendAppUpdateNotification, sendSystemAnnouncement } from './services/newsUtils';
//
// // Send app update
// await sendAppUpdateNotification();
//
// // Send custom app update
// await sendAppUpdateNotification("v1.3.0 is here! PWA support added! 🎉");
//
// // Send system announcement
// await sendSystemAnnouncement("Tournament finals this Sunday! 🏆");
