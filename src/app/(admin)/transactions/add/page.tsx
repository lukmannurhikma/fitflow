'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { useMembers } from '@/hooks/use-members';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const transactionSchema = z.object({
  member_id: z.string().min(1, 'Member wajib dipilih'),
  type: z.string().min(1, 'Tipe transaksi wajib dipilih'),
  amount: z.string().min(1, 'Jumlah wajib diisi').refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    'Jumlah harus lebih dari 0'
  ),
  payment_method: z.string().min(1, 'Metode pembayaran wajib dipilih'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  payment_status: z.string().min(1, 'Status wajib dipilih'),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function AddTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createTransaction = useCreateTransaction();
  const { data: members } = useMembers();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      member_id: '',
      type: '',
      amount: '',
      payment_method: '',
      date: new Date().toISOString().split('T')[0],
      payment_status: '',
      description: '',
    },
  });

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await createTransaction.mutateAsync({
        member_id: data.member_id,
        type: data.type as 'Membership' | 'Personal Training' | 'Merchandise',
        amount: Number(data.amount),
        payment_method: data.payment_method as 'Transfer Bank' | 'Kartu Kredit' | 'E-Wallet' | 'Tunai',
        payment_status: data.payment_status as 'Paid' | 'Pending' | 'Failed',
        date: data.date,
        description: data.description || '',
      });
      toast({ title: 'Berhasil', description: 'Transaksi baru berhasil ditambahkan' });
      router.push('/transactions');
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menambahkan transaksi', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/transactions">Transaksi</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tambah Transaksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Transaksi Baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lengkapi data untuk mencatat transaksi baru</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member_id">Member</Label>
              <Select
                value={form.watch('member_id')}
                onValueChange={(v) => form.setValue('member_id', v, { shouldValidate: true })}
              >
                <SelectTrigger id="member_id">
                  <SelectValue placeholder="Pilih member" />
                </SelectTrigger>
                <SelectContent>
                  {(members || []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.profile?.full_name || m.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.member_id && (
                <p className="text-xs text-destructive">{form.formState.errors.member_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Transaksi</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(v) => form.setValue('type', v, { shouldValidate: true })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Membership">Membership</SelectItem>
                  <SelectItem value="Personal Training">Personal Training</SelectItem>
                  <SelectItem value="Merchandise">Merchandise</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Masukkan jumlah"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Metode Pembayaran</Label>
              <Select
                value={form.watch('payment_method')}
                onValueChange={(v) => form.setValue('payment_method', v, { shouldValidate: true })}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                  <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                  <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                  <SelectItem value="Tunai">Tunai</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.payment_method && (
                <p className="text-xs text-destructive">{form.formState.errors.payment_method.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status">Status</Label>
              <Select
                value={form.watch('payment_status')}
                onValueChange={(v) => form.setValue('payment_status', v, { shouldValidate: true })}
              >
                <SelectTrigger id="payment_status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.payment_status && (
                <p className="text-xs text-destructive">{form.formState.errors.payment_status.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Deskripsi transaksi (opsional)"
                {...form.register('description')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push('/transactions')}>
            <ArrowLeft className="h-4 w-4" />
            Batal
          </Button>
          <Button type="submit" disabled={createTransaction.isPending}>
            {createTransaction.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {createTransaction.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
