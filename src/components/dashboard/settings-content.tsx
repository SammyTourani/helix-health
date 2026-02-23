'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Save, Shield, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { updateProfile } from '@/app/actions/profile';
import type { User as UserType } from '@/types';
import { BLOOD_TYPES } from '@/types';

interface SettingsContentProps {
  profile: UserType | null;
  email: string;
}

export function SettingsContent({ profile, email }: SettingsContentProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated');
      }
    });
  }

  async function handleExport() {
    toast.info('Export feature coming soon');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-[#12121a] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profile
            </CardTitle>
            <CardDescription>Your personal and medical information</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="full_name" defaultValue={profile?.full_name || ''} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} disabled className="bg-[#0a0a0f] border-[#1e1e2e] opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input name="date_of_birth" type="date" defaultValue={profile?.date_of_birth || ''} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
                <div className="space-y-2">
                  <Label>Blood Type</Label>
                  <Select name="blood_type" defaultValue={profile?.blood_type || ''}>
                    <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                      {BLOOD_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allergies (comma-separated)</Label>
                <Input name="allergies" defaultValue={profile?.allergies?.join(', ') || ''} placeholder="Penicillin, Shellfish, Latex" className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>

              <Separator className="bg-[#1e1e2e]" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input name="emergency_contact_name" defaultValue={profile?.emergency_contact_name || ''} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Phone</Label>
                  <Input name="emergency_contact_phone" defaultValue={profile?.emergency_contact_phone || ''} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="bg-[#6366f1] hover:bg-[#4f46e5]">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Export */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-[#12121a] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Export Data
            </CardTitle>
            <CardDescription>Download all your health records as JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-[#1e1e2e]" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export All Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-[#12121a] border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
