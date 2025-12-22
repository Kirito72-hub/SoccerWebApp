-- Cleanup: Remove duplicate/old RLS policy for leagues
-- This removes the old permissive policy that allows any authenticated user to create leagues

-- Drop the old incorrect policy
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON leagues;

-- Verify only the correct policy remains
SELECT schemaname, tablename, policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'leagues' AND cmd = 'INSERT';

-- Expected result: Only "Pro managers and superusers can create leagues" should remain
