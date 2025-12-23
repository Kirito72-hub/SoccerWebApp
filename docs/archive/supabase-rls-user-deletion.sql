-- =====================================================
-- SUPABASE RLS POLICIES FOR USER DELETION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- First, let's check if RLS is enabled
-- If this returns empty, RLS is not enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 1: Drop existing DELETE policies (clean slate)
-- =====================================================
DROP POLICY IF EXISTS "superusers_can_delete_non_superusers" ON users;
DROP POLICY IF EXISTS "users_cannot_delete_themselves" ON users;
DROP POLICY IF EXISTS "superusers_cannot_be_deleted" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can delete" ON users;

-- =====================================================
-- STEP 2: Create new DELETE policy
-- =====================================================

-- This policy allows deletion if:
-- 1. The user making the request exists in the users table
-- 2. The user making the request has role = 'superuser'
-- 3. The user being deleted is NOT a superuser
-- 4. The user is not trying to delete themselves

CREATE POLICY "superuser_delete_policy"
ON users
FOR DELETE
TO authenticated
USING (
  -- The account being deleted must NOT be a superuser
  role != 'superuser'
  -- AND the current user must be a superuser
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superuser'
  )
  -- AND the user cannot delete themselves
  AND id != auth.uid()
);

-- =====================================================
-- ALTERNATIVE: If you're NOT using Supabase Auth
-- (i.e., you're managing sessions in localStorage)
-- =====================================================

-- If you're using localStorage for auth, you need a different approach
-- Comment out the above policy and use this instead:

-- DROP POLICY IF EXISTS "superuser_delete_policy" ON users;

-- CREATE POLICY "allow_all_deletes_for_testing"
-- ON users
-- FOR DELETE
-- USING (true);

-- WARNING: The above policy allows ANYONE to delete users!
-- Only use this for testing or if you're handling auth client-side
-- In production, you should handle deletion via a server function

-- =====================================================
-- STEP 3: Verify policies are active
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
AND cmd = 'DELETE';

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If deletion still doesn't work, check:

-- 1. Check if you're authenticated with Supabase Auth:
SELECT auth.uid(); -- Should return a UUID, not NULL

-- 2. Check your current user's role:
SELECT id, email, role FROM users WHERE id = auth.uid();

-- 3. Test the policy manually:
-- Try to delete a test user and see the error:
-- DELETE FROM users WHERE id = 'some-user-id';

-- 4. If you see "new row violates row-level security policy"
--    Then RLS is working but blocking you
--    You need to either:
--    a) Make sure you're logged in as a superuser
--    b) Use the "allow_all_deletes_for_testing" policy above
--    c) Use a server-side function to bypass RLS

-- =====================================================
-- OPTION: Server-side function to bypass RLS
-- =====================================================

-- Create a function that runs with SECURITY DEFINER
-- This bypasses RLS and runs with the function owner's permissions

CREATE OR REPLACE FUNCTION delete_user_as_admin(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  target_user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();

  -- Get the target user's role
  SELECT role INTO target_user_role
  FROM users
  WHERE id = user_id;

  -- Check if current user is superuser
  IF current_user_role != 'superuser' THEN
    RAISE EXCEPTION 'Only superusers can delete users';
  END IF;

  -- Check if trying to delete a superuser
  IF target_user_role = 'superuser' THEN
    RAISE EXCEPTION 'Cannot delete superuser accounts';
  END IF;

  -- Check if trying to delete self
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Perform the deletion
  DELETE FROM users WHERE id = user_id;
END;
$$;

-- To use this function from your app:
-- SELECT delete_user_as_admin('user-id-here');

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_as_admin TO authenticated;
