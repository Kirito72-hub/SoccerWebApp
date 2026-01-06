import { supabase } from './supabase';

/**
 * Recalculate user stats from all completed matches using Supabase RPC
 */
export async function recalculateAllUserStats(): Promise<{
    success: boolean;
    usersUpdated: number;
    errors: string[];
}> {
    try {
        // Call Supabase RPC function
        const { data, error } = await supabase
            .rpc('recalculate_all_user_stats');

        if (error) {
            return {
                success: false,
                usersUpdated: 0,
                errors: [`RPC Error: ${error.message}`]
            };
        }

        // Parse RPC result
        if (data && data.success) {
            return {
                success: true,
                usersUpdated: data.users_updated || 0,
                errors: []
            };
        } else {
            return {
                success: false,
                usersUpdated: 0,
                errors: [data?.error || 'Unknown error from RPC']
            };
        }

    } catch (error: any) {
        return {
            success: false,
            usersUpdated: 0,
            errors: [`Unexpected error: ${error.message}`]
        };
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
