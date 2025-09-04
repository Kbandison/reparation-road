
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types for our database
export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_status: 'free' | 'paid';
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  collection_type: string;
  record_id: string;
  created_at: string;
}
