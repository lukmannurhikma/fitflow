'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/types';
import * as authService from '@/services/auth-service';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName: string;
    }) => authService.signUp(email, password, fullName, 'member'),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member',
    signIn: async (email: string, password: string) => {
      await signInMutation.mutateAsync({ email, password });
    },
    signOut: async () => {
      await signOutMutation.mutateAsync();
    },
  };
}
