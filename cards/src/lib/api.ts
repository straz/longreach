import { supabase, Lead } from './supabaseClient';

/**
 * Submit a lead from the AI Pathologies card game request form.
 * This uses the anon key and is publicly accessible (RLS allows INSERT).
 */
export async function submitLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<{ success: boolean; data?: Lead; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('leads')
    .insert([lead]);

  if (error) {
    console.error('Error submitting lead:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
