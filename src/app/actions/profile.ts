'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const allergiesRaw = formData.get('allergies') as string;
  const allergies = allergiesRaw ? allergiesRaw.split(',').map(a => a.trim()).filter(Boolean) : [];

  const updates = {
    full_name: formData.get('full_name') as string || null,
    date_of_birth: formData.get('date_of_birth') as string || null,
    blood_type: formData.get('blood_type') as string || null,
    allergies,
    emergency_contact_name: formData.get('emergency_contact_name') as string || null,
    emergency_contact_phone: formData.get('emergency_contact_phone') as string || null,
  };

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (error) return { error: 'Failed to update profile' };

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const allergiesRaw = formData.get('allergies') as string;
  const allergies = allergiesRaw ? allergiesRaw.split(',').map(a => a.trim()).filter(Boolean) : [];

  const profileUpdates = {
    id: user.id,
    full_name: user.user_metadata?.full_name || null,
    date_of_birth: formData.get('date_of_birth') as string || null,
    blood_type: formData.get('blood_type') as string || null,
    allergies,
    onboarding_completed: true,
  };

  // Use upsert so this works even if the trigger didn't create the row
  const { error } = await supabase
    .from('users')
    .upsert(profileUpdates, { onConflict: 'id' });

  if (error) return { error: `Failed to complete onboarding: ${error.message}` };

  // If user added a first record
  const recordTitle = formData.get('first_record_title') as string;
  if (recordTitle) {
    await supabase.from('health_records').insert({
      user_id: user.id,
      type: formData.get('first_record_type') as string || 'condition',
      title: recordTitle,
      date: formData.get('first_record_date') as string || new Date().toISOString().split('T')[0],
      status: 'active',
    });
  }

  // If user added a first provider
  const providerName = formData.get('first_provider_name') as string;
  if (providerName) {
    await supabase.from('providers').insert({
      user_id: user.id,
      name: providerName,
      specialty: formData.get('first_provider_specialty') as string || null,
      clinic_name: formData.get('first_provider_clinic') as string || null,
    });
  }

  return { success: true };
}
