'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import type { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOwner: false,
  isAdmin: false,
  isMember: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
