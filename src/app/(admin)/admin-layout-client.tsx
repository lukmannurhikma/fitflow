'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Topbar } from '@/components/layout/topbar';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated, isAdmin, isOwner } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin && !isOwner) {
      router.push('/member/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, isOwner, router]);

  if (isLoading || !user) return null;
  if (!isAuthenticated) return null;
  if (!isAdmin && !isOwner) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="min-h-screen pt-16 lg:ml-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
