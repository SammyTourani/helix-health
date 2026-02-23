import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: profile },
    { data: records },
    { data: providers },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('health_records').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('providers').select('*').eq('user_id', user.id),
  ]);

  const activeConditions = records?.filter(r => r.type === 'condition' && r.status === 'active') || [];
  const currentMedications = records?.filter(r => r.type === 'medication' && r.status === 'active') || [];
  const recentRecords = records?.slice(0, 5) || [];

  return (
    <DashboardContent
      profile={profile}
      stats={{
        conditions: activeConditions.length,
        medications: currentMedications.length,
        providers: providers?.length || 0,
        records: records?.length || 0,
      }}
      activeConditions={activeConditions}
      currentMedications={currentMedications}
      recentRecords={recentRecords}
    />
  );
}
