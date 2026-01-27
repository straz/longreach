import { nanoid } from 'nanoid';
import { supabase, Lead } from './supabaseClient';

/**
 * Submit a lead from the AI Pathologies card game request form.
 * This uses the anon key and is publicly accessible (RLS allows INSERT).
 * Generates a 10-character nanoid for the lead.
 *
 * Confirmation email is sent automatically via Supabase database webhook.
 */
export async function submitLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'lid'>): Promise<{ success: boolean; lid?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const lid = nanoid(10);

  const { error } = await supabase
    .from('leads')
    .insert([{ ...lead, lid }]);

  if (error) {
    console.error('Error submitting lead:', error);
    return { success: false, error: error.message };
  }

  return { success: true, lid };
}
