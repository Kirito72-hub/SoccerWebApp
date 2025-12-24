-- Check RLS policies on notifications table
-- Run this in Supabase SQL Editor to see current RLS status

-- 1. Check if RLS is enabled on notifications table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notifications';

-- 2. List all RLS policies on notifications table
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
WHERE schemaname = 'public' AND tablename = 'notifications';

-- 3. Test INSERT permission
SELECT 
    has_table_privilege('public.notifications', 'INSERT') as can_insert,
    has_table_privilege('public.notifications', 'SELECT') as can_select,
    has_table_privilege('public.notifications', 'UPDATE') as can_update;

-- 4. If RLS is enabled and blocking, disable it (we already did this before)
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 5. Test actual INSERT (replace with your user ID)
-- INSERT INTO notifications (user_id, type, title, message)
-- VALUES ('YOUR_USER_ID_HERE', 'match', 'Test Match', 'Testing RLS');
