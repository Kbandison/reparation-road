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

-- =======================
-- FORUM SYSTEM
-- =======================

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50) DEFAULT 'message-square',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Reactions Table
CREATE TABLE IF NOT EXISTS forum_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'insightful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_updated ON forum_threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_post ON forum_reactions(post_id);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;

-- Forum Categories Policies
CREATE POLICY "Anyone can view categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON forum_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update categories" ON forum_categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can delete categories" ON forum_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Forum Threads Policies
CREATE POLICY "Anyone can view threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors and admins can update threads" ON forum_threads FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Authors and admins can delete threads" ON forum_threads FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Forum Posts Policies
CREATE POLICY "Anyone can view posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors and admins can update posts" ON forum_posts FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Authors and admins can delete posts" ON forum_posts FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Forum Reactions Policies
CREATE POLICY "Anyone can view reactions" ON forum_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reactions" ON forum_reactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own reactions" ON forum_reactions FOR DELETE USING (auth.uid() = user_id);

-- Function to update thread's updated_at when a new post is added
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_thread_on_new_post
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_timestamp();

-- Insert default categories
INSERT INTO forum_categories (name, description, slug, icon, sort_order) VALUES
  ('General Discussion', 'General topics about genealogy and historical research', 'general-discussion', 'message-square', 1),
  ('Research Help', 'Ask for help with your genealogy research', 'research-help', 'help-circle', 2),
  ('Success Stories', 'Share your genealogy discoveries and breakthroughs', 'success-stories', 'star', 3),
  ('Document Analysis', 'Get help interpreting historical documents', 'document-analysis', 'file-text', 4),
  ('Site Feedback', 'Suggestions and feedback about Reparation Road', 'site-feedback', 'message-circle', 5)
ON CONFLICT (slug) DO NOTHING;
