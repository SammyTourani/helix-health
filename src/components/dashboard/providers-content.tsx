'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Building2, Loader2, Mail, Phone, Plus, Shield, ShieldCheck, ShieldX, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createProviderAction, deleteProviderAction, updateProviderAction } from '@/app/actions/providers';
import type { Provider } from '@/types';
import { SPECIALTIES } from '@/types';

interface ProvidersContentProps {
  providers: Provider[];
}

export function ProvidersContent({ providers }: ProvidersContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createProviderAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Provider added');
        setDialogOpen(false);
      }
    });
  }

  async function handleToggleAccess(provider: Provider) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('has_access', String(!provider.has_access));
      formData.set('name', provider.name);
      const result = await updateProviderAction(provider.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(provider.has_access ? 'Access revoked' : 'Access granted');
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProviderAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Provider removed');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
          <p className="text-muted-foreground mt-1">Manage your healthcare providers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#6366f1] hover:bg-[#4f46e5]">
              <Plus className="h-4 w-4 mr-2" /> Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121a] border-[#1e1e2e]">
            <DialogHeader>
              <DialogTitle>Add Provider</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input name="name" required placeholder="Dr. Jane Smith" className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select name="specialty">
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
              <div className="space-y-2">
                <Label>Clinic Name</Label>
                <Input name="clinic_name" placeholder="City Health Center" className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" placeholder="doctor@clinic.com" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" placeholder="(555) 123-4567" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-[#1e1e2e]">Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-[#6366f1] hover:bg-[#4f46e5]">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Provider
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {providers.length === 0 ? (
        <Card className="bg-[#12121a] border-[#1e1e2e]">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No providers added yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your healthcare providers to manage access to your records.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-[#12121a] border-[#1e1e2e] hover:border-[#6366f1]/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      {p.specialty && (
                        <Badge variant="secondary" className="text-xs mt-1 bg-[#1e1e2e] text-[#22d3ee]">
                          {p.specialty}
                        </Badge>
                      )}
                    </div>
                    {p.has_access ? (
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                    ) : (
                      <ShieldX className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {p.clinic_name && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{p.clinic_name}</span>
                      </div>
                    )}
                    {p.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{p.email}</span>
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1e1e2e]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#1e1e2e]"
                      onClick={() => handleToggleAccess(p)}
                      disabled={isPending}
                    >
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      {p.has_access ? 'Revoke' : 'Grant'} Access
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(p.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
