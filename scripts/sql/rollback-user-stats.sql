-- ============================================
-- ROLLBACK USER_STATS TABLE
-- ============================================
-- Run this to remove the user_stats table and related objects

-- Drop triggers
DROP TRIGGER IF EXISTS create_user_stats_trigger ON public.users;
DROP TRIGGER IF EXISTS update_user_stats_timestamp ON public.user_stats;

-- Drop functions
DROP FUNCTION IF EXISTS create_user_stats_on_signup();
DROP FUNCTION IF EXISTS update_user_stats_updated_at();

-- Drop policies
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "System can insert stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can delete own stats" ON public.user_stats;

-- Drop table (this will also drop indexes)
DROP TABLE IF EXISTS public.user_stats CASCADE;

-- Verification
SELECT 
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'user_stats';
-- Should return 0 rows if table is dropped
