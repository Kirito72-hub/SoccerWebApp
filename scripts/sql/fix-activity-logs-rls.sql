-- FIX: Disable RLS on activity_logs table
-- The app uses custom auth (localStorage), not Supabase Auth
-- So auth.uid() is always NULL and blocks all queries

-- Disable RLS
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (they won't work with custom auth)
DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
DROP POLICY IF EXISTS "Superusers can view all activity" ON activity_logs;
DROP POLICY IF EXISTS "System can insert activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can view activity" ON activity_logs;
DROP POLICY IF EXISTS "Admins can manage activity" ON activity_logs;

-- The app will handle authorization in the application layer
-- using user_id filters in queries

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'activity_logs';

-- Should show: rls_enabled = false
