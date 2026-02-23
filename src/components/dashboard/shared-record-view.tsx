'use client';

import { motion } from 'framer-motion';
import { Activity, Calendar, FileText, Heart, Lock, Pill, Shield, Syringe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import type { HealthRecord, ShareLink, User } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  condition: <Heart className="h-4 w-4 text-red-400" />,
  medication: <Pill className="h-4 w-4 text-blue-400" />,
  visit: <Calendar className="h-4 w-4 text-green-400" />,
  lab: <Activity className="h-4 w-4 text-yellow-400" />,
  imaging: <FileText className="h-4 w-4 text-purple-400" />,
  procedure: <FileText className="h-4 w-4 text-orange-400" />,
  vaccination: <Syringe className="h-4 w-4 text-teal-400" />,
  allergy: <Heart className="h-4 w-4 text-pink-400" />,
};

interface SharedRecordViewProps {
  data: {
    link: ShareLink;
    profile: Pick<User, 'full_name' | 'blood_type' | 'allergies' | 'date_of_birth'> | null;
    records: HealthRecord[];
  };
}

export function SharedRecordView({ data }: SharedRecordViewProps) {
  const { link, profile, records } = data;
  const conditions = records.filter(r => r.type === 'condition' && r.status === 'active');
  const medications = records.filter(r => r.type === 'medication' && r.status === 'active');

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000)
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f8fafc]">
      {/* Header */}
      <div className="border-b border-[#1e1e2e] bg-[#12121a]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#6366f1]/20">
                <Shield className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shared via Helix Health</p>
                <h1 className="text-xl font-bold">
                  {profile?.full_name ? `${profile.full_name}'s Health Records` : 'Health Records'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="capitalize">{link.access_level} access</span>
            </div>
          </div>
          {link.purpose && (
            <p className="text-sm text-muted-foreground mt-2">Purpose: {link.purpose}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Patient Summary */}
        {link.access_level !== 'summary' && profile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader>
                <CardTitle>Patient Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {age && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Age</p>
                      <p className="font-medium mt-1">{age} years</p>
                    </div>
                  )}
                  {profile.blood_type && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Blood Type</p>
                      <p className="font-medium mt-1">{profile.blood_type}</p>
                    </div>
                  )}
                  {profile.allergies && profile.allergies.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Allergies</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.allergies.map((a) => (
                          <Badge key={a} variant="secondary" className="text-xs bg-red-500/10 text-red-400">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-400" /> Active Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None recorded</p>
                ) : (
                  <ul className="space-y-2">
                    {conditions.map((c) => (
                      <li key={c.id} className="text-sm flex items-center justify-between">
                        <span>{c.title}</span>
                        {c.specialty && <Badge variant="secondary" className="text-xs bg-[#1e1e2e]">{c.specialty}</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-400" /> Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None recorded</p>
                ) : (
                  <ul className="space-y-2">
                    {medications.map((m) => (
                      <li key={m.id} className="text-sm flex items-center justify-between">
                        <span>{m.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {(m.metadata as Record<string, string>)?.dosage || ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Full Records */}
        {link.access_level !== 'summary' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader>
                <CardTitle>Health Records ({records.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {records.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
                      {typeIcons[r.type] || <FileText className="h-4 w-4" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{r.title}</p>
                          <Badge variant="secondary" className="text-xs bg-[#1e1e2e] capitalize">{r.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(r.date), 'MMM d, yyyy')}
                          {r.provider_name ? ` · ${r.provider_name}` : ''}
                          {r.specialty ? ` · ${r.specialty}` : ''}
                        </p>
                        {r.description && <p className="text-sm text-muted-foreground mt-2">{r.description}</p>}
                        {r.notes && <p className="text-sm mt-1 italic">{r.notes}</p>}
                      </div>
                      <Badge
                        className={`text-xs shrink-0 ${
                          r.status === 'active' ? 'bg-green-500/10 text-green-400' :
                          r.status === 'resolved' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p>Shared securely via <span className="text-[#6366f1] font-medium">⚕ Helix Health</span></p>
          {link.expires_at && (
            <p className="mt-1">This link expires {format(new Date(link.expires_at), 'MMMM d, yyyy')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
