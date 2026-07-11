import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionFormData } from '@/types';

function generateInvoiceNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${y}${m}${d}-${rand}`;
}

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, member:members(*, profile:profiles(*))')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, member:members(*, profile:profiles(*))')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createTransaction(data: TransactionFormData): Promise<Transaction> {
  const supabase = createClient();
  const invoiceNumber = generateInvoiceNumber();

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      member_id: data.member_id,
      invoice_number: invoiceNumber,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      type: data.type,
      description: data.description || null,
      created_at: data.date || undefined,
    })
    .select('*, member:members(*, profile:profiles(*))')
    .single();

  if (error) throw new Error(error.message);
  return transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
