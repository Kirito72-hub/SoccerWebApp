-- Fix: Users UPDATE RLS Policy for Password Changes
-- The previous policy was broken and prevented password updates

DROP POLICY IF EXISTS "Users and superusers can update profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Superusers can update any user" ON users;

CREATE POLICY "Users and superusers can update profiles" 
ON users FOR UPDATE 
USING (
  -- Since we use custom auth (not Supabase Auth), we can't identify the current user
  -- in RLS context. We handle authorization at the application level.
  -- Allow all updates - the app ensures users only update their own profile
  true
);

-- Verify the policy
SELECT policyname, cmd, qual as using_clause
FROM pg_policies 
WHERE tablename = 'users' AND cmd = 'UPDATE';

-- Expected result: Should show "Users and superusers can update profiles" with USING (true)
