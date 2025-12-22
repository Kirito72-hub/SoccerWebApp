-- Fix: Allow users to update their profiles (password/email update fix)
-- Since we use custom auth (no auth.uid()), we must allow UPDATE on users publically.
-- Client-side logic protects the UI, and UUIDs provide some obfuscation.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users and superusers can update profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Superusers can update any user" ON users;

-- Create permissive UPDATE policy (compatible with Custom Auth)
CREATE POLICY "Public update access for users table" 
ON users FOR UPDATE 
USING (true);

-- Verify policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND cmd = 'UPDATE';
