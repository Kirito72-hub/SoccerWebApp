-- ============================================
-- ROLLBACK SECURITY FIXES
-- ============================================
-- Run this if you need to undo the security fixes

-- ============================================
-- 1. REVERT FUNCTION SEARCH PATH
-- ============================================

-- Revert update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() 
RESET search_path;

-- Revert create_user_stats function
ALTER FUNCTION public.create_user_stats() 
RESET search_path;

-- ============================================
-- 2. DISABLE RLS ON ACTIVITY_LOGS (Optional)
-- ============================================
-- Only run this if you want to completely disable RLS
-- (Not recommended - keep RLS enabled for security)

-- ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. REMOVE NOTIFICATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- Disable RLS on notifications (Optional)
-- ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check policies removed
SELECT 
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'notifications';
-- Should return 0 rows if all policies removed
