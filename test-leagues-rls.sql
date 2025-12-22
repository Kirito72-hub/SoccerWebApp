-- ============================================
-- TEST RLS POLICY FOR LEAGUES TABLE
-- Run this in Supabase SQL Editor to verify the fix is working
-- ============================================

-- Step 1: Check current policies on leagues table
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN 'INSERT/UPDATE check: ' || with_check::text
    WHEN qual IS NOT NULL THEN 'SELECT/DELETE check: ' || qual::text
    ELSE 'No condition'
  END as policy_condition
FROM pg_policies
WHERE tablename = 'leagues'
ORDER BY cmd, policyname;

-- Step 2: Get your superuser account ID
-- Replace 'ahmad.test@example.com' with your email if different
SELECT id, email, username, role 
FROM users 
WHERE email = 'ahmad.test@example.com';

-- Step 3: Test INSERT as Superuser (should SUCCEED)
-- Replace the UUID below with your actual user ID from Step 2
DO $$
DECLARE
  test_user_id UUID;
  test_league_id UUID;
BEGIN
  -- Get the superuser ID
  SELECT id INTO test_user_id FROM users WHERE email = 'ahmad.test@example.com';
  
  -- Set the auth context to simulate being logged in as this user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);
  
  -- Try to insert a test league
  INSERT INTO leagues (name, admin_id, format, status, participant_ids)
  VALUES (
    'RLS Test League',
    test_user_id,
    'round_robin_1leg',
    'running',
    ARRAY[test_user_id]
  )
  RETURNING id INTO test_league_id;
  
  RAISE NOTICE 'SUCCESS! League created with ID: %', test_league_id;
  
  -- Clean up the test league
  DELETE FROM leagues WHERE id = test_league_id;
  RAISE NOTICE 'Test league cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FAILED! Error: %', SQLERRM;
END $$;

-- Step 4: Verify no duplicate INSERT policies exist
SELECT COUNT(*) as insert_policy_count
FROM pg_policies
WHERE tablename = 'leagues' AND cmd = 'INSERT';
-- Should return 1 (only "Pro managers and superusers can create leagues")

-- Step 5: Check if old policy still exists (should return 0 rows)
SELECT policyname
FROM pg_policies
WHERE tablename = 'leagues' 
  AND policyname = 'Authenticated users can create leagues';
-- Should return 0 rows if cleanup was successful

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Step 1: Should show all policies (SELECT, INSERT, UPDATE, DELETE)
-- Step 2: Should show your user with role = 'superuser'
-- Step 3: Should show "SUCCESS! League created with ID: ..."
-- Step 4: Should return insert_policy_count = 1
-- Step 5: Should return 0 rows (old policy removed)
-- ============================================
