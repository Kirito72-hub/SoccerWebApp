-- =====================================================
-- USER STATS TABLE CREATION SCRIPT
-- =====================================================
-- This script creates the user_stats table and related triggers
-- for automatic stats creation when a new user signs up.
--
-- IMPORTANT: Run this script in your Supabase SQL Editor
--
-- What this script does:
-- 1. Cleans up any old/conflicting triggers and functions
-- 2. Creates the user_stats table with proper schema
-- 3. Sets up Row Level Security (RLS) policies
-- 4. Creates a trigger to auto-create stats on user signup
-- 5. Creates a trigger to auto-update timestamps
-- =====================================================

-- =====================================================
-- STEP 0: CLEANUP OLD TRIGGERS AND FUNCTIONS
-- =====================================================
-- Drop any old triggers that might conflict
DROP TRIGGER IF EXISTS on_user_created ON public.users;
DROP FUNCTION IF EXISTS create_user_stats();

-- This prevents conflicts with old deployments
-- =====================================================

-- ============================================
-- STEP 1: CREATE USER_STATS TABLE
-- ============================================
-- This table stores statistics for each user

CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    leagues_created INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    total_assists INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one stats record per user
    UNIQUE(user_id)
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Policy 1: Users can view their own stats
CREATE POLICY "Users can view own stats"
ON public.user_stats
FOR SELECT
TO authenticated, anon
USING (user_id = auth.uid() OR true); -- Allow viewing all stats for leaderboards

-- Policy 2: Users can update their own stats
CREATE POLICY "Users can update own stats"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 3: System can insert stats (via trigger)
CREATE POLICY "System can insert stats"
ON public.user_stats
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Policy 4: Users can delete their own stats
CREATE POLICY "Users can delete own stats"
ON public.user_stats
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION update_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = ''; -- Security: immutable search_path

CREATE TRIGGER update_user_stats_timestamp
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_updated_at();

-- ============================================
-- CREATE TRIGGER TO AUTO-CREATE USER STATS
-- ============================================

CREATE OR REPLACE FUNCTION create_user_stats_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = ''; -- Security: immutable search_path

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_user_stats_trigger ON public.users;

-- Create trigger
CREATE TRIGGER create_user_stats_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_stats_on_signup();

-- ============================================
-- CREATE STATS FOR EXISTING USERS
-- ============================================

-- Create stats for any existing users that don't have them
INSERT INTO public.user_stats (user_id)
SELECT id FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'user_stats';

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_stats';

-- Check policies
SELECT 
    policyname,
    cmd as command
FROM pg_policies 
WHERE tablename = 'user_stats';

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'user_stats')
AND trigger_schema = 'public';

-- Count user_stats records
SELECT COUNT(*) as total_user_stats FROM public.user_stats;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- ✅ user_stats table created
-- ✅ RLS enabled
-- ✅ 4 policies created
-- ✅ 2 triggers created (update timestamp, auto-create on signup)
-- ✅ Stats created for all existing users
