-- ============================================
-- RLS POLICIES FOR VERIFICATION_TOKENS TABLE
-- ============================================
-- This fixes the "Invalid or expired reset link" error
-- by allowing the app to read/write verification tokens

-- Enable RLS on verification_tokens table
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow INSERT (creating new tokens)
-- Anyone can create verification tokens
CREATE POLICY "Allow insert verification tokens"
ON verification_tokens
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Allow SELECT (reading tokens for verification)
-- Anyone can read verification tokens (needed to verify email/reset password)
CREATE POLICY "Allow select verification tokens"
ON verification_tokens
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 3: Allow UPDATE (marking tokens as used)
-- Anyone can update verification tokens (to mark as used)
CREATE POLICY "Allow update verification tokens"
ON verification_tokens
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Allow DELETE (cleanup old tokens - optional)
-- Only allow deleting expired tokens
CREATE POLICY "Allow delete expired tokens"
ON verification_tokens
FOR DELETE
TO anon, authenticated
USING (expires_at < NOW());

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if RLS is enabled and policies are created
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'verification_tokens';

-- List all policies
SELECT 
    policyname,
    tablename,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'verification_tokens';
