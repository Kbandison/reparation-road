-- Migration: Create related_records table for admin-defined record relationships
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.related_records;

-- Create the related_records table
CREATE TABLE public.related_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source record (the record you're viewing)
  source_record_id UUID NOT NULL,
  source_table TEXT NOT NULL,
  source_name TEXT,
  source_collection TEXT NOT NULL,
  source_collection_slug TEXT NOT NULL,

  -- Target record (the related record)
  target_record_id UUID NOT NULL,
  target_table TEXT NOT NULL,
  target_name TEXT,
  target_collection TEXT NOT NULL,
  target_collection_slug TEXT NOT NULL,

  -- Relationship metadata
  relationship_type TEXT, -- e.g., 'family', 'same_enslaver', 'same_location', 'same_voyage', 'custom'
  relationship_note TEXT, -- Custom note explaining the relationship

  -- Display options
  display_priority INTEGER DEFAULT 5, -- 1-10, higher priority shows first
  is_bidirectional BOOLEAN DEFAULT true, -- Show on both records or just source
  is_featured BOOLEAN DEFAULT false, -- Highlight this relationship
  custom_badge TEXT, -- Custom badge text (e.g., "Mother", "Sold Together")

  -- Search matching hints (helps auto-matching find similar records)
  match_by_name BOOLEAN DEFAULT true,
  match_by_location BOOLEAN DEFAULT true,
  match_by_date BOOLEAN DEFAULT false,
  match_by_enslaver BOOLEAN DEFAULT false,

  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate relationships
  UNIQUE(source_record_id, target_record_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_related_records_source ON public.related_records(source_record_id);
CREATE INDEX idx_related_records_target ON public.related_records(target_record_id);
CREATE INDEX idx_related_records_source_table ON public.related_records(source_table);
CREATE INDEX idx_related_records_target_table ON public.related_records(target_table);
CREATE INDEX idx_related_records_priority ON public.related_records(display_priority DESC);
CREATE INDEX idx_related_records_featured ON public.related_records(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE public.related_records ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read related records
CREATE POLICY "Anyone can view related records"
  ON public.related_records
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage related records"
  ON public.related_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_related_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_related_records_updated_at ON public.related_records;
CREATE TRIGGER trigger_related_records_updated_at
  BEFORE UPDATE ON public.related_records
  FOR EACH ROW
  EXECUTE FUNCTION update_related_records_updated_at();

-- Comment on table
COMMENT ON TABLE public.related_records IS 'Stores admin-defined relationships between records across collections';
COMMENT ON COLUMN public.related_records.display_priority IS '1-10 priority, higher numbers show first';
COMMENT ON COLUMN public.related_records.is_bidirectional IS 'If true, shows on both source and target records';
COMMENT ON COLUMN public.related_records.is_featured IS 'Featured relationships are highlighted in the UI';
COMMENT ON COLUMN public.related_records.custom_badge IS 'Custom badge text like "Mother" or "Sold Together"';
