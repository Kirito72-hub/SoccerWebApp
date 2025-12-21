
import { League, Match, User, UserStats } from '../types';

const STORAGE_KEYS = {
  LEAGUES: 'rakla_leagues',
  MATCHES: 'rakla_matches',
  USERS: 'rakla_users',
  STATS: 'rakla_stats',
  AUTH: 'rakla_current_user'
};

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  { id: '1', email: 'ryan@rakla.com', username: 'Ryan Crawford', avatar: 'https://picsum.photos/seed/ryan/200' },
  { id: '2', email: 'alex@rakla.com', username: 'Alex Striker', avatar: 'https://picsum.photos/seed/alex/200' },
  { id: '3', email: 'sarah@rakla.com', username: 'Sarah Keeper', avatar: 'https://picsum.photos/seed/sarah/200' },
  { id: '4', email: 'mike@rakla.com', username: 'Mike Defender', avatar: 'https://picsum.photos/seed/mike/200' },
];

export const storage = {
  getLeagues: (): League[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAGUES) || '[]'),
  saveLeagues: (leagues: League[]) => localStorage.setItem(STORAGE_KEYS.LEAGUES, JSON.stringify(leagues)),
  
  getMatches: (): Match[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]'),
  saveMatches: (matches: Match[]) => localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches)),
  
  getUsers: (): User[] => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!users) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(users);
  },
  
  getStats: (): UserStats[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '[]'),
  saveStats: (stats: UserStats[]) => localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)),
  
  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH) || 'null'),
  setCurrentUser: (user: User | null) => localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user)),

  // Helper to initialize missing stats for a user
  ensureUserStats: (userId: string) => {
    const stats = storage.getStats();
    if (!stats.find(s => s.userId === userId)) {
      stats.push({
        userId,
        matchesPlayed: 0,
        leaguesParticipated: 0,
        goalsScored: 0,
        goalsConceded: 0,
        championshipsWon: 0,
        updatedAt: Date.now()
      });
      storage.saveStats(stats);
    }
  }
};
