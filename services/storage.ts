
import { League, Match, User, UserStats, ActivityLog } from '../types';

const STORAGE_KEYS = {
  LEAGUES: 'rakla_leagues',
  MATCHES: 'rakla_matches',
  USERS: 'rakla_users',
  STATS: 'rakla_stats',
  AUTH: 'rakla_current_user',
  ACTIVITY_LOGS: 'rakla_activity_logs'
};

// Initial Seed Data - CONFIGURE YOUR SUPERUSER HERE
// Replace these values with your own information before deploying
const DEFAULT_USERS: User[] = [
  {
    id: '1',
    email: 'your-email@example.com',  // CHANGE THIS
    password: 'your-secure-password',  // CHANGE THIS
    username: 'YourUsername',          // CHANGE THIS
    firstName: 'Your',                 // CHANGE THIS
    lastName: 'Name',                  // CHANGE THIS
    dateOfBirth: '1990-01-01',        // CHANGE THIS
    avatar: 'https://picsum.photos/seed/admin/200',
    role: 'superuser'
  }
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
  },

  // Helper to update a specific match
  updateMatch: (updatedMatch: Match) => {
    const matches = storage.getMatches();
    const index = matches.findIndex(m => m.id === updatedMatch.id);
    if (index !== -1) {
      matches[index] = updatedMatch;
      storage.saveMatches(matches);
    }
  },

  // Activity Log functions
  getActivityLogs: (): ActivityLog[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]'),
  saveActivityLogs: (logs: ActivityLog[]) => localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs)),

  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const logs = storage.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    logs.unshift(newLog); // Add to beginning for newest first
    storage.saveActivityLogs(logs);
  },

  // User management functions
  saveUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),

  updateUserRole: (userId: string, newRole: 'superuser' | 'pro_manager' | 'normal_user') => {
    const users = storage.getUsers();
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    storage.saveUsers(updatedUsers);
  },

  // Authentication functions
  login: (email: string, password: string): User | null => {
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    return user || null;
  },

  register: (userData: Omit<User, 'id' | 'role' | 'avatar'>): User => {
    const users = storage.getUsers();

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: 'normal_user', // All new users start as normal users
      avatar: `https://picsum.photos/seed/${userData.username}/200`
    };

    users.push(newUser);
    storage.saveUsers(users);

    // Initialize stats for new user
    storage.ensureUserStats(newUser.id);

    return newUser;
  },

  updateUserProfile: (userId: string, updates: { email?: string; password?: string; avatar?: string }) => {
    const users = storage.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });
    storage.saveUsers(updatedUsers);

    // Update current user if it's the one being updated
    const currentUser = storage.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updated = updatedUsers.find(u => u.id === userId);
      if (updated) {
        storage.setCurrentUser(updated);
      }
    }
  }
};
