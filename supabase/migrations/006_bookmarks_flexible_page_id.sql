-- Migration: Make bookmarks.page_id flexible to support any collection table
--
-- Problem: bookmarks.page_id was UUID REFERENCES archive_pages(id), which
-- prevents bookmarking records from collection-specific tables like
-- aa_revolutionary_soldiers, free_black_heads_of_household, etc.
--
-- Fix: Drop the FK constraint and change page_id from UUID to TEXT so any
-- record ID (UUID, integer, or other) can be bookmarked. The collection_slug
-- column already identifies which collection a bookmark belongs to.

-- Step 1: Drop the foreign key constraint
ALTER TABLE bookmarks
  DROP CONSTRAINT IF EXISTS bookmarks_page_id_fkey;

-- Step 2: Change page_id column type from UUID to TEXT
-- (existing UUID values are preserved as their string representation)
ALTER TABLE bookmarks
  ALTER COLUMN page_id TYPE TEXT USING page_id::TEXT;
