'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Eye, Trash2, Receipt, CreditCard, Building2, Wallet, Banknote } from 'lucide-react';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { UserAvatar } from '@/components/shared/user-avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import type { Transaction } from '@/types';

const dummyTransactions: Transaction[] = [
  { id: '1', member_id: '1', invoice_number: 'INV-20250701-A1B2C3', amount: 2500000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Membership', description: 'Membership Platinum 12 bulan', created_at: '2025-07-01', member: { id: '1', profile_id: '1', membership_type: 'Platinum', start_date: '2025-07-01', end_date: '2026-07-01', status: 'Active', created_at: '2025-07-01', profile: { id: '1', full_name: 'Andi Pratama', email: 'andi@email.com', phone: '081234567890', role: 'member', avatar_url: null, created_at: '2024-06-01' } } },
  { id: '2', member_id: '2', invoice_number: 'INV-20250702-D4E5F6', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Paid', type: 'Membership', description: 'Membership Gold 6 bulan', created_at: '2025-07-02', member: { id: '2', profile_id: '2', membership_type: 'Gold', start_date: '2025-03-01', end_date: '2025-12-01', status: 'Active', created_at: '2024-06-02', profile: { id: '2', full_name: 'Siti Rahmawati', email: 'siti@email.com', phone: '081234567891', role: 'member', avatar_url: null, created_at: '2024-06-02' } } },
  { id: '3', member_id: '3', invoice_number: 'INV-20250703-G7H8I9', amount: 500000, payment_method: 'E-Wallet', payment_status: 'Pending', type: 'Personal Training', description: 'Personal training 5 sesi', created_at: '2025-07-03', member: { id: '3', profile_id: '3', membership_type: 'Silver', start_date: '2025-05-10', end_date: '2025-08-10', status: 'Active', created_at: '2024-06-03', profile: { id: '3', full_name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567892', role: 'member', avatar_url: null, created_at: '2024-06-03' } } },
  { id: '4', member_id: '4', invoice_number: 'INV-20250704-J0K1L2', amount: 350000, payment_method: 'Tunai', payment_status: 'Paid', type: 'Merchandise', description: 'Beli jersey gym', created_at: '2025-07-04', member: { id: '4', profile_id: '4', membership_type: 'Platinum', start_date: '2024-01-01', end_date: '2025-01-01', status: 'Expired', created_at: '2024-01-01', profile: { id: '4', full_name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', role: 'member', avatar_url: null, created_at: '2024-01-01' } } },
  { id: '5', member_id: '5', invoice_number: 'INV-20250705-M3N4O5', amount: 400000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Personal Training', description: 'Personal training 4 sesi', created_at: '2025-07-05', member: { id: '5', profile_id: '5', membership_type: 'Gold', start_date: '2025-06-15', end_date: '2026-06-15', status: 'Active', created_at: '2025-06-15', profile: { id: '5', full_name: 'Rudi Hermawan', email: 'rudi@email.com', phone: '081234567894', role: 'member', avatar_url: null, created_at: '2025-06-15' } } },
  { id: '6', member_id: '6', invoice_number: 'INV-20250706-P6Q7R8', amount: 900000, payment_method: 'Kartu Kredit', payment_status: 'Failed', type: 'Membership', description: 'Membership Silver 3 bulan', created_at: '2025-07-06', member: { id: '6', profile_id: '6', membership_type: 'Silver', start_date: '2025-07-01', end_date: '2025-08-01', status: 'Active', created_at: '2025-07-01', profile: { id: '6', full_name: 'Maya Anggraini', email: 'maya@email.com', phone: '081234567895', role: 'member', avatar_url: null, created_at: '2025-07-01' } } },
  { id: '7', member_id: '7', invoice_number: 'INV-20250707-S9T0U1', amount: 2500000, payment_method: 'E-Wallet', payment_status: 'Paid', type: 'Membership', description: 'Membership Platinum 12 bulan', created_at: '2025-07-07', member: { id: '7', profile_id: '7', membership_type: 'Platinum', start_date: '2025-02-20', end_date: '2026-02-20', status: 'Active', created_at: '2025-02-20', profile: { id: '7', full_name: 'Agus Wijaya', email: 'agus@email.com', phone: '081234567896', role: 'member', avatar_url: null, created_at: '2025-02-20' } } },
  { id: '8', member_id: '8', invoice_number: 'INV-20250708-V2W3X4', amount: 750000, payment_method: 'Transfer Bank', payment_status: 'Pending', type: 'Personal Training', description: 'Personal training 8 sesi', created_at: '2025-07-08', member: { id: '8', profile_id: '8', membership_type: 'Gold', start_date: '2024-08-01', end_date: '2025-02-01', status: 'Expired', created_at: '2024-08-01', profile: { id: '8', full_name: 'Rina Amelia', email: 'rina@email.com', phone: '081234567897', role: 'member', avatar_url: null, created_at: '2024-08-01' } } },
  { id: '9', member_id: '9', invoice_number: 'INV-20250709-Y5Z6A7', amount: 200000, payment_method: 'Tunai', payment_status: 'Paid', type: 'Merchandise', description: 'Beli handuk dan botol minum', created_at: '2025-07-09', member: { id: '9', profile_id: '9', membership_type: 'Silver', start_date: '2025-06-01', end_date: '2025-09-01', status: 'Active', created_at: '2025-06-01', profile: { id: '9', full_name: 'Dimas Prayoga', email: 'dimas@email.com', phone: '081234567898', role: 'member', avatar_url: null, created_at: '2025-06-01' } } },
  { id: '10', member_id: '10', invoice_number: 'INV-20250710-B8C9D0', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Paid', type: 'Membership', description: 'Membership Gold 6 bulan', created_at: '2025-07-10', member: { id: '10', profile_id: '10', membership_type: 'Gold', start_date: '2025-07-10', end_date: '2025-08-10', status: 'Pending', created_at: '2025-07-10', profile: { id: '10', full_name: 'Fitri Handayani', email: 'fitri@email.com', phone: '081234567899', role: 'member', avatar_url: null, created_at: '2025-07-10' } } },
  { id: '11', member_id: '11', invoice_number: 'INV-20250711-E1F2G3', amount: 300000, payment_method: 'E-Wallet', payment_status: 'Failed', type: 'Personal Training', description: 'Personal training 3 sesi', created_at: '2025-07-11', member: { id: '11', profile_id: '11', membership_type: 'Platinum', start_date: '2025-04-01', end_date: '2026-04-01', status: 'Active', created_at: '2025-04-01', profile: { id: '11', full_name: 'Hendra Gunawan', email: 'hendra@email.com', phone: '081234567800', role: 'member', avatar_url: null, created_at: '2025-04-01' } } },
  { id: '12', member_id: '12', invoice_number: 'INV-20250712-H4I5J6', amount: 450000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Merchandise', description: 'Beli matras yoga', created_at: '2025-07-12', member: { id: '12', profile_id: '12', membership_type: 'Silver', start_date: '2025-07-01', end_date: '2025-10-01', status: 'Active', created_at: '2025-07-01', profile: { id: '12', full_name: 'Nina Permata', email: 'nina@email.com', phone: '081234567801', role: 'member', avatar_url: null, created_at: '2025-07-01' } } },
  { id: '13', member_id: '13', invoice_number: 'INV-20250713-K7L8M9', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Pending', type: 'Membership', description: 'Membership Gold 6 bulan', created_at: '2025-07-13', member: { id: '13', profile_id: '13', membership_type: 'Gold', start_date: '2025-05-20', end_date: '2025-11-20', status: 'Active', created_at: '2025-05-20', profile: { id: '13', full_name: 'Arief Wicaksono', email: 'arief@email.com', phone: '081234567802', role: 'member', avatar_url: null, created_at: '2025-05-20' } } },
  { id: '14', member_id: '14', invoice_number: 'INV-20250714-N0O1P2', amount: 600000, payment_method: 'Tunai', payment_status: 'Paid', type: 'Personal Training', description: 'Personal training 6 sesi', created_at: '2025-07-14', member: { id: '14', profile_id: '14', membership_type: 'Silver', start_date: '2024-11-01', end_date: '2025-02-01', status: 'Expired', created_at: '2024-11-01', profile: { id: '14', full_name: 'Ratna Kusuma', email: 'ratna@email.com', phone: '081234567803', role: 'member', avatar_url: null, created_at: '2024-11-01' } } },
  { id: '15', member_id: '15', invoice_number: 'INV-20250715-Q3R4S5', amount: 2500000, payment_method: 'E-Wallet', payment_status: 'Paid', type: 'Membership', description: 'Membership Platinum 12 bulan', created_at: '2025-07-15', member: { id: '15', profile_id: '15', membership_type: 'Platinum', start_date: '2025-07-01', end_date: '2026-07-01', status: 'Active', created_at: '2025-07-01', profile: { id: '15', full_name: 'Bayu Permadi', email: 'bayu@email.com', phone: '081234567804', role: 'member', avatar_url: null, created_at: '2025-07-01' } } },
];

const PAGE_SIZE = 10;

const paymentStatusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  Paid: { variant: 'default', label: 'Berhasil' },
  Pending: { variant: 'secondary', label: 'Pending' },
  Failed: { variant: 'destructive', label: 'Gagal' },
};

const typeBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  Membership: { variant: 'default', label: 'Membership' },
  'Personal Training': { variant: 'secondary', label: 'Personal Training' },
  Merchandise: { variant: 'outline', label: 'Merchandise' },
};

const methodIcon: Record<string, React.ReactNode> = {
  'Transfer Bank': <Building2 className="h-4 w-4" />,
  'Kartu Kredit': <CreditCard className="h-4 w-4" />,
  'E-Wallet': <Wallet className="h-4 w-4" />,
  Tunai: <Banknote className="h-4 w-4" />,
};

export default function TransactionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: queryTransactions, isLoading, error, refetch } = useTransactions();
  const deleteTransaction = useDeleteTransaction();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  const transactions = queryTransactions && queryTransactions.length > 0 ? queryTransactions : dummyTransactions;

  const filtered = useMemo(() => {
    let result = transactions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.invoice_number.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.member?.profile?.full_name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((t) => t.payment_status === statusFilter);
    return result;
  }, [transactions, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast({ title: 'Berhasil', description: 'Transaksi berhasil dihapus' });
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menghapus transaksi', variant: 'destructive' });
    }
    setDeleteId(null);
  };

  if (error) return <ErrorState message="Gagal memuat data transaksi" onRetry={refetch} />;

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
            <BreadcrumbPage>Transaksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Transaksi</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} total transaksi</p>
        </div>
        <Button onClick={() => router.push('/transactions/add')}>
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Paid">Berhasil</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari invoice, member, atau deskripsi..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Tidak ada transaksi"
              description={search || statusFilter !== 'all' ? 'Tidak ada transaksi yang sesuai dengan filter' : 'Belum ada transaksi tercatat'}
              action={
                <Button onClick={() => router.push('/transactions/add')}>
                  <Plus className="h-4 w-4" />
                  Tambah Transaksi
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((tx) => {
                  const psb = paymentStatusBadge[tx.payment_status] || { variant: 'outline' as const, label: tx.payment_status };
                  const tb = typeBadge[tx.type] || { variant: 'outline' as const, label: tx.type };
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {tx.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={tx.member?.profile?.full_name || ''} className="h-8 w-8" />
                          <span className="font-medium text-foreground">{tx.member?.profile?.full_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tb.variant} className="text-[10px]">{tb.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground">
                        {tx.description || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {methodIcon[tx.payment_method]}
                          <span className="text-xs">{tx.payment_method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={psb.variant} className="text-[10px]">{psb.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatShortDate(tx.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog
                            open={detailTx?.id === tx.id}
                            onOpenChange={(open) => { if (!open) setDetailTx(null); }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setDetailTx(tx)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Detail Transaksi</DialogTitle>
                                <DialogDescription>
                                  Informasi lengkap transaksi {tx.invoice_number}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                                    <p className="text-2xl font-bold text-foreground">{formatCurrency(tx.amount)}</p>
                                  </div>
                                  <Badge variant={psb.variant} className="text-xs">{psb.label}</Badge>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Invoice</p>
                                    <p className="font-medium text-foreground font-mono">{tx.invoice_number}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Tanggal</p>
                                    <p className="font-medium text-foreground">{formatDate(tx.created_at)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Tipe</p>
                                    <p className="font-medium text-foreground">{tx.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Metode</p>
                                    <p className="font-medium text-foreground">{tx.payment_method}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Member</p>
                                    <p className="font-medium text-foreground">{tx.member?.profile?.full_name || '-'}</p>
                                  </div>
                                  {tx.description && (
                                    <div className="col-span-2">
                                      <p className="text-muted-foreground">Deskripsi</p>
                                      <p className="font-medium text-foreground">{tx.description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog
                            open={deleteId === tx.id}
                            onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(tx.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus transaksi {tx.invoice_number}? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(tx.id)}>
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {!isLoading && paginated.length > 0 && totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Selanjutnya
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
