import { createClient } from '@/lib/supabase/server';
import type { AISummary } from '@/types';

export async function getAISummaries(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });
  if (error) throw error;
  return data as AISummary[];
}

export async function createAISummary(summary: Omit<AISummary, 'id' | 'generated_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ai_summaries')
    .insert(summary)
    .select()
    .single();
  if (error) throw error;
  return data as AISummary;
}

export async function deleteAISummary(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('ai_summaries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
