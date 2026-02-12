-- Migration: Create settings table for related records auto-matching configuration
-- Run this in your Supabase SQL Editor

-- Create a simple key-value settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage settings"
  ON public.app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default related records settings
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'related_records_config',
  '{
    "auto_match_enabled": true,
    "match_by_name": true,
    "match_by_location": true,
    "match_by_enslaver": false,
    "match_by_date": false,
    "max_auto_results": 5,
    "min_name_length": 3
  }'::jsonb,
  'Configuration for automatic related records matching'
)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.app_settings IS 'Application-wide settings stored as key-value pairs';
