-- =====================================================
-- ENABLE SUPABASE REALTIME
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE leagues;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Step 2: Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- You should see:
-- public | users
-- public | leagues
-- public | matches

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you get an error "publication does not exist", run this first:
-- CREATE PUBLICATION supabase_realtime;

-- Then run the ALTER PUBLICATION commands above again

-- =====================================================
-- VERIFY IN DASHBOARD
-- =====================================================

-- After running this SQL:
-- 1. Go to Supabase Dashboard
-- 2. Database → Replication
-- 3. You should see "supabase_realtime" publication
-- 4. Tables: users, leagues, matches should be listed

-- =====================================================
-- TEST REALTIME
-- =====================================================

-- Open your app in two browser windows
-- Make a change in one window
-- Check browser console for:
-- [Realtime] ✅ Successfully subscribed to leagues
-- [Realtime] 🔴 leagues INSERT: {...}

-- If you see these messages, realtime is working!
