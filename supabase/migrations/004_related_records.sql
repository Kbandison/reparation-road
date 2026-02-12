-- Migration: Create related_records table for admin-defined record relationships
-- Run this in your Supabase SQL Editor

-- Create the related_records table
CREATE TABLE IF NOT EXISTS public.related_records (
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
CREATE TRIGGER trigger_related_records_updated_at
  BEFORE UPDATE ON public.related_records
  FOR EACH ROW
  EXECUTE FUNCTION update_related_records_updated_at();

-- Comment on table
COMMENT ON TABLE public.related_records IS 'Stores admin-defined relationships between records across collections';
