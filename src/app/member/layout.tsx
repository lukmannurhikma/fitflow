'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MemberSidebar } from '@/components/layout/member-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAuthContext } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isMember } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isMember) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isMember, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MemberSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="pt-16 lg:pl-64 min-h-screen transition-all duration-200">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
