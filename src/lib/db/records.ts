import { createClient } from '@/lib/supabase/server';
import type { HealthRecord } from '@/types';

export async function getRecords(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as HealthRecord[];
}

export async function getRecordById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as HealthRecord;
}

export async function createRecord(record: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data as HealthRecord;
}

export async function updateRecord(id: string, updates: Partial<HealthRecord>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as HealthRecord;
}

export async function deleteRecord(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getRecordsByType(userId: string, type: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as HealthRecord[];
}

export async function getActiveConditions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'condition')
    .eq('status', 'active')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as HealthRecord[];
}

export async function getCurrentMedications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'medication')
    .eq('status', 'active')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as HealthRecord[];
}
