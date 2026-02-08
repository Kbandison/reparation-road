
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
  // Stripe fields
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_interval?: 'month' | 'year';
  subscription_period_start?: string;
  subscription_period_end?: string;
  subscription_cancel_at_period_end?: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  created_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  collection_type: string;
  record_id: string;
  created_at: string;
}
