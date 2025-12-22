import { supabase, isSupabaseConfigured } from './supabase';
import { User, League, Match, UserStats, ActivityLog } from '../types';
import bcrypt from 'bcryptjs';

// Database service that works with Supabase
export const db = {
    // Check if using Supabase or localStorage
    isOnline: () => isSupabaseConfigured(),

    // ==================== USER OPERATIONS ====================

    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getUserById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async createUser(userData: Omit<User, 'id' | 'avatar'>): Promise<User> {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                ...userData,
                password: hashedPassword,
                avatar: `https://picsum.photos/seed/${userData.username}/200`
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateUser(id: string, updates: Partial<User>): Promise<void> {
        // Hash password if being updated
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteUser(id: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async login(email: string, password: string): Promise<User | null> {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) return null;

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return user;
    },

    async register(userData: Omit<User, 'id' | 'role' | 'avatar'>): Promise<User> {
        // Check if email exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email.toLowerCase())
            .single();

        if (existing) {
            throw new Error('Email already exists');
        }

        // Create user with normal_user role
        return await db.createUser({
            ...userData,
            role: 'normal_user'
        });
    },

    async updateUserRole(userId: string, newRole: 'superuser' | 'pro_manager' | 'normal_user'): Promise<void> {
        await db.updateUser(userId, { role: newRole });
    },

    // ==================== LEAGUE OPERATIONS ====================

    async getLeagues(): Promise<League[]> {
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert participant_ids from array to match our type
        return (data || []).map(league => ({
            ...league,
            createdAt: new Date(league.created_at).getTime(),
            finishedAt: league.finished_at ? new Date(league.finished_at).getTime() : undefined,
            participantIds: league.participant_ids || []
        }));
    },

    async getLeagueById(id: string): Promise<League | null> {
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            ...data,
            createdAt: new Date(data.created_at).getTime(),
            finishedAt: data.finished_at ? new Date(data.finished_at).getTime() : undefined,
            participantIds: data.participant_ids || []
        };
    },

    async createLeague(league: Omit<League, 'id'>): Promise<League> {
        const { data, error } = await supabase
            .from('leagues')
            .insert([{
                name: league.name,
                admin_id: league.adminId,
                format: league.format,
                status: league.status,
                participant_ids: league.participantIds,
                created_at: new Date(league.createdAt).toISOString(),
                finished_at: league.finishedAt ? new Date(league.finishedAt).toISOString() : null
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            adminId: data.admin_id,
            createdAt: new Date(data.created_at).getTime(),
            finishedAt: data.finished_at ? new Date(data.finished_at).getTime() : undefined,
            participantIds: data.participant_ids || []
        };
    },

    async updateLeague(id: string, updates: Partial<League>): Promise<void> {
        const dbUpdates: any = {};

        if (updates.name) dbUpdates.name = updates.name;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.participantIds) dbUpdates.participant_ids = updates.participantIds;
        if (updates.finishedAt) dbUpdates.finished_at = new Date(updates.finishedAt).toISOString();

        const { error } = await supabase
            .from('leagues')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteLeague(id: string): Promise<void> {
        const { error } = await supabase
            .from('leagues')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== MATCH OPERATIONS ====================

    async getMatches(): Promise<Match[]> {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        return (data || []).map(match => ({
            ...match,
            leagueId: match.league_id,
            homeUserId: match.home_user_id,
            awayUserId: match.away_user_id,
            homeScore: match.home_score,
            awayScore: match.away_score,
            date: new Date(match.date).getTime()
        }));
    },

    async getMatchesByLeagueId(leagueId: string): Promise<Match[]> {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('league_id', leagueId)
            .order('date', { ascending: true });

        if (error) throw error;

        return (data || []).map(match => ({
            ...match,
            leagueId: match.league_id,
            homeUserId: match.home_user_id,
            awayUserId: match.away_user_id,
            homeScore: match.home_score,
            awayScore: match.away_score,
            date: new Date(match.date).getTime()
        }));
    },

    async createMatch(match: Omit<Match, 'id'>): Promise<Match> {
        const { data, error } = await supabase
            .from('matches')
            .insert([{
                league_id: match.leagueId,
                home_user_id: match.homeUserId,
                away_user_id: match.awayUserId,
                home_score: match.homeScore,
                away_score: match.awayScore,
                status: match.status,
                date: new Date(match.date).toISOString(),
                round: match.round
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            leagueId: data.league_id,
            homeUserId: data.home_user_id,
            awayUserId: data.away_user_id,
            homeScore: data.home_score,
            awayScore: data.away_score,
            date: new Date(data.date).getTime()
        };
    },

    async updateMatch(id: string, updates: Partial<Match>): Promise<void> {
        const dbUpdates: any = {};

        if (updates.homeScore !== undefined) dbUpdates.home_score = updates.homeScore;
        if (updates.awayScore !== undefined) dbUpdates.away_score = updates.awayScore;
        if (updates.status) dbUpdates.status = updates.status;

        const { error } = await supabase
            .from('matches')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteMatch(id: string): Promise<void> {
        const { error } = await supabase
            .from('matches')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== USER STATS OPERATIONS ====================

    async getUserStats(userId: string): Promise<UserStats | null> {
        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) return null;

        return {
            userId: data.user_id,
            matchesPlayed: data.matches_played,
            leaguesParticipated: data.leagues_participated,
            goalsScored: data.goals_scored,
            goalsConceded: data.goals_conceded,
            championshipsWon: data.championships_won,
            updatedAt: new Date(data.updated_at).getTime()
        };
    },

    async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
        const dbUpdates: any = {};

        if (stats.matchesPlayed !== undefined) dbUpdates.matches_played = stats.matchesPlayed;
        if (stats.leaguesParticipated !== undefined) dbUpdates.leagues_participated = stats.leaguesParticipated;
        if (stats.goalsScored !== undefined) dbUpdates.goals_scored = stats.goalsScored;
        if (stats.goalsConceded !== undefined) dbUpdates.goals_conceded = stats.goalsConceded;
        if (stats.championshipsWon !== undefined) dbUpdates.championships_won = stats.championshipsWon;

        const { error } = await supabase
            .from('user_stats')
            .update(dbUpdates)
            .eq('user_id', userId);

        if (error) throw error;
    },

    // ==================== ACTIVITY LOG OPERATIONS ====================

    async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map(log => ({
            ...log,
            userId: log.user_id,
            timestamp: new Date(log.timestamp).getTime()
        }));
    },

    async createActivityLog(log: Omit<ActivityLog, 'id'>): Promise<void> {
        const { error } = await supabase
            .from('activity_logs')
            .insert([{
                type: log.type,
                user_id: log.userId,
                username: log.username,
                description: log.description,
                timestamp: new Date(log.timestamp).toISOString(),
                metadata: log.metadata || null
            }]);

        if (error) throw error;
    }
};
