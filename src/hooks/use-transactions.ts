'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as transactionService from '@/services/transaction-service';
import type { TransactionFormData } from '@/types';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.getTransactions,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionFormData) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
