-- Check RLS status and permissions for activity_logs table
-- Run this in Supabase SQL Editor

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'activity_logs';

-- 2. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'activity_logs';

-- 3. Test DELETE permission (as current user)
-- This will show if you can delete from activity_logs
SELECT 
    has_table_privilege('activity_logs', 'DELETE') as can_delete,
    has_table_privilege('activity_logs', 'SELECT') as can_select,
    has_table_privilege('activity_logs', 'INSERT') as can_insert,
    has_table_privilege('activity_logs', 'UPDATE') as can_update;

-- 4. If RLS is causing issues, run this to disable it:
-- (Uncomment the line below if needed)
-- ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- 5. If you want to drop all policies on activity_logs:
-- (Uncomment the lines below if needed)
-- DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
-- DROP POLICY IF EXISTS "Superusers can view all activity" ON activity_logs;
-- DROP POLICY IF EXISTS "System can insert activity" ON activity_logs;

-- 6. RECOMMENDED: Disable RLS for activity_logs
-- Since the app uses custom auth (not Supabase Auth), RLS will block operations
-- Uncomment this line to fix:
-- ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- After disabling RLS, the database reset will work properly!
