-- FIX: Disable RLS on notifications table
-- The app uses custom auth (localStorage), not Supabase Auth
-- So auth.uid() is always NULL and blocks all queries

-- Disable RLS
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (they won't work with custom auth)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- The app will handle authorization in the application layer
-- using user_id filters in queries
