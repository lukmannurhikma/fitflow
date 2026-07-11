'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as memberService from '@/services/member-service';
import type { MemberFormData } from '@/types';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: memberService.getMembers,
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => memberService.getMemberById(id),
    enabled: !!id,
  });
}

export function useMemberByProfile(profileId: string) {
  return useQuery({
    queryKey: ['members', 'profile', profileId],
    queryFn: () => memberService.getMemberByProfileId(profileId),
    enabled: !!profileId,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberFormData) => memberService.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, string> }) =>
      memberService.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memberService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useExtendMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, months }: { id: string; months: number }) =>
      memberService.extendMembership(id, months),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
