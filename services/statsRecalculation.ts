import { supabase } from './supabase';

/**
 * Recalculate user stats from all completed matches
 */
export async function recalculateAllUserStats(): Promise<{
    success: boolean;
    usersUpdated: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let usersUpdated = 0;

    try {
        // Get all completed matches
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'completed');

        if (matchError) {
            errors.push(`Failed to fetch matches: ${matchError.message}`);
            return { success: false, usersUpdated: 0, errors };
        }

        if (!matches || matches.length === 0) {
            return { success: true, usersUpdated: 0, errors: ['No completed matches found'] };
        }

        // Calculate stats for each user
        const userStatsMap = new Map<string, {
            matches_played: number;
            wins: number;
            losses: number;
            draws: number;
            total_goals: number;
            total_assists: number;
        }>();

        // Process each match
        for (const match of matches) {
            const homeUserId = match.home_user_id;
            const awayUserId = match.away_user_id;
            const homeScore = match.home_score ?? 0;
            const awayScore = match.away_score ?? 0;

            // Initialize stats if not exists
            if (!userStatsMap.has(homeUserId)) {
                userStatsMap.set(homeUserId, {
                    matches_played: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    total_goals: 0,
                    total_assists: 0
                });
            }
            if (!userStatsMap.has(awayUserId)) {
                userStatsMap.set(awayUserId, {
                    matches_played: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    total_goals: 0,
                    total_assists: 0
                });
            }

            // Get stats objects
            const homeStats = userStatsMap.get(homeUserId)!;
            const awayStats = userStatsMap.get(awayUserId)!;

            // Update matches played
            homeStats.matches_played++;
            awayStats.matches_played++;

            // Update goals
            homeStats.total_goals += homeScore;
            awayStats.total_goals += awayScore;

            // Update wins/losses/draws
            if (homeScore > awayScore) {
                homeStats.wins++;
                awayStats.losses++;
            } else if (awayScore > homeScore) {
                awayStats.wins++;
                homeStats.losses++;
            } else {
                homeStats.draws++;
                awayStats.draws++;
            }
        }

        // Update database for each user
        for (const [userId, stats] of userStatsMap.entries()) {
            // First, try to delete existing stats (if any)
            await supabase
                .from('user_stats')
                .delete()
                .eq('user_id', userId);

            // Then insert new stats
            const { error: insertError } = await supabase
                .from('user_stats')
                .insert({
                    user_id: userId,
                    matches_played: stats.matches_played,
                    wins: stats.wins,
                    losses: stats.losses,
                    draws: stats.draws,
                    total_goals: stats.total_goals,
                    total_assists: stats.total_assists,
                    leagues_created: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                errors.push(`Failed to update stats for user ${userId}: ${insertError.message}`);
            } else {
                usersUpdated++;
            }
        }

        return {
            success: errors.length === 0,
            usersUpdated,
            errors
        };

    } catch (error: any) {
        errors.push(`Unexpected error: ${error.message}`);
        return { success: false, usersUpdated: 0, errors };
    }
}

/**
 * Recalculate stats for a specific user
 */
export async function recalculateUserStats(userId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Get all completed matches for this user
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'completed')
            .or(`home_user_id.eq.${userId},away_user_id.eq.${userId}`);

        if (matchError) {
            return { success: false, error: matchError.message };
        }

        if (!matches || matches.length === 0) {
            return { success: true };
        }

        // Calculate stats
        let matches_played = 0;
        let wins = 0;
        let losses = 0;
        let draws = 0;
        let total_goals = 0;
        let total_assists = 0;

        for (const match of matches) {
            matches_played++;
            const isHome = match.home_user_id === userId;
            const userScore = isHome ? (match.home_score ?? 0) : (match.away_score ?? 0);
            const opponentScore = isHome ? (match.away_score ?? 0) : (match.home_score ?? 0);

            total_goals += userScore;

            if (userScore > opponentScore) {
                wins++;
            } else if (opponentScore > userScore) {
                losses++;
            } else {
                draws++;
            }
        }

        // Delete existing stats
        await supabase
            .from('user_stats')
            .delete()
            .eq('user_id', userId);

        // Insert new stats
        const { error: insertError } = await supabase
            .from('user_stats')
            .insert({
                user_id: userId,
                matches_played,
                wins,
                losses,
                draws,
                total_goals,
                total_assists,
                leagues_created: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
