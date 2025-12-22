-- Fix DELETE RLS policy for leagues table
-- This allows admins and superusers to delete leagues they manage

DROP POLICY IF EXISTS "Admins and superusers can delete leagues" ON leagues;

CREATE POLICY "Admins and superusers can delete leagues" 
ON leagues FOR DELETE 
USING (
  -- Allow if user is the admin of the league
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);

-- Verify the policy
SELECT policyname, cmd, qual as using_clause
FROM pg_policies 
WHERE tablename = 'leagues' AND cmd = 'DELETE';

-- Test query (replace with your user ID)
-- SELECT * FROM leagues WHERE admin_id = 'YOUR_USER_ID';
