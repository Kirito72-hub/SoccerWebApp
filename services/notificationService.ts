import { dataService } from './dataService';
import { User, Match, League } from '../types';
import { notificationStorage } from './notificationStorage';

// Message Banks - Funny, short, emoji-rich

// WIN MESSAGES - Encouraging & Celebratory 🎉
const WIN_MESSAGES = [
    "Boom! 3 points in the bag! 🚀⚽",
    "Absolute masterclass! 🔥👑",
    "Victory tastes sweet! 🍯🏆",
    "They didn't stand a chance! 😎💪",
    "Clean sheet, dirty win! 🧼⚽",
    "Ez game, ez life! 🎮✨",
    "That's how champions play! 👑⚡",
    "Another W for the collection! 📈🥇",
    "Goals? We got 'em! 🎯🔥",
    "Cooking with gas! 🍳💨",
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
    "Plot twist: Comeback incoming! 🎬🚀",
    "Rough patch, but champions rise! 🌅💪",
    "Controller disconnected? 🎮 Happens!",
    "They got lucky today 🍀 We'll get 'em!",
    "Tactical L. Redemption loading... ⏳🔥",
    "Not our day, but our time will come! ⏰✨",
    "Heads up! We're still in this! 🦁💙",
    "Every champion loses sometimes 🏆📉",
    "Unlucky! The comeback starts now 📈⚡"
];

// DRAW MESSAGES - Mixed feelings 🤝
const DRAW_MESSAGES = [
    "Points shared today 🤝 Not bad!",
    "Perfectly balanced ⚖️ As all things should be",
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
        "League started! Show 'em what you got! 💪✨",
        "New season, new trophy? 🏆👀"
    ],
    finished: [
        "League's wrapped! 🏁 Check the standings!",
        "Season finale! 📺 Did you win it all?",
        "It's all over! 🛑 Trophy time?",
        "Final whistle! 🎵 How'd you do?",
        "League complete! 🏆 Silverware secured?",
        "That's a wrap! 🎬 Check your rank!"
    ]
};

// NEWS MESSAGES - App updates & Announcements
const NEWS_MESSAGES = {
    appUpdate: [
        "App updated! 🎉 Check out what's new!",
        "New features just dropped! 🚀✨",
        "We've leveled up! 📈 Update available!",
        "Fresh update incoming! 🆕🔥",
        "Your app got a glow-up! ✨💅"
    ],
    announcement: [
        "Important announcement! 📢 Check it out!",
        "News flash! 📰 Something's happening!",
        "Heads up! 🔔 New announcement!",
        "Breaking news! 🗞️ Don't miss this!",
        "PSA: Important update! 📣✨"
    ]
};

class NotificationService {

    // Helper to get random message
    private getRandomMessage(messages: string[]): string {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Helper to check permission
    private hasPermission(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    // Helper to check user preferences
    private isEnabled(userId: string, type: 'leagues' | 'matches' | 'news'): boolean {
        return localStorage.getItem(`notifications_${type}_${userId}`) !== 'false';
    }

    // Send actual browser notification
    private async send(
        title: string,
        body: string,
        userId: string,
        type: 'league' | 'match' | 'news' | 'system',
        tag?: string
    ) {
        // Save to notification storage (in-app notification center) - MUST AWAIT!
        const savedNotification = await notificationStorage.addNotification(userId, {
            type,
            title,
            message: body
        });

        // Send browser push notification if permission granted
        if (!this.hasPermission()) {
            console.log('⚠️ Browser notifications not permitted');
            return;
        }

        console.log('🔔 Sending browser push notification:', title);

        // Use consistent tag based on DB ID if available
        const notificationTag = savedNotification ? `notification-${savedNotification.id}` : (tag || `notification-${Date.now()}`);

        // Enhanced notification options
        const notificationOptions: NotificationOptions = {
            body,
            icon: '/icons/pwa-192x192.png',  // Fixed: Use existing PWA icon
            badge: '/icons/pwa-192x192.png', // Fixed: Use existing PWA icon
            tag: notificationTag,
            vibrate: [200, 100, 200, 100, 200], // Vibration pattern
            requireInteraction: true, // Stays visible until user interacts
            silent: false, // Play sound
            renotify: true, // Alert even if tag exists
            timestamp: Date.now(),
            data: {
                url: window.location.origin,
                type,
                userId
            },
            actions: [
                {
                    action: 'view',
                    title: 'View'
                },
                {
                    action: 'close',
                    title: 'Dismiss'
                }
            ]
        };

        try {
            // Try to use Service Worker registration (preferred for PWA)
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, notificationOptions);
                console.log('✅ Browser notification sent via Service Worker');
            } else {
                // Fallback to standard Notification API
                const notification = new Notification(title, notificationOptions);

                // Handle notification click
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };

                console.log('✅ Browser notification sent via Notification API');
            }
        } catch (error) {
            console.error('❌ Failed to send browser notification:', error);
        }
    }

    // --- MAIN TRIGGERS ---

    // 1. MATCH NOTIFICATIONS
    async handleMatchUpdate(match: Match, userId: string) {
        // Only run if user is involved
        if (match.homeUserId !== userId && match.awayUserId !== userId) return;

        // Only run if notifications enabled
        if (!this.isEnabled(userId, 'matches')) return;

        // Skip if match not completed
        if (match.status !== 'completed') return;

        const isHome = match.homeUserId === userId;
        const userScore = isHome ? match.homeScore : match.awayScore;
        const opponentScore = isHome ? match.awayScore : match.homeScore;

        if (userScore === undefined || opponentScore === undefined) return;

        // Result Logic
        if (userScore > opponentScore) {
            await this.send("Victory! 🏆", this.getRandomMessage(WIN_MESSAGES), userId, 'match', `match-${match.id}`);
        } else if (userScore < opponentScore) {
            await this.send("Defeat 💔", this.getRandomMessage(LOSS_MESSAGES), userId, 'match', `match-${match.id}`);
        } else {
            await this.send("Draw 🤝", this.getRandomMessage(DRAW_MESSAGES), userId, 'match', `match-${match.id}`);
        }

        // Table Position Check (Every 3 matches)
        await this.checkTablePosition(userId, match.leagueId);
    }

    // Check table position
    private async checkTablePosition(userId: string, leagueId: string) {
        // Logic: Increment a counter in storage
        const counterKey = `match_count_${leagueId}_${userId}`;
        const currentCount = parseInt(localStorage.getItem(counterKey) || '0') + 1;
        localStorage.setItem(counterKey, currentCount.toString());

        // Only notify every 3 matches
        if (currentCount % 3 !== 0) return;

        // Calculate Position
        try {
            const matches = await dataService.getMatches();
            const leagueMatches = matches.filter(m => m.leagueId === leagueId && m.status === 'completed');

            // Get league to find participants
            const leagues = await dataService.getLeagues();
            const league = leagues.find(l => l.id === leagueId);
            if (!league) return;

            // Simple standings calc
            const standings = league.participantIds.map(pid => {
                const stats = { id: pid, points: 0, gd: 0, gf: 0 };
                leagueMatches.forEach(m => {
                    if (m.homeUserId === pid || m.awayUserId === pid) {
                        const isHome = m.homeUserId === pid;
                        const pScore = isHome ? m.homeScore! : m.awayScore!;
                        const oScore = isHome ? m.awayScore! : m.homeScore!;

                        if (pScore > oScore) stats.points += 3;
                        else if (pScore === oScore) stats.points += 1;
                        stats.gd += (pScore - oScore);
                        stats.gf += pScore;
                    }
                });
                return stats;
            }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

            const rank = standings.findIndex(s => s.id === userId) + 1;

            let msg = `You are currently sitting at #${rank} in the tables. 📊`;
            if (rank === 1) msg = "You are TOP of the league! 🥇 Everyone is chasing you!";
            else if (rank === standings.length) msg = "Currently bottom of the pile... 📉 Time to wake up!";

            await this.send("League Update 📋", msg, userId, 'match', `rank-${leagueId}`);

        } catch (e) {
            console.error("Error checking table pos", e);
        }
    }

    // 2. LEAGUE NOTIFICATIONS
    async handleLeagueUpdate(league: League, userId: string, type: 'INSERT' | 'UPDATE') {
        // Only notify if user is participant
        if (!league.participantIds.includes(userId)) return;

        // Only run if enabled
        if (!this.isEnabled(userId, 'leagues')) return;

        if (type === 'INSERT') {
            await this.send("League Started! ⚽", this.getRandomMessage(LEAGUE_MESSAGES.created), userId, 'league', `league-${league.id}`);
        } else if (type === 'UPDATE' && league.status === 'finished') {
            await this.send("League Finished 🏁", this.getRandomMessage(LEAGUE_MESSAGES.finished), userId, 'league', `league-end-${league.id}`);
        }
    }

    // 3. NEWS NOTIFICATIONS
    /**
     * Send news notifications to users
     * @param type - 'appUpdate' or 'announcement'
     * @param userId - User ID to send to (or 'all' for broadcast)
     * @param customMessage - Optional custom message (overrides random selection)
     */
    async handleNews(type: 'appUpdate' | 'announcement', userId: string, customMessage?: string) {
        // Only run if enabled
        if (!this.isEnabled(userId, 'news')) return;

        const messages = type === 'appUpdate' ? NEWS_MESSAGES.appUpdate : NEWS_MESSAGES.announcement;
        const message = customMessage || this.getRandomMessage(messages);
        const title = type === 'appUpdate' ? "App Update 🎉" : "Announcement 📢";

        await this.send(title, message, userId, 'news', `news-${type}-${Date.now()}`);
    }

    /**
     * Broadcast news to all users (respects individual preferences)
     * Call this when you want to notify everyone about an update/announcement
     */
    async broadcastNews(type: 'appUpdate' | 'announcement', customMessage?: string) {
        try {
            const users = await dataService.getUsers();

            // Execute sequentially to prevent race conditions/rate limits
            console.log(`📢 Starting broadcast to ${users.length} users...`);
            for (const user of users) {
                await this.handleNews(type, user.id, customMessage);
            }
            console.log(`✅ Broadcast complete to ${users.length} users`);
        } catch (error) {
            console.error('Error broadcasting news:', error);
        }
    }
}

export const notificationService = new NotificationService();
