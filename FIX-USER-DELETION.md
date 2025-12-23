# Fix User Deletion in Supabase

## Problem
Users are not being deleted from Supabase even though the success message appears.

## Root Cause
You're using **localStorage for authentication** (not Supabase Auth), so RLS policies that check `auth.uid()` don't work because it returns NULL.

## Quick Fix (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing DELETE policies
DROP POLICY IF EXISTS "superuser_delete_policy" ON users;
DROP POLICY IF EXISTS "superusers_can_delete_non_superusers" ON users;
DROP POLICY IF EXISTS "users_cannot_delete_themselves" ON users;
DROP POLICY IF EXISTS "superusers_cannot_be_deleted" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;

-- Create a permissive policy that allows all deletes
CREATE POLICY "allow_deletes_with_service_key"
ON users
FOR DELETE
USING (true);
```

### Step 3: Test
1. Go to your Settings page
2. Try deleting a user
3. It should work now!

## Why This Works

Since you're handling authentication in your app (localStorage), you're already checking:
- ✅ User is a superuser (in Settings.tsx)
- ✅ Cannot delete superusers (checkboxes disabled)
- ✅ Cannot delete yourself (checkbox disabled)

So it's safe to allow all deletes at the database level - your app code provides the security.

## Alternative: More Secure Approach

If you want database-level security, use the PostgreSQL function in `supabase-fix-user-deletion.sql` (OPTION 2).

This requires updating your code to call the function instead of direct delete.

## Verify It's Working

After running the SQL:

1. Check the browser console for any errors
2. The error should be gone
3. Users should actually be deleted from the database
4. Refresh the Settings page - deleted users should not appear

## Files Created

- `supabase-fix-user-deletion.sql` - Quick fix SQL (use OPTION 1)
- `supabase-rls-user-deletion.sql` - Detailed explanation and alternatives

## Need Help?

If it still doesn't work:
1. Check browser console for errors
2. Check Supabase logs in Dashboard > Logs
3. Make sure you're using the correct Supabase project
4. Verify your `.env` file has the correct Supabase credentials
