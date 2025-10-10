-- Fix bookmark RLS policies
-- Run this in Supabase SQL Editor

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

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'bookmarks';
