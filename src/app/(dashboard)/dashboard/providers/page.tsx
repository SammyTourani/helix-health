import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProvidersContent } from '@/components/dashboard/providers-content';

export default async function ProvidersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <ProvidersContent providers={providers || []} />;
}
