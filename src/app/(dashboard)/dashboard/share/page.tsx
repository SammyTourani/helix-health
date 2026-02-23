import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShareContent } from '@/components/dashboard/share-content';

export default async function SharePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: shareLinks } = await supabase
    .from('share_links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <ShareContent shareLinks={shareLinks || []} />;
}
