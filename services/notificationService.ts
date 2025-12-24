import { dataService } from './dataService';
import { notificationStorage } from './notificationStorage';

// Message Banks - Funny, short, emoji-rich

// WIN MESSAGES - Encouraging & Celebratory 🎉
const WIN_MESSAGES = [
    "Absolute banger! 🔥⚽",
    "Victory tastes sweet! �🏆",
    "Domination mode activated! 😎",
    "Chef's kiss performance! �‍🍳💋",
    "They never stood a chance! �✨",
    "You dropped this 👑",
    "Flawless victory! 💎⚽",
    "They had families, you know... 💀😅",
    "Screaming GOLAZO! 📢🎉",
    "That's how we roll! ⚽➡️🌟"
];

// LOSS MESSAGES - Consolation & Encouraging 💪
const LOSS_MESSAGES = [
    "Tough one, but we bounce back! 💪🔄",
    "Even Messi has off days 🐐💙",
    "Lost the battle, not the war! ⚔️📈",
    "Shake it off! Next one's ours 👊✨",
    "Learning experience unlocked 📚🎓",
    "Can't win 'em all... but we'll try! �⚽",
    "Defeat is temporary, comeback is forever! 🔥💯",
    "We'll get 'em next time! 🎯🔜",
    "Ouch! But champions rise again �📈",
    "Not our day, but our time will come! ⏰✨"
];

// DRAW MESSAGES - Neutral & Accepting 🤝
const DRAW_MESSAGES = [
    "Perfectly balanced! ⚖️✨",
    "Honors even! 🤝⚽",
    "Neither won, neither lost! 🟰😌",
    "A draw? We'll take it! 🤷‍♂️⚽",
    "1 point is better than 0! 📊✨",
    "Stalemate! Next time we win 🎯🔥",
    "Tie game, but we're still in it! 💪🤝",
    "Draw FC strikes again! 😅⚽"
];

// LEAGUE MESSAGES
const LEAGUE_MESSAGES = {
    created: [
        "New League Alert! 🚨 Time to shine!",
        "You've been drafted! 📝 Let's go!",
        "Fresh league, fresh start! ⚽🆕",
        "A new challenger appears! ⚔️🔥",
        "League season begins! 🏁 Ready up!"
    ],
    finished: [
        "League concluded! 🏁 What a journey!",
        "Season's over! � Check the final standings!",
        "That's a wrap! 🎬 League finished!",
        "End of the road! 🛣️ See you next season!",
        "League complete! 🏆 Time to celebrate!"
    ]
};

// NEWS MESSAGES
const NEWS_MESSAGES = {
    appUpdate: [
        "New update dropped! 🎉 Check it out!",
        "App just got better! ✨ Update available!",
        "Fresh features incoming! � Update now!",
        "We've been cooking! 👨‍� New update!",
        "Update alert! 📲 Something new awaits!"
    ],
    announcement: [
        "Important announcement! 📢 Check it out!",
        "News flash! 📰 Something's happening!",
        "Heads up! 🔔 New announcement!",
        "Breaking news! 🗞️ Don't miss this!",
        "PSA: Important update! 📣✨"
    ]
};

/**
 * NotificationService - Handles news/announcement notifications
 * Match and League notifications are handled by T-Rex in useNotificationSystem.ts
 */
class NotificationService {

    // Helper to get random message
    getRandomMessage(messages: string[]): string {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Helper to check user preferences
    isEnabled(userId: string, type: 'leagues' | 'matches' | 'news'): boolean {
        return localStorage.getItem(`notifications_${type}_${userId}`) !== 'false';
    }

    /**
     * Send news notification to a specific user
     * Saves to database, T-Rex handles the system notification
     */
    private async send(
        title: string,
        body: string,
        userId: string,
        type: 'news'
    ) {
        console.log('📤 send() called:', { title, userId, type });

        try {
            await notificationStorage.addNotification(userId, {
                type,
                title,
                message: body
            });
            console.log('✅ Notification saved to Supabase database');
        } catch (error) {
            console.error('❌ Failed to save notification to database:', error);
            throw error;
        }

        console.log('📬 Notification saved to database. T-Rex will handle system notification.');
    }

    /**
     * Send news notifications to users
     * @param type - 'appUpdate' or 'announcement'
     * @param userId - User ID to send to
     * @param customMessage - Optional custom message (overrides random selection)
     */
    async handleNews(type: 'appUpdate' | 'announcement', userId: string, customMessage?: string) {
        // Only run if enabled
        if (!this.isEnabled(userId, 'news')) return;

        const messages = type === 'appUpdate' ? NEWS_MESSAGES.appUpdate : NEWS_MESSAGES.announcement;
        const message = customMessage || this.getRandomMessage(messages);
        const title = type === 'appUpdate' ? "App Update 🎉" : "Announcement 📢";

        await this.send(title, message, userId, 'news');
    }

    /**
     * Broadcast news to all users (respects individual preferences)
     * Call this when you want to notify everyone about an update/announcement
     */
    async broadcastNews(type: 'appUpdate' | 'announcement', customMessage?: string) {
        try {
            const users = await dataService.getUsers();
            users.forEach(user => {
                this.handleNews(type, user.id, customMessage);
            });
            console.log(`📢 Broadcast sent to ${users.length} users`);
        } catch (error) {
            console.error('Error broadcasting news:', error);
        }
    }
}

export const notificationService = new NotificationService();

// Export message banks for use in T-Rex handlers
export { WIN_MESSAGES, LOSS_MESSAGES, DRAW_MESSAGES, LEAGUE_MESSAGES, NEWS_MESSAGES };
