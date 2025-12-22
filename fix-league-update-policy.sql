-- Fix: Add missing UPDATE policy for leagues table
-- This allows Pro Managers and Superusers to update league status (e.g., finish league)

DROP POLICY IF EXISTS "Admins and superusers can update leagues" ON leagues;

CREATE POLICY "Admins and superusers can update leagues" 
ON leagues FOR UPDATE 
USING (
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);

-- Verify the policy
SELECT policyname, cmd, qual as using_clause
FROM pg_policies 
WHERE tablename = 'leagues' AND cmd = 'UPDATE';

-- Expected result: Should show "Admins and superusers can update leagues"
