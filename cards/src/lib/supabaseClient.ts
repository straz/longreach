import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - form submission will be disabled');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Lead {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  email: string;
  title?: string;
  organization?: string;
  comments?: string;
  selected_cards?: { id: string; name: string }[];
  ai_characteristics?: string[];
  ai_characteristics_other?: string;
  ai_providers?: string[];
  ai_providers_other?: string;
  concern_level?: number;
  who_concerned?: string[];
  who_concerned_other?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
}
