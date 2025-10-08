-- Row Level Security Policies for archive_pages table
-- This file contains the SQL commands needed to set up RLS policies for the collection management system

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
