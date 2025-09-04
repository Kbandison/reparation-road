-- Reparation Road Database Schema
-- Run these commands in your Supabase SQL editor
-- 
-- IMPORTANT: Run this entire script in your Supabase SQL Editor
-- Make sure to enable authentication in your Supabase project settings first

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'paid')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user bookmarks table
CREATE TABLE public.user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  collection_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, collection_type, record_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin policies for user management
CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for user_bookmarks table
CREATE POLICY "Users can view own bookmarks." ON public.user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks." ON public.user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks." ON public.user_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks." ON public.user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation (first user becomes admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT DEFAULT 'user';
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If no users exist, make this user an admin
  IF user_count = 0 THEN
    user_role = 'admin';
  END IF;
  
  INSERT INTO public.profiles (id, email, subscription_status, role)
  VALUES (new.id, new.email, 'free', user_role);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.user_bookmarks TO anon, authenticated;

-- Enable realtime for profiles (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ADMIN USER CREATION:
-- The first user to register will automatically become an admin.
-- Additional admins can be created through the admin dashboard by existing admins.
-- Alternatively, you can manually promote users by running:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'user@example.com';

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.user_bookmarks IS 'User bookmarks for historical records';
COMMENT ON COLUMN public.profiles.subscription_status IS 'User subscription tier: free or paid';
COMMENT ON COLUMN public.profiles.role IS 'User role: user or admin. First user becomes admin automatically.';

-- Additional notes:
-- * First registered user automatically becomes admin
-- * Admins can promote/demote other users via admin dashboard
-- * Admins cannot demote themselves (safety feature)
-- * Admin role is required to access /admin routes and manage users