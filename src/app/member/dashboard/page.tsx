'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  History,
  QrCode,
  User,
  CalendarDays,
  Clock,
  ChevronRight,
  Loader2,
  Receipt,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/shared/user-avatar';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { ErrorState } from '@/components/shared/error-state';
import { useAuthContext } from '@/providers/auth-provider';
import { useMemberByProfile, useExtendMembership } from '@/hooks/use-members';
import { useTransactions } from '@/hooks/use-transactions';
import { useToast } from '@/hooks/use-toast';
import {
  formatDate,
  formatCurrency,
  getDaysRemaining,
  getMemberPrice,
  formatShortDate,
} from '@/lib/utils';
import type { Member, MembershipHistory, PaymentMethod } from '@/types';

const dummyMember: Member = {
  id: '1',
  profile_id: '',
  membership_type: 'Platinum',
  start_date: '2025-01-15',
  end_date: '2026-01-15',
  status: 'Active',
  created_at: '2024-06-01',
};

const dummyPayments = [
  { id: '1', description: 'Pembayaran Membership Platinum', amount: 2500000, payment_status: 'Paid' as const, payment_method: 'Transfer Bank' as const, created_at: '2025-01-15' },
  { id: '2', description: 'Pembayaran Membership Platinum', amount: 2500000, payment_status: 'Paid' as const, payment_method: 'E-Wallet' as const, created_at: '2024-07-01' },
  { id: '3', description: 'Personal Training Session', amount: 350000, payment_status: 'Paid' as const, payment_method: 'Tunai' as const, created_at: '2024-06-15' },
];

const dummyHistory: MembershipHistory[] = [
  { id: '1', member_id: '1', membership_type: 'Platinum', start_date: '2025-01-15', end_date: '2026-01-15', amount: 2500000, status: 'Active', created_at: '2025-01-15' },
  { id: '2', member_id: '1', membership_type: 'Platinum', start_date: '2024-01-15', end_date: '2025-01-15', amount: 2500000, status: 'Expired', created_at: '2024-01-15' },
  { id: '3', member_id: '1', membership_type: 'Gold', start_date: '2023-07-01', end_date: '2024-01-01', amount: 1500000, status: 'Expired', created_at: '2023-07-01' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Expired: 'destructive',
  Pending: 'secondary',
};

const paymentStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Paid: 'default',
  Pending: 'secondary',
  Failed: 'destructive',
};

export default function MemberDashboardPage() {
  const { user } = useAuthContext();
  const { data: memberData, isLoading: memberLoading, isError: memberError, refetch: refetchMember } = useMemberByProfile(user?.id ?? '');
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions();
  const extendMutation = useExtendMembership();
  const { toast } = useToast();

  const [extendOpen, setExtendOpen] = useState(false);
  const [extendMonths, setExtendMonths] = useState('3');
  const [extendMethod, setExtendMethod] = useState<PaymentMethod>('Transfer Bank');
  const [extending, setExtending] = useState(false);

  const member = memberData ?? dummyMember;
  const payments = transactionsData ?? dummyPayments;
  const history = dummyHistory;

  const daysRemaining = getDaysRemaining(member.end_date);
  const progressPct = Math.min(
    100,
    Math.max(0, ((Date.now() - new Date(member.start_date).getTime()) /
      (new Date(member.end_date).getTime() - new Date(member.start_date).getTime())) * 100)
  );

  const extendPrice = getMemberPrice(member.membership_type);
  const totalExtendPrice = extendPrice * (parseInt(extendMonths) / (member.membership_type === 'Platinum' ? 12 : member.membership_type === 'Gold' ? 6 : 3));

  const handleExtend = async () => {
    if (!member || !user) return;
    setExtending(true);
    try {
      await extendMutation.mutateAsync({ id: member.id, months: parseInt(extendMonths) });
      toast({ title: 'Berhasil', description: 'Membership berhasil diperpanjang' });
      setExtendOpen(false);
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan saat memperpanjang membership', variant: 'destructive' });
    } finally {
      setExtending(false);
    }
  };

  if (memberLoading || transactionsLoading) {
    return <LoadingScreen />;
  }

  if (memberError) {
    return <ErrorState onRetry={() => refetchMember()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat Datang, {user?.full_name ?? 'Member'} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Member sejak {formatDate(member.created_at)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Status Membership</CardTitle>
              <CardDescription>
                {member.status === 'Active' ? 'Membership aktif' : member.status === 'Expired' ? 'Membership telah berakhir' : 'Menunggu aktivasi'}
              </CardDescription>
            </div>
            <Badge variant={statusVariant[member.status] ?? 'outline'} className="text-xs">
              {member.status === 'Active' ? 'Aktif' : member.status === 'Expired' ? 'Kadaluarsa' : 'Pending'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline" className="text-xs">
                {member.membership_type}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatShortDate(member.start_date)} - {formatShortDate(member.end_date)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Berakhir'}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${member.status === 'Active' ? progressPct : 100}%` }}
              />
            </div>
            <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <CreditCard className="h-4 w-4" />
                  Perpanjang Membership
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Perpanjang Membership</DialogTitle>
                  <DialogDescription>
                    Pilih durasi dan metode pembayaran untuk memperpanjang membership {member.membership_type} Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Durasi Perpanjangan</Label>
                    <Select value={extendMonths} onValueChange={setExtendMonths}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Bulan</SelectItem>
                        <SelectItem value="6">6 Bulan</SelectItem>
                        <SelectItem value="12">12 Bulan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Metode Pembayaran</Label>
                    <Select value={extendMethod} onValueChange={(v) => setExtendMethod(v as PaymentMethod)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                        <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                        <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                        <SelectItem value="Tunai">Tunai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Harga per periode</span>
                    <span className="font-medium">{formatCurrency(extendPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Durasi</span>
                    <span className="font-medium">{extendMonths} Bulan</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(totalExtendPrice)}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setExtendOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleExtend} disabled={extending}>
                    {extending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Konfirmasi Pembayaran
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">QR Code</CardTitle>
              <CardDescription>Tunjukkan ke resepsionis</CardDescription>
            </div>
            <QrCode className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="rounded-lg border bg-white p-3">
              <QRCodeSVG
                value={`FITFLOW-MEMBER-${member.id}`}
                size={140}
                level="M"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Tunjukkan QR code ini saat check-in di gym
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Profil Saya</CardTitle>
              <CardDescription>Informasi akun</CardDescription>
            </div>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <UserAvatar
              name={user?.full_name ?? 'Member'}
              imageUrl={user?.avatar_url}
              className="h-20 w-20"
            />
            <div className="text-center">
              <p className="font-semibold">{user?.full_name ?? 'Member'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{member.profile?.phone ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Riwayat Pembayaran</CardTitle>
              <CardDescription>Transaksi terbaru Anda</CardDescription>
            </div>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Belum ada transaksi
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 5).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs whitespace-nowrap">{formatShortDate(p.created_at)}</TableCell>
                      <TableCell className="text-xs">{p.description}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant[p.payment_status] ?? 'outline'} className="text-xs">
                          {p.payment_status === 'Paid' ? 'Lunas' : p.payment_status === 'Pending' ? 'Pending' : 'Gagal'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Riwayat Membership</CardTitle>
            <CardDescription>Riwayat langganan membership Anda</CardDescription>
          </div>
          <History className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat</p>
          ) : (
            <div className="relative pl-6 space-y-0">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
              {history.map((h, idx) => (
                <div key={h.id} className="relative pb-6 last:pb-0">
                  <div className="absolute -left-4 mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="ml-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{h.membership_type}</span>
                      <Badge variant={statusVariant[h.status] ?? 'outline'} className="text-[10px] px-1.5 py-0">
                        {h.status === 'Active' ? 'Aktif' : h.status === 'Expired' ? 'Kadaluarsa' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(h.start_date)} - {formatShortDate(h.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(h.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
