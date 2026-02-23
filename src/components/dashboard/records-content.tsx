'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Trash2, Edit2, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createRecordAction, deleteRecordAction, updateRecordAction } from '@/app/actions/records';
import type { HealthRecord } from '@/types';
import { RECORD_TYPES, SPECIALTIES } from '@/types';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400',
  resolved: 'bg-blue-500/10 text-blue-400',
  discontinued: 'bg-yellow-500/10 text-yellow-400',
};

interface RecordsContentProps {
  records: HealthRecord[];
}

export function RecordsContent({ records: initialRecords }: RecordsContentProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [recordType, setRecordType] = useState('condition');

  const filtered = initialRecords.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.provider_name?.toLowerCase().includes(q);
    }
    return true;
  });

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editingRecord
        ? await updateRecordAction(editingRecord.id, formData)
        : await createRecordAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingRecord ? 'Record updated' : 'Record created');
        setDialogOpen(false);
        setEditingRecord(null);
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteRecordAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Record deleted');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Records</h1>
          <p className="text-muted-foreground mt-1">Manage all your health records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingRecord(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#6366f1] hover:bg-[#4f46e5]" onClick={() => { setEditingRecord(null); setRecordType('condition'); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121a] border-[#1e1e2e] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Record' : 'Add New Record'}</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="type" defaultValue={editingRecord?.type || 'condition'} onValueChange={setRecordType}>
                    <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                      {RECORD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editingRecord?.status || 'active'}>
                    <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" required defaultValue={editingRecord?.title || ''} placeholder="e.g., Type 2 Diabetes, Lisinopril 10mg" className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input name="date" type="date" required defaultValue={editingRecord?.date || ''} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
                <div className="space-y-2">
                  <Label>End Date (optional)</Label>
                  <Input name="end_date" type="date" defaultValue={editingRecord?.end_date || ''} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input name="provider_name" defaultValue={editingRecord?.provider_name || ''} placeholder="Dr. Smith" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Select name="specialty" defaultValue={editingRecord?.specialty || ''}>
                    <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingRecord?.description || ''} placeholder="Brief description..." className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" defaultValue={editingRecord?.notes || ''} placeholder="Additional notes..." className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>

              {/* Dynamic metadata fields */}
              {recordType === 'medication' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input name="dosage" defaultValue={(editingRecord?.metadata as Record<string, string>)?.dosage || ''} placeholder="e.g., 10mg" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input name="frequency" defaultValue={(editingRecord?.metadata as Record<string, string>)?.frequency || ''} placeholder="e.g., Once daily" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                  </div>
                </div>
              )}

              {recordType === 'lab' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lab Name</Label>
                    <Input name="lab_name" defaultValue={(editingRecord?.metadata as Record<string, string>)?.lab_name || ''} placeholder="e.g., Complete Blood Count" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Key Values</Label>
                      <Input name="key_values" defaultValue={(editingRecord?.metadata as Record<string, string>)?.key_values || ''} placeholder="e.g., HbA1c: 6.5%" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Reference Range</Label>
                      <Input name="reference_range" defaultValue={(editingRecord?.metadata as Record<string, string>)?.reference_range || ''} placeholder="e.g., 4.0-5.6%" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                  </div>
                </div>
              )}

              {recordType === 'imaging' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Imaging Type</Label>
                    <Select name="imaging_type" defaultValue={(editingRecord?.metadata as Record<string, string>)?.imaging_type || ''}>
                      <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                        <SelectItem value="MRI">MRI</SelectItem>
                        <SelectItem value="CT">CT Scan</SelectItem>
                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Region</Label>
                    <Input name="body_region" defaultValue={(editingRecord?.metadata as Record<string, string>)?.body_region || ''} placeholder="e.g., Chest" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Findings</Label>
                    <Input name="findings" defaultValue={(editingRecord?.metadata as Record<string, string>)?.findings || ''} placeholder="Key findings" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-[#1e1e2e]">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-[#6366f1] hover:bg-[#4f46e5]">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingRecord ? 'Update' : 'Create'} Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#12121a] border-[#1e1e2e]" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-[#12121a] border-[#1e1e2e]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
            <SelectItem value="all">All Types</SelectItem>
            {RECORD_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#12121a] border-[#1e1e2e]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      {filtered.length === 0 ? (
        <Card className="bg-[#12121a] border-[#1e1e2e]">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No records found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="bg-[#12121a] border-[#1e1e2e] hover:border-[#6366f1]/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs capitalize bg-[#1e1e2e]">{r.type}</Badge>
                        <h3 className="font-medium truncate">{r.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(r.date), 'MMM d, yyyy')}
                        {r.provider_name ? ` · ${r.provider_name}` : ''}
                        {r.specialty ? ` · ${r.specialty}` : ''}
                      </p>
                      {r.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{r.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-xs ${statusColors[r.status]}`}>{r.status}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingRecord(r); setRecordType(r.type); setDialogOpen(true); }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
