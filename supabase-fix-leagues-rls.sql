-- Fix RLS Policy for Leagues Table
-- This allows Pro Managers and Superusers to create leagues

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Pro managers and superusers can create leagues" ON leagues;

-- Create INSERT policy for leagues
CREATE POLICY "Pro managers and superusers can create leagues" 
ON leagues FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'pro_manager' OR role = 'superuser')
  )
);

-- Verify all league policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'leagues';
