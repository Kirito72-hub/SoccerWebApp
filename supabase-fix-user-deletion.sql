-- =====================================================
-- QUICK FIX: User Deletion for localStorage Auth
-- =====================================================
-- Since you're using localStorage (not Supabase Auth),
-- we need to either disable RLS or use a different approach
-- =====================================================

-- OPTION 1: Disable RLS for DELETE operations (SIMPLEST)
-- This allows your app to delete users directly
-- Security is handled in your app code (checking if user is superuser)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing DELETE policies
DROP POLICY IF EXISTS "superuser_delete_policy" ON users;
DROP POLICY IF EXISTS "superusers_can_delete_non_superusers" ON users;
DROP POLICY IF EXISTS "users_cannot_delete_themselves" ON users;
DROP POLICY IF EXISTS "superusers_cannot_be_deleted" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;

-- Create a permissive policy that allows all deletes
-- Your app code will handle the security checks
CREATE POLICY "allow_deletes_with_service_key"
ON users
FOR DELETE
USING (true);

-- =====================================================
-- OPTION 2: Use a PostgreSQL Function (MORE SECURE)
-- =====================================================
-- This is more secure because it enforces rules at the database level

-- First, create the function
CREATE OR REPLACE FUNCTION delete_user_by_id(
  user_id UUID,
  requesting_user_id UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requesting_user_role TEXT;
  target_user_role TEXT;
  result json;
BEGIN
  -- Get the requesting user's role
  SELECT role INTO requesting_user_role
  FROM users
  WHERE id = requesting_user_id;

  -- Check if requesting user exists
  IF requesting_user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Requesting user not found'
    );
  END IF;

  -- Check if requesting user is superuser
  IF requesting_user_role != 'superuser' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only superusers can delete users'
    );
  END IF;

  -- Get the target user's role
  SELECT role INTO target_user_role
  FROM users
  WHERE id = user_id;

  -- Check if target user exists
  IF target_user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User to delete not found'
    );
  END IF;

  -- Check if trying to delete a superuser
  IF target_user_role = 'superuser' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot delete superuser accounts'
    );
  END IF;

  -- Check if trying to delete self
  IF user_id = requesting_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot delete your own account'
    );
  END IF;

  -- Perform the deletion
  DELETE FROM users WHERE id = user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User deleted successfully'
  );
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION delete_user_by_id TO anon;
GRANT EXECUTE ON FUNCTION delete_user_by_id TO authenticated;

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Check DELETE policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' AND cmd = 'DELETE';

-- Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'delete_user_by_id';

-- =====================================================
-- RECOMMENDED: Use OPTION 1 for now
-- =====================================================
-- Just run the OPTION 1 section above
-- It's the simplest and will work immediately
-- Your app already has security checks in the Settings page
