-- ============================================
-- CREATE VERIFICATION TOKENS TABLE
-- ============================================
-- This table stores email verification and password reset tokens
-- Tokens expire after a set time and can only be used once

CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP NULL
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_type ON verification_tokens(type);

-- Add comment
COMMENT ON TABLE verification_tokens IS 'Stores email verification and password reset tokens';
COMMENT ON COLUMN verification_tokens.token IS 'Unique token sent via email';
COMMENT ON COLUMN verification_tokens.type IS 'Type of token: email_verification or password_reset';
COMMENT ON COLUMN verification_tokens.expires_at IS 'Token expiration time (24h for email, 1h for password)';
COMMENT ON COLUMN verification_tokens.used_at IS 'When the token was used (NULL if unused)';

-- ============================================
-- ADD EMAIL VERIFICATION FIELDS TO USERS
-- ============================================

-- Add email_verified column (defaults to false for new users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add email_verified_at column (timestamp when email was verified)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL;

-- Add comments
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when email was verified';

-- ============================================
-- CLEANUP OLD TOKENS (Optional - for maintenance)
-- ============================================
-- You can run this periodically to clean up expired tokens
-- DELETE FROM verification_tokens WHERE expires_at < NOW() AND used_at IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if tables were created successfully
SELECT 
    'verification_tokens' as table_name,
    COUNT(*) as row_count
FROM verification_tokens
UNION ALL
SELECT 
    'users (with email fields)' as table_name,
    COUNT(*) as row_count
FROM users;

-- Check columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'verification_tokens'
ORDER BY ordinal_position;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('email_verified', 'email_verified_at')
ORDER BY ordinal_position;
