'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProviderAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const provider = {
    user_id: user.id,
    name: formData.get('name') as string,
    specialty: formData.get('specialty') as string || null,
    clinic_name: formData.get('clinic_name') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    has_access: false,
    access_level: 'summary_only' as const,
  };

  const { error } = await supabase.from('providers').insert(provider);
  if (error) return { error: 'Failed to add provider' };

  revalidatePath('/dashboard/providers');
  return { success: true };
}

export async function updateProviderAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Record<string, unknown> = {};
  const fields = ['name', 'specialty', 'clinic_name', 'email', 'phone', 'has_access', 'access_level'];
  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) {
      if (field === 'has_access') {
        updates[field] = value === 'true';
      } else {
        updates[field] = value || null;
      }
    }
  }

  const { error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Failed to update provider' };

  revalidatePath('/dashboard/providers');
  return { success: true };
}

export async function deleteProviderAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('providers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Failed to remove provider' };

  revalidatePath('/dashboard/providers');
  return { success: true };
}
