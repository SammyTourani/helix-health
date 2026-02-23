import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TimelineContent } from '@/components/dashboard/timeline-content';

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: records } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  return <TimelineContent records={records || []} />;
}
