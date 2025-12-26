-- ============================================
-- ROLLBACK RLS POLICIES FOR VERIFICATION_TOKENS
-- ============================================
-- Run this if you need to remove the RLS policies

-- Drop all policies
DROP POLICY IF EXISTS "Allow insert verification tokens" ON verification_tokens;
DROP POLICY IF EXISTS "Allow select verification tokens" ON verification_tokens;
DROP POLICY IF EXISTS "Allow update verification tokens" ON verification_tokens;
DROP POLICY IF EXISTS "Allow delete expired tokens" ON verification_tokens;

-- Disable RLS (optional - only if you want to completely disable RLS)
-- ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;

-- Verification
SELECT 
    policyname,
    tablename
FROM pg_policies 
WHERE tablename = 'verification_tokens';
-- Should return 0 rows if all policies are dropped
