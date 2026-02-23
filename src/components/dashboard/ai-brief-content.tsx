'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Brain, Check, Clock, Copy, FileText, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { generateAIBrief } from '@/app/actions/ai';
import type { AISummary } from '@/types';
import { SPECIALTIES } from '@/types';

interface AIBriefContentProps {
  summaries: AISummary[];
  hasRecords: boolean;
}

export function AIBriefContent({ summaries, hasRecords }: AIBriefContentProps) {
  const [specialty, setSpecialty] = useState('');
  const [isPending, startTransition] = useTransition();
  const [currentBrief, setCurrentBrief] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!specialty) {
      toast.error('Please select a specialty');
      return;
    }
    startTransition(async () => {
      const result = await generateAIBrief(specialty);
      if (result.error) {
        toast.error(result.error);
      } else if (result.summary) {
        setCurrentBrief(result.summary);
        toast.success('Brief generated successfully');
      }
    });
  }

  function copyBrief(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Health Brief</h1>
        <p className="text-muted-foreground mt-1">Generate an AI-powered summary for your next appointment</p>
      </div>

      {/* Generator */}
      <Card className="bg-gradient-to-r from-[#6366f1]/10 to-[#22d3ee]/10 border-[#1e1e2e]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#6366f1]/20">
              <Brain className="h-6 w-6 text-[#6366f1]" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Generate a New Brief</h2>
                <p className="text-sm text-muted-foreground">
                  Select the specialty for your upcoming appointment and AI will create a comprehensive summary.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="sm:w-64 bg-[#0a0a0f] border-[#1e1e2e]">
                    <SelectValue placeholder="Select specialty..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                    {SPECIALTIES.filter(s => s !== 'Other').map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGenerate}
                  disabled={isPending || !specialty}
                  className="bg-[#6366f1] hover:bg-[#4f46e5]"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isPending ? 'Generating...' : 'Generate Brief'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Brief */}
      {currentBrief && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-[#12121a] border-[#1e1e2e]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#6366f1]" />
                Generated Brief — {specialty}
              </CardTitle>
              <Button variant="outline" size="sm" className="border-[#1e1e2e]" onClick={() => copyBrief(currentBrief)}>
                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{currentBrief}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Past Briefs */}
      {summaries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Briefs</h2>
          <div className="space-y-3">
            {summaries.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-[#12121a] border-[#1e1e2e]">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs bg-[#1e1e2e] text-[#22d3ee]">{s.specialty}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(s.generated_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{s.summary.slice(0, 200)}...</p>
                        {s.key_conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.key_conditions.map((c) => (
                              <Badge key={c} variant="outline" className="text-xs border-[#1e1e2e]">{c}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="border-[#1e1e2e] shrink-0" onClick={() => { setCurrentBrief(s.summary); setSpecialty(s.specialty); }}>
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
