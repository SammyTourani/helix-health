'use client';

import { motion } from 'framer-motion';
import { Activity, Calendar, FileText, Heart, Pill, Plus, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { HealthRecord, User } from '@/types';

const recordTypeIcons: Record<string, React.ReactNode> = {
  condition: <Heart className="h-4 w-4 text-red-400" />,
  medication: <Pill className="h-4 w-4 text-blue-400" />,
  visit: <Calendar className="h-4 w-4 text-green-400" />,
  lab: <Activity className="h-4 w-4 text-yellow-400" />,
  imaging: <FileText className="h-4 w-4 text-purple-400" />,
  procedure: <FileText className="h-4 w-4 text-orange-400" />,
  vaccination: <FileText className="h-4 w-4 text-teal-400" />,
  allergy: <FileText className="h-4 w-4 text-pink-400" />,
};

interface DashboardContentProps {
  profile: User | null;
  stats: { conditions: number; medications: number; providers: number; records: number };
  activeConditions: HealthRecord[];
  currentMedications: HealthRecord[];
  recentRecords: HealthRecord[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardContent({
  profile,
  stats,
  activeConditions,
  currentMedications,
  recentRecords,
}: DashboardContentProps) {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">{today}</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {[
          { label: 'Active Conditions', value: stats.conditions, icon: Heart, color: 'text-red-400' },
          { label: 'Medications', value: stats.medications, icon: Pill, color: 'text-blue-400' },
          { label: 'Providers', value: stats.providers, icon: Users, color: 'text-green-400' },
          { label: 'Total Records', value: stats.records, icon: FileText, color: 'text-[#6366f1]' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeIn}>
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Health at a Glance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Conditions */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-[#12121a] border-[#1e1e2e]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Active Conditions</CardTitle>
              <Heart className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              {activeConditions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active conditions recorded.</p>
              ) : (
                <div className="space-y-3">
                  {activeConditions.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground">Since {format(new Date(c.date), 'MMM yyyy')}</p>
                      </div>
                      {c.specialty && (
                        <Badge variant="secondary" className="text-xs bg-[#1e1e2e] text-[#22d3ee]">
                          {c.specialty}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Medications */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-[#12121a] border-[#1e1e2e]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Current Medications</CardTitle>
              <Pill className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              {currentMedications.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active medications recorded.</p>
              ) : (
                <div className="space-y-3">
                  {currentMedications.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(m.metadata as Record<string, string>)?.dosage || 'No dosage info'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs border-[#1e1e2e]">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Records */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.5 }}>
        <Card className="bg-[#12121a] border-[#1e1e2e]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Records</CardTitle>
            <Link href="/dashboard/records">
              <Button variant="ghost" size="sm" className="text-[#6366f1]">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No records yet. Start building your health timeline.</p>
                <Link href="/dashboard/records">
                  <Button className="mt-4 bg-[#6366f1] hover:bg-[#4f46e5]">
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Record
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
                    {recordTypeIcons[r.type] || <FileText className="h-4 w-4" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(r.date), 'MMM d, yyyy')} · {r.type}
                        {r.provider_name ? ` · ${r.provider_name}` : ''}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        r.status === 'active'
                          ? 'bg-green-500/10 text-green-400'
                          : r.status === 'resolved'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggested Actions */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.6 }}>
        <Card className="bg-gradient-to-r from-[#6366f1]/10 to-[#22d3ee]/10 border-[#1e1e2e]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-[#6366f1]/20">
                <Sparkles className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <h3 className="font-semibold">Generate an AI Brief</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Prepare for your next appointment with an AI-generated summary tailored to your specialist.
                </p>
                <Link href="/dashboard/ai-brief">
                  <Button size="sm" className="mt-3 bg-[#6366f1] hover:bg-[#4f46e5]">
                    Generate Brief
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
