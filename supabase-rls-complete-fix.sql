-- ============================================
-- COMPLETE RLS FIX FOR CUSTOM AUTHENTICATION
-- Apply all these fixes in Supabase SQL Editor
-- ============================================

-- 1. FIX LEAGUES TABLE - INSERT POLICY
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

-- 2. FIX MATCHES TABLE - INSERT POLICY
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

-- 3. FIX MATCHES TABLE - UPDATE POLICY
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

-- 4. FIX ACTIVITY_LOGS TABLE - INSERT POLICY
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

-- 5. (OPTIONAL) FIX LEAGUES TABLE - DELETE POLICY
DROP POLICY IF EXISTS "Admins and superusers can delete leagues" ON leagues;

CREATE POLICY "Admins and superusers can delete leagues" 
ON leagues FOR DELETE 
USING (
  admin_id IN (SELECT id FROM users WHERE LOWER(role) IN ('superuser', 'pro_manager'))
  OR
  EXISTS (SELECT 1 FROM users WHERE id = admin_id AND LOWER(role) = 'superuser')
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all policies
SELECT tablename, policyname, cmd, 
       CASE 
         WHEN with_check IS NOT NULL THEN 'CHECK: ' || left(with_check::text, 100)
         WHEN qual IS NOT NULL THEN 'USING: ' || left(qual::text, 100)
         ELSE 'No condition'
       END as policy_condition
FROM pg_policies
WHERE tablename IN ('leagues', 'matches', 'activity_logs')
ORDER BY tablename, cmd, policyname;

-- Check for duplicate policies
SELECT tablename, cmd, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('leagues', 'matches', 'activity_logs')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- 1. All policies should use admin_id or user_id, NOT auth.uid()
-- 2. All role checks should use LOWER(role) for case-insensitivity
-- 3. No duplicate policies should exist
-- 4. Verification query should return 0 rows (no duplicates)
-- ============================================
