'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Receipt, Dumbbell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/shared/user-avatar';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Daftar Member', href: '/members', icon: Users },
  { label: 'Transaksi', href: '/transactions', icon: Receipt },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold">
            <Dumbbell className="h-6 w-6 text-sidebar-accent" />
            <span>FitFlow</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {user && (
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <UserAvatar
                name={user.full_name}
                imageUrl={user.avatar_url}
                className="h-8 w-8"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.full_name}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
