'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Eye, ExternalLink, Link2, Loader2, Plus, Share2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { createShareLinkAction, revokeShareLinkAction } from '@/app/actions/share';
import type { ShareLink } from '@/types';
import { SPECIALTIES } from '@/types';

interface ShareContentProps {
  shareLinks: ShareLink[];
}

export function ShareContent({ shareLinks }: ShareContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState('summary');

  const activeLinks = shareLinks.filter(l => l.is_active);
  const expiredLinks = shareLinks.filter(l => !l.is_active);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createShareLinkAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Share link created');
        setDialogOpen(false);
        if (result.token) {
          copyLink(result.token);
        }
      }
    });
  }

  async function handleRevoke(id: string) {
    startTransition(async () => {
      const result = await revokeShareLinkAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Link revoked');
      }
    });
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secure Share</h1>
          <p className="text-muted-foreground mt-1">Generate secure links to share your records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#6366f1] hover:bg-[#4f46e5]">
              <Plus className="h-4 w-4 mr-2" /> Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121a] border-[#1e1e2e]">
            <DialogHeader>
              <DialogTitle>Create Share Link</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input name="recipient_name" placeholder="Dr. Smith" className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input name="purpose" placeholder="Cardiology appointment Feb 2026" className="bg-[#0a0a0f] border-[#1e1e2e]" />
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select name="access_level" value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                    <SelectItem value="full">Full History</SelectItem>
                    <SelectItem value="filtered">Filtered by Specialty</SelectItem>
                    <SelectItem value="summary">Summary Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {accessLevel === 'filtered' && (
                <div className="space-y-2">
                  <Label>Filter Specialties (comma-separated)</Label>
                  <Input name="filter_specialties" placeholder="Cardiology, Endocrinology" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Expires</Label>
                <Select name="expiry" defaultValue="1week">
                  <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                    <SelectItem value="1day">1 Day</SelectItem>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="never">No Expiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-[#1e1e2e]">Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-[#6366f1] hover:bg-[#4f46e5]">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Generate Link
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Active Links ({activeLinks.length})</h2>
        {activeLinks.length === 0 ? (
          <Card className="bg-[#12121a] border-[#1e1e2e]">
            <CardContent className="py-12 text-center">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No active share links.</p>
              <p className="text-sm text-muted-foreground mt-1">Create a link to securely share your records.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeLinks.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-[#12121a] border-[#1e1e2e]">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{link.recipient_name || 'Unnamed'}</h3>
                          <Badge variant="secondary" className="text-xs bg-[#1e1e2e] capitalize">{link.access_level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{link.purpose || 'No purpose specified'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {link.view_count} views
                          </span>
                          {link.viewed_at && (
                            <span>Last viewed {formatDistanceToNow(new Date(link.viewed_at))} ago</span>
                          )}
                          {link.expires_at && (
                            <span>Expires {format(new Date(link.expires_at), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1e1e2e]"
                          onClick={() => copyLink(link.token)}
                        >
                          {copiedToken === link.token ? (
                            <Check className="h-3.5 w-3.5 mr-1 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1" />
                          )}
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                          onClick={() => handleRevoke(link.id)}
                          disabled={isPending}
                        >
                          <X className="h-4 w-4" />
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

      {/* Revoked Links */}
      {expiredLinks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Revoked Links ({expiredLinks.length})</h2>
          <div className="space-y-3 opacity-60">
            {expiredLinks.map((link) => (
              <Card key={link.id} className="bg-[#12121a] border-[#1e1e2e]">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium line-through">{link.recipient_name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground">{link.purpose}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-400">Revoked</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
