-- Supabase RPC Function to Recalculate User Stats
-- This function runs with SECURITY DEFINER, bypassing RLS policies

CREATE OR REPLACE FUNCTION recalculate_all_user_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_updated integer := 0;
    total_users integer := 0;
    result json;
BEGIN
    -- Delete all existing stats
    DELETE FROM user_stats;
    
    -- Recalculate and insert stats for each user
    INSERT INTO user_stats (
        user_id,
        matches_played,
        wins,
        losses,
        draws,
        total_goals,
        total_assists,
        leagues_created,
        created_at,
        updated_at
    )
    SELECT 
        u.id as user_id,
        COALESCE(stats.matches_played, 0) as matches_played,
        COALESCE(stats.wins, 0) as wins,
        COALESCE(stats.losses, 0) as losses,
        COALESCE(stats.draws, 0) as draws,
        COALESCE(stats.total_goals, 0) as total_goals,
        0 as total_assists,
        COALESCE(league_count.count, 0) as leagues_created,
        NOW() as created_at,
        NOW() as updated_at
    FROM 
        users u
    LEFT JOIN (
        -- Calculate match stats
        SELECT 
            user_id,
            COUNT(*) as matches_played,
            SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins,
            SUM(CASE WHEN lost THEN 1 ELSE 0 END) as losses,
            SUM(CASE WHEN draw THEN 1 ELSE 0 END) as draws,
            SUM(goals) as total_goals
        FROM (
            -- Home matches
            SELECT 
                home_user_id as user_id,
                CASE WHEN home_score > away_score THEN true ELSE false END as won,
                CASE WHEN home_score < away_score THEN true ELSE false END as lost,
                CASE WHEN home_score = away_score THEN true ELSE false END as draw,
                COALESCE(home_score, 0) as goals
            FROM matches
            WHERE status = 'completed'
            
            UNION ALL
            
            -- Away matches
            SELECT 
                away_user_id as user_id,
                CASE WHEN away_score > home_score THEN true ELSE false END as won,
                CASE WHEN away_score < home_score THEN true ELSE false END as lost,
                CASE WHEN away_score = home_score THEN true ELSE false END as draw,
                COALESCE(away_score, 0) as goals
            FROM matches
            WHERE status = 'completed'
        ) all_matches
        GROUP BY user_id
    ) stats ON u.id = stats.user_id
    LEFT JOIN (
        -- Count leagues created
        SELECT admin_id, COUNT(*) as count
        FROM leagues
        GROUP BY admin_id
    ) league_count ON u.id = league_count.admin_id;
    
    -- Get count of users updated
    GET DIAGNOSTICS users_updated = ROW_COUNT;
    
    -- Get total users
    SELECT COUNT(*) INTO total_users FROM users;
    
    -- Return result as JSON
    result := json_build_object(
        'success', true,
        'users_updated', users_updated,
        'total_users', total_users,
        'message', 'Stats recalculated successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error as JSON
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to recalculate stats'
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION recalculate_all_user_stats() TO authenticated;

-- Comment
COMMENT ON FUNCTION recalculate_all_user_stats() IS 'Recalculates user statistics from all completed matches. Bypasses RLS policies.';
