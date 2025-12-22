-- Upgrade User to Superuser
-- Run this in your Supabase SQL Editor to make your test account a Superuser

-- Update the user with email 'ahmad.test@example.com' to Superuser role
UPDATE users 
SET role = 'superuser' 
WHERE email = 'ahmad.test@example.com';

-- Verify the update
SELECT id, email, username, role 
FROM users 
WHERE email = 'ahmad.test@example.com';

-- This will return the user with their new 'superuser' role
