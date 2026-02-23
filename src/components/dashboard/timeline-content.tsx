'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, Clock, FileText, Heart, Pill, Plus, Search, Syringe, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format, getYear } from 'date-fns';
import type { HealthRecord, RecordType } from '@/types';

const typeFilters: { value: RecordType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'condition', label: 'Conditions' },
  { value: 'medication', label: 'Medications' },
  { value: 'visit', label: 'Visits' },
  { value: 'lab', label: 'Labs' },
  { value: 'procedure', label: 'Procedures' },
  { value: 'vaccination', label: 'Vaccinations' },
];

const typeIcons: Record<string, React.ReactNode> = {
  condition: <Heart className="h-4 w-4" />,
  medication: <Pill className="h-4 w-4" />,
  visit: <Calendar className="h-4 w-4" />,
  lab: <Activity className="h-4 w-4" />,
  imaging: <FileText className="h-4 w-4" />,
  procedure: <FileText className="h-4 w-4" />,
  vaccination: <Syringe className="h-4 w-4" />,
  allergy: <Heart className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  condition: 'bg-red-500/20 text-red-400 border-red-500/30',
  medication: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  visit: 'bg-green-500/20 text-green-400 border-green-500/30',
  lab: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  imaging: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  procedure: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  vaccination: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  allergy: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

interface TimelineContentProps {
  records: HealthRecord[];
}

export function TimelineContent({ records }: TimelineContentProps) {
  const [filter, setFilter] = useState<RecordType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    if (filter !== 'all' && r.type !== filter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by year
  const byYear = filtered.reduce<Record<number, HealthRecord[]>>((acc, r) => {
    const year = getYear(new Date(r.date));
    if (!acc[year]) acc[year] = [];
    acc[year].push(r);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground mt-1">Your complete health history</p>
        </div>
        <Link href="/dashboard/records">
          <Button className="bg-[#6366f1] hover:bg-[#4f46e5]">
            <Plus className="h-4 w-4 mr-2" /> Add Record
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#12121a] border-[#1e1e2e]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((t) => (
            <Button
              key={t.value}
              variant={filter === t.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(t.value)}
              className={filter === t.value ? 'bg-[#6366f1] hover:bg-[#4f46e5]' : 'border-[#1e1e2e] hover:bg-[#1e1e2e]'}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <Card className="bg-[#12121a] border-[#1e1e2e]">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No records found. Start building your health timeline.</p>
            <Link href="/dashboard/records">
              <Button className="mt-4 bg-[#6366f1] hover:bg-[#4f46e5]">
                <Plus className="h-4 w-4 mr-2" /> Add First Record
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year}>
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 mb-4">
                <h2 className="text-xl font-bold text-[#6366f1]">{year}</h2>
              </div>
              <div className="relative pl-8 border-l-2 border-[#1e1e2e] space-y-4">
                <AnimatePresence>
                  {byYear[year].map((record, i) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-[#1e1e2e] ${
                        record.status === 'active' ? 'bg-green-500' : record.status === 'resolved' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />

                      <Card
                        className="bg-[#12121a] border-[#1e1e2e] cursor-pointer hover:border-[#6366f1]/50 transition-colors"
                        onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                      >
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg ${typeColors[record.type]}`}>
                                {typeIcons[record.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{record.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(record.date), 'MMM d, yyyy')}
                                  {record.provider_name ? ` · ${record.provider_name}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {record.specialty && (
                                <Badge variant="secondary" className="text-xs bg-[#1e1e2e]">
                                  {record.specialty}
                                </Badge>
                              )}
                              <Badge
                                className={`text-xs ${
                                  record.status === 'active'
                                    ? 'bg-green-500/10 text-green-400'
                                    : record.status === 'resolved'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }`}
                              >
                                {record.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {expandedId === record.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-[#1e1e2e] space-y-2">
                                  {record.description && (
                                    <p className="text-sm text-muted-foreground">{record.description}</p>
                                  )}
                                  {record.notes && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
                                      <p className="text-sm mt-1">{record.notes}</p>
                                    </div>
                                  )}
                                  {record.metadata && Object.keys(record.metadata).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {Object.entries(record.metadata).map(([key, value]) =>
                                        value ? (
                                          <Badge key={key} variant="outline" className="text-xs border-[#1e1e2e]">
                                            {key}: {String(value)}
                                          </Badge>
                                        ) : null
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
