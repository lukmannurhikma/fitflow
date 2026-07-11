'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, CalendarPlus, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useMember, useExtendMembership } from '@/hooks/use-members';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatShortDate, formatCurrency, getMemberPrice, getDaysRemaining } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { ErrorState } from '@/components/shared/error-state';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { MembershipHistory, PaymentHistory } from '@/types';

const dummyHistory: MembershipHistory[] = [
  { id: 'h1', member_id: '1', membership_type: 'Silver', start_date: '2024-06-01', end_date: '2024-09-01', amount: 900000, status: 'Expired', created_at: '2024-06-01' },
  { id: 'h2', member_id: '1', membership_type: 'Gold', start_date: '2024-09-01', end_date: '2025-03-01', amount: 1500000, status: 'Expired', created_at: '2024-09-01' },
  { id: 'h3', member_id: '1', membership_type: 'Platinum', start_date: '2025-03-01', end_date: '2026-03-01', amount: 2500000, status: 'Active', created_at: '2025-03-01' },
];

const dummyPayments: PaymentHistory[] = [
  { id: 'p1', member_id: '1', transaction_id: 't1', amount: 900000, payment_method: 'Transfer Bank', payment_status: 'Paid', description: 'Membership Silver 3 bulan', paid_at: '2024-06-01' },
  { id: 'p2', member_id: '1', transaction_id: 't2', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Paid', description: 'Upgrade ke Gold 6 bulan', paid_at: '2024-09-01' },
  { id: 'p3', member_id: '1', transaction_id: 't3', amount: 2500000, payment_method: 'E-Wallet', payment_status: 'Paid', description: 'Upgrade ke Platinum 12 bulan', paid_at: '2025-03-01' },
  { id: 'p4', member_id: '1', transaction_id: 't4', amount: 500000, payment_method: 'Transfer Bank', payment_status: 'Pending', description: 'Personal training 5 sesi', paid_at: '2025-06-15' },
];

const statusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  Active: { variant: 'default', label: 'Aktif' },
  Expired: { variant: 'destructive', label: 'Kadaluarsa' },
  Pending: { variant: 'secondary', label: 'Menunggu' },
};

const typeBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  Platinum: { variant: 'default', label: 'Platinum' },
  Gold: { variant: 'secondary', label: 'Gold' },
  Silver: { variant: 'outline', label: 'Silver' },
};

const payStatusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  Paid: { variant: 'default', label: 'Lunas' },
  Pending: { variant: 'secondary', label: 'Menunggu' },
  Failed: { variant: 'destructive', label: 'Gagal' },
};

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { data: member, isLoading, error, refetch } = useMember(id);
  const extendMembership = useExtendMembership();

  const [extendOpen, setExtendOpen] = useState(false);
  const [extendMonths, setExtendMonths] = useState('3');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');

  const history = useMemo(() => dummyHistory, []);
  const payments = useMemo(() => dummyPayments, []);

  const handleExtend = async () => {
    if (!member) return;
    try {
      await extendMembership.mutateAsync({ id: member.id, months: parseInt(extendMonths) });
      toast({ title: 'Berhasil', description: `Membership diperpanjang ${extendMonths} bulan` });
      setExtendOpen(false);
      refetch();
    } catch {
      toast({ title: 'Gagal', description: 'Gagal memperpanjang membership', variant: 'destructive' });
    }
  };

  if (isLoading) return <LoadingScreen message="Memuat detail member..." />;

  if (error) return <ErrorState message="Gagal memuat data member" onRetry={refetch} />;

  if (!member) {
    router.push('/members');
    return null;
  }

  const daysRemaining = getDaysRemaining(member.end_date);
  const sb = statusBadge[member.status] || { variant: 'outline' as const, label: member.status };
  const tb = typeBadge[member.membership_type] || { variant: 'outline' as const, label: member.membership_type };
  const memberName = member.profile?.full_name || 'Member';

  const extendAmount = Math.round((getMemberPrice(member.membership_type) / 12) * parseInt(extendMonths));
  const currentEnd = new Date(member.end_date);
  const now = new Date();
  const baseDate = currentEnd > now ? currentEnd : now;
  const newEnd = new Date(baseDate);
  newEnd.setMonth(newEnd.getMonth() + parseInt(extendMonths));
  const newEndStr = formatDate(newEnd);

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
              <Link href="/members">Daftar Member</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{memberName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar name={memberName} className="h-16 w-16 text-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{memberName}</h1>
                <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                <p className="text-sm text-muted-foreground">{member.profile?.phone || '-'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bergabung {formatDate(member.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={tb.variant}>{tb.label}</Badge>
              <Badge variant={sb.variant}>{sb.label}</Badge>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => router.push(`/members/edit/${member.id}`)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CalendarPlus className="h-4 w-4" />
                  Perpanjang Membership
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Perpanjang Membership</DialogTitle>
                  <DialogDescription>
                    Perpanjang membership untuk {memberName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="rounded-lg bg-muted p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Member</span>
                      <span className="font-medium">{memberName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tipe</span>
                      <span className="font-medium">{member.membership_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Berakhir</span>
                      <span className="font-medium">{formatDate(member.end_date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sisa Hari</span>
                      <span className="font-medium">{daysRemaining > 0 ? `${daysRemaining} hari` : 'Kadaluarsa'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Durasi Perpanjangan</Label>
                    <Select value={extendMonths} onValueChange={setExtendMonths}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 bulan - {formatCurrency(Math.round(getMemberPrice(member.membership_type) / 12))}</SelectItem>
                        <SelectItem value="3">3 bulan - {formatCurrency(Math.round((getMemberPrice(member.membership_type) / 12) * 3))}</SelectItem>
                        <SelectItem value="6">6 bulan - {formatCurrency(Math.round((getMemberPrice(member.membership_type) / 12) * 6))}</SelectItem>
                        <SelectItem value="12">12 bulan - {formatCurrency(getMemberPrice(member.membership_type))}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Metode Pembayaran</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                        <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                        <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Pembayaran</span>
                      <span className="text-lg font-bold text-foreground">{formatCurrency(extendAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tanggal Berakhir Baru</span>
                      <span className="font-medium text-foreground">{newEndStr}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Batal</Button>
                  </DialogClose>
                  <Button onClick={handleExtend} disabled={extendMembership.isPending}>
                    {extendMembership.isPending ? 'Memproses...' : 'Konfirmasi Perpanjangan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Nama</span>
              <span className="text-sm font-medium text-foreground">{memberName}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm text-foreground">{member.profile?.email || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Telepon</span>
              <span className="text-sm text-foreground">{member.profile?.phone || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Jenis Kelamin</span>
              <span className="text-sm text-foreground">-</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Tanggal Lahir</span>
              <span className="text-sm text-foreground">-</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Alamat</span>
              <span className="text-sm text-foreground">-</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Kontak Darurat</span>
              <span className="text-sm text-foreground">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Catatan</span>
              <span className="text-sm text-foreground">-</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Membership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{member.membership_type}</p>
                <p className="text-xs text-muted-foreground">Tipe Membership</p>
              </div>
              <Badge variant={tb.variant}>{tb.label}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{daysRemaining > 0 ? `${daysRemaining} hari` : 'Kadaluarsa'}</p>
                <p className="text-xs text-muted-foreground">Sisa Waktu</p>
              </div>
              <Badge variant={sb.variant}>{sb.label}</Badge>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <CalendarPlus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Mulai</p>
                  <p className="text-xs text-muted-foreground">{formatDate(member.start_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Berakhir</p>
                  <p className="text-xs text-muted-foreground">{formatDate(member.end_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Harga</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(getMemberPrice(member.membership_type))}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Membership</CardTitle>
            <CardDescription>Perubahan membership sebelumnya</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada riwayat membership</p>
            ) : (
              <div className="space-y-0">
                {history.map((h, idx) => {
                  const hsb = statusBadge[h.status] || { variant: 'outline' as const, label: h.status };
                  return (
                    <div key={h.id} className="relative flex gap-4 pb-6">
                      {idx < history.length - 1 && (
                        <div className="absolute left-[11px] top-5 h-full w-px bg-border" />
                      )}
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                        {h.status === 'Active' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{h.membership_type}</p>
                          <Badge variant={hsb.variant} className="text-[10px]">{hsb.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(h.start_date)} - {formatDate(h.end_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(h.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
            <CardDescription>Transaksi pembayaran member</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const psb = payStatusBadge[p.payment_status] || { variant: 'outline' as const, label: p.payment_status };
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-foreground">{p.description || '-'}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{p.payment_method}</TableCell>
                        <TableCell>
                          <Badge variant={psb.variant} className="text-[10px]">{psb.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatShortDate(p.paid_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
