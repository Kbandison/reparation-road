# Troubleshooting Guide

## Error: "Error fetching threads: {}" or "Error fetching bookmarks: {}"

This error indicates a Row Level Security (RLS) policy issue in Supabase.

### Quick Fix:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: reparation-road
3. **Go to SQL Editor**
4. **Run the updated policies from `supabase-migrations.sql`**

### Manual Fix (If SQL migration doesn't work):

#### For Forum Tables:

1. Go to **Authentication** > **Policies** in Supabase
2. Find each forum table (`forum_threads`, `forum_posts`, `forum_reactions`)
3. **Delete ALL existing policies** (if any exist)
4. Run the SQL from `supabase-migrations.sql` to recreate them

#### For Bookmarks Table:

1. Go to **Authentication** > **Policies**
2. Find `bookmarks` table
3. Ensure these policies exist:
   - SELECT: `auth.uid() = user_id`
   - INSERT: `auth.uid() = user_id`
   - DELETE: `auth.uid() = user_id`

### Check Your Browser Console

The updated code now logs detailed error information. Open your browser's Developer Console (F12) and look for:

```
Error fetching threads: ...
Error message: [the actual error]
Full error: { ... detailed error object ... }
```

This will tell you exactly what's wrong:
- If it says "permission denied" → RLS policies issue
- If it says "relation does not exist" → Table not created yet
- If it says "column does not exist" → Schema mismatch

### Common Issues:

**1. Tables don't exist yet**
- Run the full SQL migration from `supabase-migrations.sql`

**2. RLS is blocking reads**
- Make sure SELECT policies use `USING (true)` for public tables
- For user-specific tables, use `USING (auth.uid() = user_id)`

**3. Foreign key constraints failing**
- Ensure `profiles` table exists with proper user IDs
- Check that `auth.users` are properly synced to `profiles`

**4. UNIQUE constraint violations**
- Usually happens when re-running migrations
- Use `ON CONFLICT DO NOTHING` for insert statements

### Test Queries

Run these in Supabase SQL Editor to test:

```sql
-- Test 1: Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'forum%';

-- Test 2: Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'forum%';

-- Test 3: List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE 'forum%';

-- Test 4: Try to select from forum_threads (should work)
SELECT * FROM forum_threads LIMIT 5;
```

### Still Not Working?

1. Check if you ran the SQL migration
2. Check browser console for detailed errors
3. Verify your user is authenticated
4. Check Supabase logs in the dashboard
