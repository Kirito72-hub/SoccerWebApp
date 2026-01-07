import { supabase, isSupabaseConfigured } from './supabase';
import { User, League, Match, UserStats, ActivityLog } from '../types';
import bcrypt from 'bcryptjs';
import { emailService } from './emailService';
import { REQUIRE_EMAIL_VERIFICATION } from '../config/features';

// Default anime avatar options for new users
const DEFAULT_AVATARS = [
    '/avatars/anime_striker.png',
    '/avatars/anime_midfielder.png',
    '/avatars/anime_defender.png',
    '/avatars/anime_keeper.png',
    '/avatars/anime_winger.png',
    '/avatars/anime_captain.png',
    '/avatars/anime_strategist.png',
    '/avatars/anime_wild.png',
    '/avatars/anime_princess.png',
    '/avatars/anime_rookie.png',
    '/avatars/anime_veteran.png',
    '/avatars/anime_acrobat.png',
    '/avatars/anime_phantom.png',
    '/avatars/anime_coach.png',
    '/avatars/anime_analyst.png',
    '/avatars/anime_speedster.png',
    '/avatars/anime_wall.png',
    '/avatars/anime_prodigy.png',
    '/avatars/anime_twin_a.png',
];

// Helper function to get random avatar
const getRandomAvatar = (): string => {
    return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};

// Helper function to generate secure random token
const generateToken = (): string => {
    // Generate a random UUID + timestamp for extra uniqueness
    const uuid = crypto.randomUUID();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${uuid}-${timestamp}-${random}`;
};

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

        // Convert snake_case to camelCase
        return (data || []).map(user => ({
            id: user.id,
            email: user.email,
            password: user.password,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            dateOfBirth: user.date_of_birth,
            role: user.role,
            avatar: user.avatar
        }));
    },

    async getUserById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        // Convert snake_case to camelCase
        return {
            id: data.id,
            email: data.email,
            password: data.password,
            username: data.username,
            firstName: data.first_name,
            lastName: data.last_name,
            dateOfBirth: data.date_of_birth,
            role: data.role,
            avatar: data.avatar
        };
    },

    async createUser(userData: Omit<User, 'id' | 'avatar'>): Promise<User> {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                email: userData.email,
                password: hashedPassword,
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName,
                date_of_birth: userData.dateOfBirth,
                role: userData.role,
                avatar: getRandomAvatar()
            }])
            .select()
            .single();

        if (error) throw error;

        // Convert snake_case back to camelCase for our app
        return {
            id: data.id,
            email: data.email,
            password: data.password,
            username: data.username,
            firstName: data.first_name,
            lastName: data.last_name,
            dateOfBirth: data.date_of_birth,
            role: data.role,
            avatar: data.avatar
        };
    },

    async updateUser(id: string, updates: Partial<User>): Promise<void> {
        // Hash password if being updated
        const dbUpdates: any = {};

        if (updates.email) dbUpdates.email = updates.email;
        if (updates.username) dbUpdates.username = updates.username;
        if (updates.firstName) dbUpdates.first_name = updates.firstName;
        if (updates.lastName) dbUpdates.last_name = updates.lastName;
        if (updates.dateOfBirth) dbUpdates.date_of_birth = updates.dateOfBirth;
        if (updates.role) dbUpdates.role = updates.role;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;

        if (updates.password) {
            dbUpdates.password = await bcrypt.hash(updates.password, 10);
        }

        const { error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteUser(id: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Failed to delete user: ${error.message}`);
        }
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

        // Check if email is verified (controlled by feature flag in config/features.ts)
        if (REQUIRE_EMAIL_VERIFICATION && !user.email_verified) {
            throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }

        // Convert snake_case to camelCase
        return {
            id: user.id,
            email: user.email,
            password: user.password,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            dateOfBirth: user.date_of_birth,
            role: user.role,
            avatar: user.avatar
        };
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
        const newUser = await db.createUser({
            ...userData,
            role: 'normal_user'
        });

        // Send verification email
        try {
            const token = await this.createVerificationToken(newUser.id, 'email_verification');
            await emailService.sendVerificationEmail(newUser.email, token, newUser.username);
            console.log(`✅ Verification email sent to ${newUser.email}`);
        } catch (error) {
            console.error('Error sending verification email:', error);
            // Don't fail registration if email fails - user can request new verification email later
        }

        return newUser;
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
            adminId: league.admin_id,
            createdAt: new Date(league.created_at).getTime(),
            finishedAt: league.finished_at ? new Date(league.finished_at).getTime() : undefined,
            participantIds: league.participant_ids || [],
            winner: league.winner || null,
            standings: league.standings || undefined
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
            adminId: data.admin_id,
            createdAt: new Date(data.created_at).getTime(),
            finishedAt: data.finished_at ? new Date(data.finished_at).getTime() : undefined,
            participantIds: data.participant_ids || [],
            winner: data.winner || null,
            standings: data.standings || undefined
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
        if (updates.winner !== undefined) dbUpdates.winner = updates.winner;
        if (updates.standings !== undefined) dbUpdates.standings = updates.standings;

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
        const dbUpdates: any = {
            user_id: userId  // Required for upsert
        };

        if (stats.matchesPlayed !== undefined) dbUpdates.matches_played = stats.matchesPlayed;
        if (stats.leaguesParticipated !== undefined) dbUpdates.leagues_participated = stats.leaguesParticipated;
        if (stats.goalsScored !== undefined) dbUpdates.goals_scored = stats.goalsScored;
        if (stats.goalsConceded !== undefined) dbUpdates.goals_conceded = stats.goalsConceded;
        if (stats.championshipsWon !== undefined) dbUpdates.championships_won = stats.championshipsWon;
        if (stats.updatedAt !== undefined) dbUpdates.updated_at = new Date(stats.updatedAt).toISOString();

        // Use UPSERT to insert if not exists, update if exists
        const { error } = await supabase
            .from('user_stats')
            .upsert(dbUpdates, {
                onConflict: 'user_id'  // Update based on user_id conflict
            });

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
    },

    // ==================== DATABASE RESET ====================

    async resetDatabase(options: {
        leagues?: boolean;
        activityLogs?: boolean;
        users?: boolean;
    } = {}): Promise<void> {
        try {
            // Default to deleting everything if no options provided
            const {
                leagues = true,
                activityLogs = true,
                users = true
            } = options;

            // Use RPC function to bypass RLS policies
            const { data, error } = await supabase.rpc('reset_database_selective', {
                delete_leagues: leagues,
                delete_activity_logs: activityLogs,
                delete_users: users
            });

            if (error) {
                console.error('RPC error:', error);
                throw error;
            }

            console.log('Database reset complete with counts:', data);
            console.log('Reset options:', options);
        } catch (error) {
            console.error('Error resetting database:', error);
            throw error;
        }
    },

    // ==================== EMAIL VERIFICATION & PASSWORD RESET ====================

    /**
     * Create a verification token for email verification or password reset
     */
    async createVerificationToken(userId: string, type: 'email_verification' | 'password_reset'): Promise<string> {
        const token = generateToken();
        const expiresAt = new Date();

        // Email verification: 24 hours
        // Password reset: 1 hour
        if (type === 'email_verification') {
            expiresAt.setHours(expiresAt.getHours() + 24);
        } else {
            expiresAt.setHours(expiresAt.getHours() + 1);
        }

        const { error } = await supabase
            .from('verification_tokens')
            .insert({
                user_id: userId,
                token,
                type,
                expires_at: expiresAt.toISOString()
            });

        if (error) {
            console.error('Error creating verification token:', error);
            throw error;
        }

        console.log(`✅ Created ${type} token for user ${userId}`);
        return token;
    },

    /**
     * Verify a token and return the user ID if valid
     */
    async verifyToken(token: string, type: 'email_verification' | 'password_reset'): Promise<string | null> {
        console.log(`🔍 Verifying token: ${token.substring(0, 20)}... Type: ${type}`);

        const { data, error } = await supabase
            .from('verification_tokens')
            .select('*')
            .eq('token', token)
            .eq('type', type)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())  // Check expiration in database
            .single();

        if (error || !data) {
            console.log('❌ Token not found, already used, or expired', error);
            return null;
        }

        console.log('📋 Token found and valid:', {
            id: data.id,
            user_id: data.user_id,
            created_at: data.created_at,
            expires_at: data.expires_at,
            used_at: data.used_at
        });

        // Mark as used
        const { error: updateError } = await supabase
            .from('verification_tokens')
            .update({ used_at: new Date().toISOString() })
            .eq('id', data.id);

        if (updateError) {
            console.error('❌ Error marking token as used:', updateError);
            throw updateError;
        }

        console.log(`✅ Token verified for user ${data.user_id}`);
        return data.user_id;
    },

    /**
     * Mark user's email as verified
     */
    async verifyEmail(userId: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({
                email_verified: true,
                email_verified_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error verifying email:', error);
            throw error;
        }

        console.log(`✅ Email verified for user ${userId}`);
    },

    /**
     * Request password reset - sends email with reset link
     */
    async requestPasswordReset(email: string): Promise<void> {
        // Get user by email
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (!users || users.length === 0) {
            // Don't reveal if email exists (security best practice)
            console.log('Password reset requested for non-existent email (silent fail)');
            return;
        }

        const user = users[0];

        // Create reset token
        const token = await this.createVerificationToken(user.id, 'password_reset');

        // Send email
        try {
            await emailService.sendPasswordResetEmail(user.email, token, user.username);
            console.log(`✅ Password reset email sent to ${email}`);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    },

    /**
     * Reset password using a valid token
     */
    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        // Verify token
        const userId = await this.verifyToken(token, 'password_reset');
        if (!userId) {
            console.log('❌ Invalid or expired reset token');
            return false;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', userId);

        if (error) {
            console.error('Error resetting password:', error);
            throw error;
        }

        console.log(`✅ Password reset successfully for user ${userId}`);
        return true;
    }
};
