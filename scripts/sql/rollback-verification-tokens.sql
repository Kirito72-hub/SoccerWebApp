-- ============================================
-- ROLLBACK VERIFICATION TOKENS FEATURE
-- ============================================
-- Run this script if you need to remove the verification tokens feature

-- WARNING: This will delete all verification tokens and remove email verification fields
-- Make sure you want to do this before running!

-- Drop verification_tokens table
DROP TABLE IF EXISTS verification_tokens CASCADE;

-- Remove email verification columns from users
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;

-- Verification
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'verification_tokens';
-- Should return 0 rows if successfully dropped

SELECT 
    column_name
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('email_verified', 'email_verified_at');
-- Should return 0 rows if successfully dropped
