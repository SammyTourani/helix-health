import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AIBriefContent } from '@/components/dashboard/ai-brief-content';

export default async function AIBriefPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: summaries } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false });

  const { data: recordCount } = await supabase
    .from('health_records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return <AIBriefContent summaries={summaries || []} hasRecords={(recordCount as unknown as number) > 0} />;
}
