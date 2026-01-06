import { db } from './database';
import { storage } from './storage';
import { User, League, Match, UserStats, ActivityLog } from '../types';

/**
 * Unified data service that automatically uses Supabase when configured,
 * with fallback to localStorage for development/offline mode.
 */
export const dataService = {
    // ==================== USER OPERATIONS ====================

    async getUsers(): Promise<User[]> {
        if (db.isOnline()) {
            return await db.getUsers();
        }
        return storage.getUsers();
    },

    async getUserById(id: string): Promise<User | null> {
        if (db.isOnline()) {
            return await db.getUserById(id);
        }
        return storage.getUsers().find(u => u.id === id) || null;
    },

    async updateUserRole(userId: string, newRole: 'superuser' | 'pro_manager' | 'normal_user'): Promise<void> {
        if (db.isOnline()) {
            await db.updateUserRole(userId, newRole);
        } else {
            storage.updateUserRole(userId, newRole);
        }
    },

    async deleteUser(userId: string): Promise<void> {
        if (db.isOnline()) {
            await db.deleteUser(userId);
        } else {
            const users = storage.getUsers().filter(u => u.id !== userId);
            storage.saveUsers(users);
        }
    },

    // ==================== LEAGUE OPERATIONS ====================

    async getLeagues(): Promise<League[]> {
        if (db.isOnline()) {
            return await db.getLeagues();
        }
        return storage.getLeagues();
    },

    async getLeagueById(id: string): Promise<League | null> {
        if (db.isOnline()) {
            return await db.getLeagueById(id);
        }
        return storage.getLeagues().find(l => l.id === id) || null;
    },

    async createLeague(league: Omit<League, 'id'>): Promise<League> {
        if (db.isOnline()) {
            return await db.createLeague(league);
        }
        return storage.createLeague(league);
    },

    async updateLeague(id: string, updates: Partial<League>): Promise<void> {
        if (db.isOnline()) {
            await db.updateLeague(id, updates);
        } else {
            const leagues = storage.getLeagues();
            const updated = leagues.map(l => l.id === id ? { ...l, ...updates } : l);
            storage.saveLeagues(updated);
        }
    },

    async deleteLeague(id: string): Promise<void> {
        if (db.isOnline()) {
            await db.deleteLeague(id);
        } else {
            storage.deleteLeague(id);
        }
    },

    // ==================== MATCH OPERATIONS ====================

    async getMatches(): Promise<Match[]> {
        if (db.isOnline()) {
            return await db.getMatches();
        }
        return storage.getMatches();
    },

    async getMatchesByLeagueId(leagueId: string): Promise<Match[]> {
        if (db.isOnline()) {
            return await db.getMatchesByLeagueId(leagueId);
        }
        return storage.getMatches().filter(m => m.leagueId === leagueId);
    },

    async createMatch(match: Omit<Match, 'id'>): Promise<Match> {
        if (db.isOnline()) {
            return await db.createMatch(match);
        }
        // localStorage doesn't have createMatch, so we'll add it to storage.ts if needed
        const newMatch: Match = {
            ...match,
            id: Math.random().toString(36).substr(2, 9)
        };
        const matches = storage.getMatches();
        matches.push(newMatch);
        storage.saveMatches(matches);
        return newMatch;
    },

    async updateMatch(id: string, updates: Partial<Match>): Promise<void> {
        if (db.isOnline()) {
            await db.updateMatch(id, updates);
        } else {
            storage.updateMatch({ id, ...updates } as Match);
        }
    },

    async deleteMatch(id: string): Promise<void> {
        if (db.isOnline()) {
            await db.deleteMatch(id);
        } else {
            const matches = storage.getMatches().filter(m => m.id !== id);
            storage.saveMatches(matches);
        }
    },

    // ==================== USER STATS OPERATIONS ====================

    async getUserStats(userId: string): Promise<UserStats | null> {
        if (db.isOnline()) {
            return await db.getUserStats(userId);
        }
        return storage.getStats().find(s => s.userId === userId) || null;
    },

    async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
        if (db.isOnline()) {
            await db.updateUserStats(userId, stats);
        } else {
            const allStats = storage.getStats();
            const updated = allStats.map(s =>
                s.userId === userId ? { ...s, ...stats } : s
            );
            storage.saveStats(updated);
        }
    },

    async ensureUserStats(userId: string): Promise<void> {
        if (db.isOnline()) {
            // Check if stats exist, if not create them
            const stats = await db.getUserStats(userId);
            if (!stats) {
                await db.updateUserStats(userId, {
                    userId,
                    matchesPlayed: 0,
                    leaguesParticipated: 0,
                    goalsScored: 0,
                    goalsConceded: 0,
                    championshipsWon: 0,
                    updatedAt: Date.now()
                });
            }
        } else {
            storage.ensureUserStats(userId);
        }
    },

    // ==================== ACTIVITY LOG OPERATIONS ====================

    async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
        if (db.isOnline()) {
            return await db.getActivityLogs(limit);
        }
        return storage.getActivityLogs().slice(0, limit);
    },

    async createActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
        if (db.isOnline()) {
            await db.createActivityLog({ ...log, timestamp: Date.now() });
        } else {
            storage.addActivityLog(log);
        }
    },

    // ==================== SESSION MANAGEMENT ====================
    // These always use localStorage for session persistence

    getCurrentUser(): User | null {
        return storage.getCurrentUser();
    },

    setCurrentUser(user: User | null): void {
        storage.setCurrentUser(user);
    },

    // ==================== DATABASE MANAGEMENT ====================

    async resetDatabase(options: {
        leagues?: boolean;
        activityLogs?: boolean;
        users?: boolean;
    } = {}): Promise<void> {
        if (db.isOnline()) {
            await db.resetDatabase(options);
        } else {
            throw new Error('Database reset is only available when connected to Supabase');
        }
    },

    // ==================== UTILITY ====================

    isOnline(): boolean {
        return db.isOnline();
    }
};
