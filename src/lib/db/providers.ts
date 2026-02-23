import { createClient } from '@/lib/supabase/server';
import type { Provider } from '@/types';

export async function getProviders(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Provider[];
}

export async function createProvider(provider: Omit<Provider, 'id' | 'created_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('providers')
    .insert(provider)
    .select()
    .single();
  if (error) throw error;
  return data as Provider;
}

export async function updateProvider(id: string, updates: Partial<Provider>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Provider;
}

export async function deleteProvider(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('providers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
