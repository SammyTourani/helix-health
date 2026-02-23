'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createRecordAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const record = {
    user_id: user.id,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    date: formData.get('date') as string,
    end_date: formData.get('end_date') as string || null,
    status: formData.get('status') as string || 'active',
    provider_name: formData.get('provider_name') as string || null,
    specialty: formData.get('specialty') as string || null,
    notes: formData.get('notes') as string || null,
    metadata: {},
  };

  // Parse metadata fields based on type
  if (record.type === 'medication') {
    record.metadata = {
      dosage: formData.get('dosage') || null,
      frequency: formData.get('frequency') || null,
    };
  } else if (record.type === 'lab') {
    record.metadata = {
      lab_name: formData.get('lab_name') || null,
      key_values: formData.get('key_values') || null,
      reference_range: formData.get('reference_range') || null,
    };
  } else if (record.type === 'imaging') {
    record.metadata = {
      imaging_type: formData.get('imaging_type') || null,
      body_region: formData.get('body_region') || null,
      findings: formData.get('findings') || null,
    };
  }

  const { error } = await supabase.from('health_records').insert(record);

  if (error) return { error: 'Failed to create record' };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/records');
  revalidatePath('/dashboard/timeline');
  return { success: true };
}

export async function updateRecordAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Record<string, unknown> = {};
  const fields = ['type', 'title', 'description', 'date', 'end_date', 'status', 'provider_name', 'specialty', 'notes'];
  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value || null;
  }

  const type = formData.get('type') as string;
  if (type === 'medication') {
    updates.metadata = {
      dosage: formData.get('dosage') || null,
      frequency: formData.get('frequency') || null,
    };
  } else if (type === 'lab') {
    updates.metadata = {
      lab_name: formData.get('lab_name') || null,
      key_values: formData.get('key_values') || null,
      reference_range: formData.get('reference_range') || null,
    };
  } else if (type === 'imaging') {
    updates.metadata = {
      imaging_type: formData.get('imaging_type') || null,
      body_region: formData.get('body_region') || null,
      findings: formData.get('findings') || null,
    };
  }

  const { error } = await supabase
    .from('health_records')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Failed to update record' };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/records');
  revalidatePath('/dashboard/timeline');
  return { success: true };
}

export async function deleteRecordAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Failed to delete record' };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/records');
  revalidatePath('/dashboard/timeline');
  return { success: true };
}
