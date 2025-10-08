-- Row Level Security Policies for archive_pages table
-- This file contains the SQL commands needed to set up RLS policies for the collection management system

-- Add updated_at column if it doesn't exist
ALTER TABLE archive_pages
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS on archive_pages table (if not already enabled)
ALTER TABLE archive_pages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone to read archive pages (for public viewing)
CREATE POLICY "Enable read access for all users" ON archive_pages
FOR SELECT
USING (true);

-- Policy 2: Allow admins to insert new archive pages
CREATE POLICY "Enable insert for admins" ON archive_pages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Allow admins to update existing archive pages
CREATE POLICY "Enable update for admins" ON archive_pages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 4: Allow admins to delete archive pages
CREATE POLICY "Enable delete for admins" ON archive_pages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- If the above policies already exist, you may need to drop them first:
-- DROP POLICY IF EXISTS "Enable read access for all users" ON archive_pages;
-- DROP POLICY IF EXISTS "Enable insert for admins" ON archive_pages;
-- DROP POLICY IF EXISTS "Enable update for admins" ON archive_pages;
-- DROP POLICY IF EXISTS "Enable delete for admins" ON archive_pages;

-- Then run the CREATE POLICY commands again

-- =======================
-- BOOKMARKS TABLE
-- =======================

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES archive_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_page_id ON bookmarks(page_id);

-- Enable RLS
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

-- If the bookmark policies already exist, drop them first:
-- DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
-- DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
-- DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
