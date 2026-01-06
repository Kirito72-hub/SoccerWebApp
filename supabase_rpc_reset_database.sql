-- RPC function to reset database with SECURITY DEFINER to bypass RLS
-- This allows superusers to delete data even with RLS policies in place

CREATE OR REPLACE FUNCTION reset_database_selective(
    delete_leagues BOOLEAN DEFAULT true,
    delete_activity_logs BOOLEAN DEFAULT true,
    delete_users BOOLEAN DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS policies
AS $$
DECLARE
    superuser_ids TEXT[];
    deleted_counts json;
    leagues_count INT := 0;
    matches_count INT := 0;
    activity_logs_count INT := 0;
    users_count INT := 0;
    notifications_count INT := 0;
BEGIN
    -- Get all superuser IDs to preserve them
    SELECT ARRAY_AGG(id::TEXT)
    INTO superuser_ids
    FROM users
    WHERE role = 'superuser';

    -- Delete activity logs if requested
    IF delete_activity_logs THEN
        DELETE FROM activity_logs WHERE id != '00000000-0000-0000-0000-000000000000';
        GET DIAGNOSTICS activity_logs_count = ROW_COUNT;
    END IF;

    -- Always delete notifications (no option to keep them)
    DELETE FROM notifications WHERE id != '00000000-0000-0000-0000-000000000000';
    GET DIAGNOSTICS notifications_count = ROW_COUNT;

    -- Delete leagues and matches if requested (matches must be deleted with leagues)
    IF delete_leagues THEN
        DELETE FROM matches WHERE id != '00000000-0000-0000-0000-000000000000';
        GET DIAGNOSTICS matches_count = ROW_COUNT;
        
        DELETE FROM leagues WHERE id != '00000000-0000-0000-0000-000000000000';
        GET DIAGNOSTICS leagues_count = ROW_COUNT;
    END IF;

    -- Delete users except superusers if requested
    IF delete_users THEN
        IF superuser_ids IS NOT NULL AND array_length(superuser_ids, 1) > 0 THEN
            DELETE FROM users 
            WHERE id != ALL(superuser_ids::UUID[])
            AND id != '00000000-0000-0000-0000-000000000000';
            GET DIAGNOSTICS users_count = ROW_COUNT;
        ELSE
            -- Delete all users if no superusers exist
            DELETE FROM users WHERE id != '00000000-0000-0000-0000-000000000000';
            GET DIAGNOSTICS users_count = ROW_COUNT;
        END IF;
    END IF;

    -- Return counts of deleted records
    deleted_counts := json_build_object(
        'leagues', leagues_count,
        'matches', matches_count,
        'activity_logs', activity_logs_count,
        'users', users_count,
        'notifications', notifications_count
    );

    RETURN deleted_counts;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_database_selective(BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
