import { dataService } from './dataService';
import { User, Match, League } from '../types';

// Message Banks - Modern, funny, minimal emoji
const WIN_MESSAGES = [
    "Boom! 3 points for you! 🚀",
    "Absolute masterclass! ⚽🔥",
    "You dropped this 👑 (It's a win)",
    "Clean sheet? Maybe. Win? Definitely. 😎",
    "Cooking with gas! 🍳 Keep the streak alive!",
    "Ez game, ez life. GG! 🎮",
    "They had families, you know... 💀 Great win!",
    "Another one bites the dust 🎵 Victory is yours!"
];

const LOSS_MESSAGES = [
    "Oof. That one crazy... 🤕",
    "Even Messi has off days. 🐐 Chin up!",
    "Mission failed, we'll get 'em next time. 🫡",
    "Controller disconnected? 🎮 Happens to the best of us.",
    "Tactical defeat. Lulling them into false security. 🧠",
    "Rough day at the office. Regroup and go again! 💪",
    "The script was against you today. 📜",
    "Unlucky! The comeback story starts now. 📈"
];

const LEAGUE_MESSAGES = {
    joined: [
        "New League Alert! 🚨 It's time to shine.",
        "You've been drafted! 📝 Good luck in the new league.",
        "A new challenger approaches! ⚔️ League started."
    ],
    finished: [
        "League's wrapped up! 🏁 Check the final standings.",
        "It's all over! 🛑 Did you bring home the silverware?",
        "Season finale! 📺 See where you placed."
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
        return localStorage.getItem(`notifications_${type}_${userId}`) === 'true';
    }

    // Send actual browser notification
    private send(title: string, body: string, tag?: string) {
        if (!this.hasPermission()) return;

        // Try to use Service Worker registration if available (for mobile support)
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body,
                    icon: '/icons/icon.svg',
                    badge: '/icons/icon.svg',
                    tag,
                    vibrate: [200, 100, 200]
                } as any);
            });
        } else {
            // Fallback to standard Notification API
            new Notification(title, {
                body,
                icon: '/icons/icon.svg',
                tag
            });
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
            this.send("Victory! 🏆", this.getRandomMessage(WIN_MESSAGES), `match-${match.id}`);
        } else if (userScore < opponentScore) {
            this.send("Defeat 💔", this.getRandomMessage(LOSS_MESSAGES), `match-${match.id}`);
        } else {
            this.send("Draw 🤝", "Points shared today. Not great, not terrible.", `match-${match.id}`);
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

            this.send("League Update 📋", msg, `rank-${leagueId}`);

        } catch (e) {
            console.error("Error checking table pos", e);
        }
    }

    // 2. LEAGUE NOTIFICATIONS
    handleLeagueUpdate(league: League, userId: string, type: 'INSERT' | 'UPDATE') {
        // Only notify if user is participant
        if (!league.participantIds.includes(userId)) return;

        // Only run if enabled
        if (!this.isEnabled(userId, 'leagues')) return;

        if (type === 'INSERT') {
            this.send("League Started! ⚽", this.getRandomMessage(LEAGUE_MESSAGES.joined), `league-${league.id}`);
        } else if (type === 'UPDATE' && league.status === 'finished') {
            this.send("League Finished 🏁", this.getRandomMessage(LEAGUE_MESSAGES.finished), `league-end-${league.id}`);
        }
    }

    // 3. NEWS (Placeholder)
    handleNews(newsItem: any) {
        // Future dev
    }
}

export const notificationService = new NotificationService();
