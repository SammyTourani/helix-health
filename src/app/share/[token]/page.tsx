import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SharedRecordView } from '@/components/dashboard/shared-record-view';

async function getShareData(token: string) {
  const cookieStore = await cookies();
  // Use service-level access for public share links
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: link } = await supabase
    .from('share_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (!link) return null;

  // Check expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) return null;

  // Increment view count
  await supabase
    .from('share_links')
    .update({
      view_count: (link.view_count || 0) + 1,
      viewed_at: new Date().toISOString(),
    })
    .eq('id', link.id);

  // Get patient profile
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, blood_type, allergies, date_of_birth')
    .eq('id', link.user_id)
    .single();

  // Get records based on access level
  let recordsQuery = supabase
    .from('health_records')
    .select('*')
    .eq('user_id', link.user_id)
    .order('date', { ascending: false });

  if (link.access_level === 'filtered' && link.filter_specialties?.length) {
    recordsQuery = recordsQuery.in('specialty', link.filter_specialties);
  }

  const { data: records } = await recordsQuery;

  return {
    link,
    profile,
    records: records || [],
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getShareData(token);

  if (!data) notFound();

  return <SharedRecordView data={data} />;
}
