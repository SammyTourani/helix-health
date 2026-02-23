'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  FileText,
  Users,
  Share2,
  Brain,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Timeline', icon: Clock, href: '/dashboard/timeline' },
  { label: 'Records', icon: FileText, href: '/dashboard/records' },
  { label: 'Providers', icon: Users, href: '/dashboard/providers' },
  { label: 'Share', icon: Share2, href: '/dashboard/share' },
  { label: 'AI Brief', icon: Brain, href: '/dashboard/ai-brief' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

interface SidebarProps {
  user: {
    full_name: string | null;
    email: string;
  };
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

function SidebarNav({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="text-2xl">&#9877;</span>
          <span className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">
            Helix
          </span>
        </Link>
      </div>

      <Separator className="bg-[#1e1e2e]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#6366f1]/10 text-[#6366f1]'
                  : 'text-muted-foreground hover:bg-[#1e1e2e] hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-[#1e1e2e]" />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar size="default">
            <AvatarFallback className="bg-[#6366f1]/20 text-[#6366f1] text-xs font-semibold">
              {getInitials(user.full_name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.full_name || 'User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <>
      {/* Mobile Header with Sheet Trigger */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-[#1e1e2e] bg-[#0a0a0f] px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 border-r border-[#1e1e2e] bg-[#0a0a0f] p-0"
            showCloseButton={false}
          >
            <SidebarNav user={user} />
          </SheetContent>
        </Sheet>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <span className="text-xl">&#9877;</span>
          <span className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">
            Helix
          </span>
        </Link>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r border-[#1e1e2e] bg-[#0a0a0f]">
        <SidebarNav user={user} />
      </aside>
    </>
  );
}
