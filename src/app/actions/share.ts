'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { computeExpiresAt, parseFilterSpecialties } from '@/lib/share';

export async function createShareLinkAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const expiresAt = computeExpiresAt(formData.get('expiry') as string);

  const shareLink = {
    user_id: user.id,
    token: nanoid(21),
    recipient_name: formData.get('recipient_name') as string || null,
    purpose: formData.get('purpose') as string || null,
    access_level: (formData.get('access_level') as string) || 'summary',
    filter_specialties: parseFilterSpecialties(formData.get('filter_specialties') as string),
    expires_at: expiresAt,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('share_links')
    .insert(shareLink)
    .select()
    .single();

  if (error) return { error: 'Failed to create share link' };

  revalidatePath('/dashboard/share');
  return { success: true, token: data.token };
}

export async function revokeShareLinkAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('share_links')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Failed to revoke link' };

  revalidatePath('/dashboard/share');
  return { success: true };
}
