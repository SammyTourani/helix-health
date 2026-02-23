'use server';

import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';
import { revalidatePath } from 'next/cache';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateAIBrief(specialty: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch all health records
  const { data: records } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (!records || records.length === 0) {
    return { error: 'No health records found. Add some records first to generate a brief.' };
  }

  const conditions = records.filter((r: { type: string; status: string }) => r.type === 'condition' && r.status === 'active');
  const medications = records.filter((r: { type: string; status: string }) => r.type === 'medication' && r.status === 'active');
  const specialtyRecords = records.filter((r: { specialty: string | null }) => r.specialty === specialty);
  const labs = records.filter((r: { type: string }) => r.type === 'lab').slice(0, 5);
  const recentVisits = records.filter((r: { type: string }) => r.type === 'visit').slice(0, 5);

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000)
    : 'Unknown';

  const prompt = `You are a medical AI assistant generating a pre-appointment health brief for a ${specialty} appointment.

Patient Overview:
- Age: ${age}
- Blood Type: ${profile?.blood_type || 'Not recorded'}
- Known Allergies: ${profile?.allergies?.length ? profile.allergies.join(', ') : 'None recorded'}

Active Conditions:
${conditions.map((c: { title: string; date: string; notes: string | null }) => `- ${c.title} (since ${c.date})${c.notes ? ': ' + c.notes : ''}`).join('\n') || 'None'}

Current Medications:
${medications.map((m: { title: string; metadata: Record<string, unknown> }) => `- ${m.title}${m.metadata?.dosage ? ' — ' + m.metadata.dosage : ''}${m.metadata?.frequency ? ', ' + m.metadata.frequency : ''}`).join('\n') || 'None'}

Records relevant to ${specialty}:
${specialtyRecords.map((r: { type: string; title: string; date: string; notes: string | null }) => `- [${r.type}] ${r.title} (${r.date})${r.notes ? ': ' + r.notes : ''}`).join('\n') || 'None'}

Recent Lab Results:
${labs.map((l: { title: string; date: string; metadata: Record<string, unknown> }) => `- ${l.title} (${l.date})${l.metadata?.key_values ? ': ' + l.metadata.key_values : ''}`).join('\n') || 'None'}

Recent Visits:
${recentVisits.map((v: { title: string; date: string; provider_name: string | null }) => `- ${v.title} (${v.date}) with ${v.provider_name || 'Unknown provider'}`).join('\n') || 'None'}

Generate a structured, concise health brief for the ${specialty} specialist. Include:
1. **Patient Summary** — Age, blood type, allergies, relevant background
2. **Relevant Conditions** — Conditions pertinent to this specialty
3. **Current Medications** — With potential interactions or concerns for this specialty
4. **Recent Activity** — Latest visits, labs, or imaging relevant to this specialty
5. **Key Notes & Cautions** — Drug interactions, allergy risks, important flags

Keep it professional, clear, and actionable. Use markdown formatting.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const summary = completion.choices[0]?.message?.content || 'Failed to generate brief.';

    // Save to database
    const { error: saveError } = await supabase.from('ai_summaries').insert({
      user_id: user.id,
      specialty,
      summary,
      key_conditions: conditions.map((c: { title: string }) => c.title),
      current_medications: medications.map((m: { title: string }) => m.title),
      recent_visits: recentVisits.map((v: { title: string; date: string }) => `${v.title} (${v.date})`),
      cautions: profile?.allergies || [],
    });

    if (saveError) console.error('Failed to save AI summary:', saveError);

    revalidatePath('/dashboard/ai-brief');
    return { success: true, summary };
  } catch (err) {
    console.error('AI generation error:', err);
    return { error: 'Failed to generate AI brief. Please try again.' };
  }
}
