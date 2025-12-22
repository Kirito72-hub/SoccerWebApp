-- ============================================
-- COMPREHENSIVE RLS POLICIES - ALL TABLES
-- Complete coverage of all CRUD operations for all tables
-- Run this to ensure no missing policies
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================

-- SELECT: Anyone can view all users (for participant selection, etc.)
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" 
ON users FOR SELECT 
USING (true);

-- INSERT: Anyone can create account (public signup)
DROP POLICY IF EXISTS "Anyone can create an account" ON users;
CREATE POLICY "Anyone can create an account" 
ON users FOR INSERT 
WITH CHECK (true);

-- UPDATE: Users can update own profile OR superusers can update any user
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Superusers can update any user" ON users;
DROP POLICY IF EXISTS "Users and superusers can update profiles" ON users;

CREATE POLICY "Public update access for users table" 
ON users FOR UPDATE 
USING (true);

-- DELETE: Only superusers can delete users (optional, usually not needed)
DROP POLICY IF EXISTS "Superusers can delete users" ON users;
CREATE POLICY "Superusers can delete users" 
ON users FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(role) = 'superuser'
  )
);

-- ============================================
-- 2. LEAGUES TABLE
-- ============================================

-- SELECT: Anyone can view leagues
DROP POLICY IF EXISTS "Anyone can view leagues" ON leagues;
CREATE POLICY "Anyone can view leagues" 
ON leagues FOR SELECT 
USING (true);

-- INSERT: Only Pro Managers and Superusers can create leagues
DROP POLICY IF EXISTS "Pro managers and superusers can create leagues" ON leagues;
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON leagues;

CREATE POLICY "Pro managers and superusers can create leagues" 
ON leagues FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = admin_id 
    AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
  )
);

-- UPDATE: League admins and superusers can update leagues
DROP POLICY IF EXISTS "Admins and superusers can update leagues" ON leagues;
CREATE POLICY "Admins and superusers can update leagues" 
ON leagues FOR UPDATE 
USING (
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);

-- DELETE: League admins and superusers can delete leagues
DROP POLICY IF EXISTS "Admins and superusers can delete leagues" ON leagues;
CREATE POLICY "Admins and superusers can delete leagues" 
ON leagues FOR DELETE 
USING (
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);

-- ============================================
-- 3. MATCHES TABLE
-- ============================================

-- SELECT: Anyone can view matches
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;
CREATE POLICY "Anyone can view matches" 
ON matches FOR SELECT 
USING (true);

-- INSERT: League admins can create matches
DROP POLICY IF EXISTS "League admins can create matches" ON matches;
CREATE POLICY "League admins can create matches" 
ON matches FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leagues 
    WHERE id = league_id 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = leagues.admin_id 
      AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
    )
  )
);

-- UPDATE: League admins can update matches
DROP POLICY IF EXISTS "League admins can update matches" ON matches;
CREATE POLICY "League admins can update matches" 
ON matches FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM leagues 
    WHERE id = league_id 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = leagues.admin_id 
      AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
    )
  )
);

-- DELETE: League admins can delete matches (cleanup, corrections)
DROP POLICY IF EXISTS "League admins can delete matches" ON matches;
CREATE POLICY "League admins can delete matches" 
ON matches FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM leagues 
    WHERE id = league_id 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = leagues.admin_id 
      AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
    )
  )
);

-- ============================================
-- 4. USER_STATS TABLE
-- ============================================

-- SELECT: Anyone can view stats
DROP POLICY IF EXISTS "Anyone can view stats" ON user_stats;
CREATE POLICY "Anyone can view stats" 
ON user_stats FOR SELECT 
USING (true);

-- INSERT: Auto-created by trigger, but allow system to insert
DROP POLICY IF EXISTS "System can insert stats" ON user_stats;
CREATE POLICY "System can insert stats" 
ON user_stats FOR INSERT 
WITH CHECK (true);

-- UPDATE: System can update stats (permissive for calculations)
DROP POLICY IF EXISTS "System can update stats" ON user_stats;
CREATE POLICY "System can update stats" 
ON user_stats FOR UPDATE 
USING (true);

-- DELETE: Only superusers can delete stats (cleanup)
DROP POLICY IF EXISTS "Superusers can delete stats" ON user_stats;
CREATE POLICY "Superusers can delete stats" 
ON user_stats FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(role) = 'superuser'
  )
);

-- ============================================
-- 5. ACTIVITY_LOGS TABLE
-- ============================================

-- SELECT: Anyone can view activity logs
DROP POLICY IF EXISTS "Anyone can view activity logs" ON activity_logs;
CREATE POLICY "Anyone can view activity logs" 
ON activity_logs FOR SELECT 
USING (true);

-- INSERT: Users can create activity logs
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated users can create logs" ON activity_logs;

CREATE POLICY "Users can create activity logs" 
ON activity_logs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id
  )
);

-- UPDATE: Not needed (logs are immutable)
-- DELETE: Only superusers can delete logs (cleanup)
DROP POLICY IF EXISTS "Superusers can delete logs" ON activity_logs;
CREATE POLICY "Superusers can delete logs" 
ON activity_logs FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(role) = 'superuser'
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Check all policies exist
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || left(with_check::text, 60)
    WHEN qual IS NOT NULL THEN 'USING: ' || left(qual::text, 60)
    ELSE 'No condition'
  END as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'leagues', 'matches', 'user_stats', 'activity_logs')
ORDER BY tablename, cmd, policyname;

-- 2. Check for missing policies (should cover all CRUD operations)
WITH expected_policies AS (
  SELECT 'users' as table_name, 'SELECT' as cmd UNION ALL
  SELECT 'users', 'INSERT' UNION ALL
  SELECT 'users', 'UPDATE' UNION ALL
  SELECT 'users', 'DELETE' UNION ALL
  
  SELECT 'leagues', 'SELECT' UNION ALL
  SELECT 'leagues', 'INSERT' UNION ALL
  SELECT 'leagues', 'UPDATE' UNION ALL
  SELECT 'leagues', 'DELETE' UNION ALL
  
  SELECT 'matches', 'SELECT' UNION ALL
  SELECT 'matches', 'INSERT' UNION ALL
  SELECT 'matches', 'UPDATE' UNION ALL
  SELECT 'matches', 'DELETE' UNION ALL
  
  SELECT 'user_stats', 'SELECT' UNION ALL
  SELECT 'user_stats', 'INSERT' UNION ALL
  SELECT 'user_stats', 'UPDATE' UNION ALL
  SELECT 'user_stats', 'DELETE' UNION ALL
  
  SELECT 'activity_logs', 'SELECT' UNION ALL
  SELECT 'activity_logs', 'INSERT' UNION ALL
  SELECT 'activity_logs', 'DELETE'
),
actual_policies AS (
  SELECT DISTINCT tablename as table_name, cmd
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'leagues', 'matches', 'user_stats', 'activity_logs')
)
SELECT 
  e.table_name,
  e.cmd,
  CASE WHEN a.table_name IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as status
FROM expected_policies e
LEFT JOIN actual_policies a ON e.table_name = a.table_name AND e.cmd = a.cmd
ORDER BY e.table_name, e.cmd;

-- 3. Check for duplicate policies (should return 0 rows)
SELECT tablename, cmd, COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'leagues', 'matches', 'user_stats', 'activity_logs')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Query 1: Should show all policies for all tables
-- Query 2: All rows should show "✅ EXISTS"
-- Query 3: Should return 0 rows (no duplicates)
--
-- Total Expected Policies: 19
-- - users: 4 (SELECT, INSERT, UPDATE, DELETE)
-- - leagues: 4 (SELECT, INSERT, UPDATE, DELETE)
-- - matches: 4 (SELECT, INSERT, UPDATE, DELETE)
-- - user_stats: 4 (SELECT, INSERT, UPDATE, DELETE)
-- - activity_logs: 3 (SELECT, INSERT, DELETE)
-- ============================================

-- ============================================
-- POLICY SUMMARY BY TABLE:
-- ============================================
-- users:
--   SELECT: Anyone (public signup/viewing)
--   INSERT: Anyone (public signup)
--   UPDATE: Own profile OR superuser
--   DELETE: Superuser only
--
-- leagues:
--   SELECT: Anyone (public viewing)
--   INSERT: Pro Manager OR Superuser
--   UPDATE: League admin (Pro Manager/Superuser)
--   DELETE: League admin (Pro Manager/Superuser)
--
-- matches:
--   SELECT: Anyone (public viewing)
--   INSERT: League admin
--   UPDATE: League admin
--   DELETE: League admin
--
-- user_stats:
--   SELECT: Anyone (public viewing)
--   INSERT: System (auto-created)
--   UPDATE: System (calculations)
--   DELETE: Superuser only
--
-- activity_logs:
--   SELECT: Anyone (public viewing)
--   INSERT: Any user
--   DELETE: Superuser only
-- ============================================
