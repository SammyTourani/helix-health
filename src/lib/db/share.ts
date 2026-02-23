import { createClient } from '@/lib/supabase/server';
import type { ShareLink } from '@/types';

export async function getShareLinks(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('share_links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ShareLink[];
}

export async function createShareLink(link: Omit<ShareLink, 'id' | 'created_at' | 'viewed_at' | 'view_count'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('share_links')
    .insert(link)
    .select()
    .single();
  if (error) throw error;
  return data as ShareLink;
}

export async function getShareLinkByToken(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('share_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data as ShareLink;
}

export async function incrementShareView(token: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_share_view', { share_token: token });
  if (error) {
    // Fallback: direct update
    await supabase
      .from('share_links')
      .update({
        view_count: await supabase
          .from('share_links')
          .select('view_count')
          .eq('token', token)
          .single()
          .then(r => (r.data?.view_count || 0) + 1),
        viewed_at: new Date().toISOString(),
      })
      .eq('token', token);
  }
}

export async function revokeShareLink(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('share_links')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}
