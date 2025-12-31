-- ============================================
-- FIX SUPABASE SECURITY WARNINGS
-- ============================================
-- This script fixes all security issues detected by Supabase

-- ============================================
-- 1. FIX FUNCTION SEARCH PATH (Security)
-- ============================================
-- Functions should have immutable search_path to prevent SQL injection

-- Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = '';

-- Fix create_user_stats function
ALTER FUNCTION public.create_user_stats() 
SET search_path = '';

-- ============================================
-- 2. ENABLE RLS ON ACTIVITY_LOGS
-- ============================================
-- Table has policies but RLS is not enabled

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Verify existing policies are correct
-- (Policies already exist: "Anyone can view activity logs", "Users can create activity logs")

-- ============================================
-- 3. ENABLE RLS ON NOTIFICATIONS
-- ============================================
-- Table is public but RLS is not enabled

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can insert their own notifications
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================

-- Check function search paths
SELECT 
    routine_name,
    routine_schema,
    specific_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_updated_at_column', 'create_user_stats');

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('activity_logs', 'notifications');

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('activity_logs', 'notifications')
ORDER BY tablename, policyname;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running this script:
-- ✅ update_updated_at_column: search_path = ''
-- ✅ create_user_stats: search_path = ''
-- ✅ activity_logs: RLS enabled
-- ✅ notifications: RLS enabled with 4 policies
-- ✅ All security warnings resolved
