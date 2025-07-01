import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Subscription {
  id?: number;
  name: string;
  phone: string;
  plan: 'diet' | 'protein' | 'royal';
  meal_types: string[];
  delivery_days: string[];
  allergies?: string;
  total_price: number;
  created_at?: string;
  user_id?: string;
  status?: 'active' | 'paused' | 'cancelled';
  pause_start_date?: string;
  pause_end_date?: string;
  cancelled_at?: string;
  reactivated_at?: string;
}

export interface MealPlan {
  id?: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  features: string[];
  created_at?: string;
}

export interface Testimonial {
  id?: number;
  name: string;
  message: string;
  rating: number;
  location?: string;
  created_at?: string;
  user_id?: string;
  approved?: boolean;
}