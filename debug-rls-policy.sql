-- DEBUG: Check why RLS policy is failing
-- Run this to diagnose the issue

-- 1. Check your user's actual role in the database
SELECT id, email, username, role, 
       role = 'superuser' as is_superuser_lowercase,
       role = 'Superuser' as is_superuser_capitalized
FROM users 
WHERE email = 'ahmad.test@example.com';

-- 2. Check what auth.uid() returns (this simulates being logged in)
-- Note: This won't work in SQL editor, but shows the concept
SELECT auth.uid() as current_auth_uid;

-- 3. Check the exact RLS policy condition
SELECT policyname, with_check
FROM pg_policies
WHERE tablename = 'leagues' AND cmd = 'INSERT';

-- 4. Test if the role check works
-- Replace YOUR_USER_ID with your actual UUID from step 1
SELECT EXISTS (
  SELECT 1 FROM users 
  WHERE id = 'YOUR_USER_ID'  -- Replace with your UUID
  AND (role = 'pro_manager' OR role = 'superuser')
) as should_allow_insert;

-- 5. Check for case sensitivity issues
SELECT id, email, role,
       LOWER(role) as role_lowercase,
       role::text as role_as_text
FROM users
WHERE email = 'ahmad.test@example.com';

-- ============================================
-- POTENTIAL FIX: Case-insensitive role check
-- ============================================
-- If the role is stored as 'Superuser' instead of 'superuser',
-- we need to update the RLS policy to be case-insensitive

DROP POLICY IF EXISTS "Pro managers and superusers can create leagues" ON leagues;

CREATE POLICY "Pro managers and superusers can create leagues" 
ON leagues FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
  )
);

-- Verify the new policy
SELECT policyname, with_check
FROM pg_policies
WHERE tablename = 'leagues' AND cmd = 'INSERT';
