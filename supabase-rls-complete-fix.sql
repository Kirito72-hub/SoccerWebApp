-- ============================================
-- FINAL COMPLETE RLS FIX - ALL POLICIES
-- Run this in Supabase SQL Editor to apply all fixes
-- ============================================

-- 1. LEAGUES - INSERT POLICY
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON leagues;
DROP POLICY IF EXISTS "Pro managers and superusers can create leagues" ON leagues;

CREATE POLICY "Pro managers and superusers can create leagues" 
ON leagues FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = admin_id 
    AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
  )
);

-- 2. LEAGUES - DELETE POLICY
DROP POLICY IF EXISTS "Admins and superusers can delete leagues" ON leagues;

CREATE POLICY "Admins and superusers can delete leagues" 
ON leagues FOR DELETE 
USING (
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);

-- 3. MATCHES - INSERT POLICY
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

-- 4. MATCHES - UPDATE POLICY
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

-- 5. ACTIVITY_LOGS - INSERT POLICY
DROP POLICY IF EXISTS "Authenticated users can create logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;

CREATE POLICY "Users can create activity logs" 
ON activity_logs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all policies
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || left(with_check::text, 80)
    WHEN qual IS NOT NULL THEN 'USING: ' || left(qual::text, 80)
    ELSE 'No condition'
  END as policy_condition
FROM pg_policies
WHERE tablename IN ('leagues', 'matches', 'activity_logs')
ORDER BY tablename, cmd, policyname;

-- Check for duplicate policies (should return 0 rows)
SELECT tablename, cmd, COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('leagues', 'matches', 'activity_logs')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Leagues: SELECT, INSERT, UPDATE, DELETE policies
-- Matches: SELECT, INSERT, UPDATE policies
-- Activity_logs: SELECT, INSERT policies
-- No duplicates
-- All policies use admin_id/user_id, NOT auth.uid()
-- All role checks use LOWER(role)
-- ============================================
