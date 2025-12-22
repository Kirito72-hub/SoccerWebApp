-- FIX for RLS Policy - Allow User Registration
-- Run this in your Supabase SQL Editor to fix the signup issue

-- Add INSERT policy for users table to allow public signup
CREATE POLICY "Anyone can create an account" ON users 
FOR INSERT 
WITH CHECK (true);

-- This allows anyone to insert a new user (signup)
-- The app will set role='normal_user' by default
-- Superusers can later upgrade roles through the Settings page
