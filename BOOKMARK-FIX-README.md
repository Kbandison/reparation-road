# Bookmark Functionality Fix

## Problem

Bookmarks are not working - users get an immediate "Failed to update bookmark" alert when trying to bookmark pages.

## Root Cause

The **Row Level Security (RLS) policies** for the `bookmarks` table are either:
1. Not applied to the database
2. Misconfigured
3. Being bypassed (currently anyone can read bookmarks without authentication)

## Diagnosis Results

✅ **Table exists**: `bookmarks` table is present
✅ **Schema is correct**: UUID fields, proper foreign keys
❌ **RLS not working**: Unauthenticated users can fetch bookmarks
❌ **INSERT fails**: Likely due to missing or incorrect RLS policies

## How to Fix

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/nviahrhrupqvwyglaxlj/sql/new

### Step 2: Run the Fix Script

Copy and paste the contents of `scripts/fix-bookmark-rls.sql` into the SQL editor and execute it.

Or run these commands manually:

```sql
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Ensure RLS is enabled
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks" ON bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
FOR DELETE
USING (auth.uid() = user_id);
```

### Step 3: Verify the Policies

Run this query to check if policies are properly applied:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'bookmarks';
```

You should see **3 policies**:
1. "Users can view their own bookmarks" - SELECT
2. "Users can create their own bookmarks" - INSERT
3. "Users can delete their own bookmarks" - DELETE

### Step 4: Test

1. Open the app in development mode: `npm run dev`
2. Sign in as a user
3. Try to bookmark a page in the Inspection Roll collection
4. Check the browser console for detailed error messages (added enhanced logging)
5. The bookmark should work without any alert!

## What Changed in Code

I've added **enhanced error logging** to `contexts/BookmarkContext.tsx`:

- Logs the user_id and page_id being sent
- Logs full error details (code, message, details, hint)
- Shows more detailed error message in the alert

This will help diagnose any remaining issues after fixing RLS.

## Expected Behavior After Fix

✅ Users can only see their own bookmarks
✅ Users can add bookmarks to pages
✅ Users can remove their own bookmarks
✅ Unauthenticated users cannot access bookmarks
✅ No more "Failed to update bookmark" alerts

## If Still Not Working

Check the browser console after attempting to bookmark. The enhanced logging will show:
- The exact user_id and page_id being used
- The specific error code and message
- PostgreSQL hints if available

This will help identify if it's:
- An RLS policy issue
- A foreign key constraint issue
- An authentication problem
- Something else

## Files Modified

- `contexts/BookmarkContext.tsx` - Enhanced error logging
- `scripts/fix-bookmark-rls.sql` - SQL script to fix RLS
- `scripts/check-bookmarks.js` - Diagnostic script
- `BOOKMARK-FIX-README.md` - This file
