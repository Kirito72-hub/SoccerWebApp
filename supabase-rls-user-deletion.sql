-- Row Level Security (RLS) Policies for User Deletion
-- Run these commands in your Supabase SQL Editor

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only superusers can delete non-superuser accounts
-- This prevents regular users from deleting any accounts
CREATE POLICY "superusers_can_delete_non_superusers"
ON users
FOR DELETE
USING (
  -- Check if the current user is a superuser
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'superuser'
  )
  -- AND the account being deleted is NOT a superuser
  AND role != 'superuser'
);

-- Policy 2: Prevent users from deleting themselves
-- This adds an extra layer of protection
CREATE POLICY "users_cannot_delete_themselves"
ON users
FOR DELETE
USING (
  id != auth.uid()
);

-- Policy 3: Superusers cannot be deleted by anyone (extra protection)
-- This is redundant with Policy 1 but provides explicit protection
CREATE POLICY "superusers_cannot_be_deleted"
ON users
FOR DELETE
USING (
  role != 'superuser'
);

-- Verify policies are active
SELECT * FROM pg_policies WHERE tablename = 'users' AND cmd = 'DELETE';

-- To drop these policies if needed (for testing):
-- DROP POLICY IF EXISTS "superusers_can_delete_non_superusers" ON users;
-- DROP POLICY IF EXISTS "users_cannot_delete_themselves" ON users;
-- DROP POLICY IF EXISTS "superusers_cannot_be_deleted" ON users;
