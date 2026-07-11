'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Activity,
  Clock,
  Wallet,
  TrendingUp,
  Plus,
  ArrowRight,
  Circle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuthContext } from '@/providers/auth-provider';
import { useMembers } from '@/hooks/use-members';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { ErrorState } from '@/components/shared/error-state';
import type { Member, Transaction, Activity as ActivityType } from '@/types';

const dummyMembers: Member[] = [
  { id: '1', profile_id: '1', membership_type: 'Platinum', start_date: '2025-01-15', end_date: '2026-01-15', status: 'Active', created_at: '2024-06-01', profile: { id: '1', full_name: 'Andi Pratama', email: 'andi@email.com', phone: '081234567890', role: 'member', avatar_url: null, created_at: '2024-06-01' } },
  { id: '2', profile_id: '2', membership_type: 'Gold', start_date: '2025-03-01', end_date: '2025-12-01', status: 'Active', created_at: '2024-06-02', profile: { id: '2', full_name: 'Siti Rahmawati', email: 'siti@email.com', phone: '081234567891', role: 'member', avatar_url: null, created_at: '2024-06-02' } },
  { id: '3', profile_id: '3', membership_type: 'Silver', start_date: '2025-05-10', end_date: '2025-08-10', status: 'Active', created_at: '2024-06-03', profile: { id: '3', full_name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567892', role: 'member', avatar_url: null, created_at: '2024-06-03' } },
  { id: '4', profile_id: '4', membership_type: 'Platinum', start_date: '2024-01-01', end_date: '2025-01-01', status: 'Expired', created_at: '2024-01-01', profile: { id: '4', full_name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', role: 'member', avatar_url: null, created_at: '2024-01-01' } },
  { id: '5', profile_id: '5', membership_type: 'Gold', start_date: '2025-06-15', end_date: '2026-06-15', status: 'Active', created_at: '2025-06-15', profile: { id: '5', full_name: 'Rudi Hermawan', email: 'rudi@email.com', phone: '081234567894', role: 'member', avatar_url: null, created_at: '2025-06-15' } },
  { id: '6', profile_id: '6', membership_type: 'Silver', start_date: '2025-07-01', end_date: '2025-08-01', status: 'Active', created_at: '2025-07-01', profile: { id: '6', full_name: 'Maya Anggraini', email: 'maya@email.com', phone: '081234567895', role: 'member', avatar_url: null, created_at: '2025-07-01' } },
  { id: '7', profile_id: '7', membership_type: 'Platinum', start_date: '2025-02-20', end_date: '2026-02-20', status: 'Active', created_at: '2025-02-20', profile: { id: '7', full_name: 'Agus Wijaya', email: 'agus@email.com', phone: '081234567896', role: 'member', avatar_url: null, created_at: '2025-02-20' } },
  { id: '8', profile_id: '8', membership_type: 'Gold', start_date: '2024-08-01', end_date: '2025-02-01', status: 'Expired', created_at: '2024-08-01', profile: { id: '8', full_name: 'Rina Amelia', email: 'rina@email.com', phone: '081234567897', role: 'member', avatar_url: null, created_at: '2024-08-01' } },
  { id: '9', profile_id: '9', membership_type: 'Silver', start_date: '2025-06-01', end_date: '2025-09-01', status: 'Active', created_at: '2025-06-01', profile: { id: '9', full_name: 'Dimas Prayoga', email: 'dimas@email.com', phone: '081234567898', role: 'member', avatar_url: null, created_at: '2025-06-01' } },
  { id: '10', profile_id: '10', membership_type: 'Gold', start_date: '2025-07-10', end_date: '2025-08-10', status: 'Pending', created_at: '2025-07-10', profile: { id: '10', full_name: 'Fitri Handayani', email: 'fitri@email.com', phone: '081234567899', role: 'member', avatar_url: null, created_at: '2025-07-10' } },
  { id: '11', profile_id: '11', membership_type: 'Platinum', start_date: '2025-04-01', end_date: '2026-04-01', status: 'Active', created_at: '2025-04-01', profile: { id: '11', full_name: 'Hendra Gunawan', email: 'hendra@email.com', phone: '081234567800', role: 'member', avatar_url: null, created_at: '2025-04-01' } },
  { id: '12', profile_id: '12', membership_type: 'Silver', start_date: '2025-07-01', end_date: '2025-10-01', status: 'Active', created_at: '2025-07-01', profile: { id: '12', full_name: 'Nina Permata', email: 'nina@email.com', phone: '081234567801', role: 'member', avatar_url: null, created_at: '2025-07-01' } },
];

const dummyTransactions: Transaction[] = [
  { id: '1', member_id: '1', invoice_number: 'INV-2025-06-001', amount: 2500000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Membership', description: 'Perpanjangan Platinum 12 bulan', created_at: '2025-06-28T10:30:00', member: { id: '1', profile_id: '1', membership_type: 'Platinum', start_date: '2025-01-15', end_date: '2026-01-15', status: 'Active', created_at: '2024-06-01', profile: { id: '1', full_name: 'Andi Pratama', email: 'andi@email.com', phone: '081234567890', role: 'member', avatar_url: null, created_at: '2024-06-01' } } },
  { id: '2', member_id: '2', invoice_number: 'INV-2025-06-002', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Paid', type: 'Membership', description: 'Perpanjangan Gold 6 bulan', created_at: '2025-06-27T14:15:00', member: { id: '2', profile_id: '2', membership_type: 'Gold', start_date: '2025-03-01', end_date: '2025-12-01', status: 'Active', created_at: '2024-06-02', profile: { id: '2', full_name: 'Siti Rahmawati', email: 'siti@email.com', phone: '081234567891', role: 'member', avatar_url: null, created_at: '2024-06-02' } } },
  { id: '3', member_id: '5', invoice_number: 'INV-2025-06-003', amount: 1500000, payment_method: 'E-Wallet', payment_status: 'Paid', type: 'Membership', description: 'Membership Gold baru', created_at: '2025-06-26T09:00:00', member: { id: '5', profile_id: '5', membership_type: 'Gold', start_date: '2025-06-15', end_date: '2026-06-15', status: 'Active', created_at: '2025-06-15', profile: { id: '5', full_name: 'Rudi Hermawan', email: 'rudi@email.com', phone: '081234567894', role: 'member', avatar_url: null, created_at: '2025-06-15' } } },
  { id: '4', member_id: '7', invoice_number: 'INV-2025-06-004', amount: 2500000, payment_method: 'Transfer Bank', payment_status: 'Pending', type: 'Membership', description: 'Perpanjangan Platinum', created_at: '2025-06-25T16:45:00', member: { id: '7', profile_id: '7', membership_type: 'Platinum', start_date: '2025-02-20', end_date: '2026-02-20', status: 'Active', created_at: '2025-02-20', profile: { id: '7', full_name: 'Agus Wijaya', email: 'agus@email.com', phone: '081234567896', role: 'member', avatar_url: null, created_at: '2025-02-20' } } },
  { id: '5', member_id: '3', invoice_number: 'INV-2025-06-005', amount: 350000, payment_method: 'Tunai', payment_status: 'Paid', type: 'Personal Training', description: 'Sesi personal training 5x', created_at: '2025-06-24T11:20:00', member: { id: '3', profile_id: '3', membership_type: 'Silver', start_date: '2025-05-10', end_date: '2025-08-10', status: 'Active', created_at: '2024-06-03', profile: { id: '3', full_name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567892', role: 'member', avatar_url: null, created_at: '2024-06-03' } } },
  { id: '6', member_id: '11', invoice_number: 'INV-2025-06-006', amount: 2500000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Membership', description: 'Perpanjangan Platinum 12 bulan', created_at: '2025-06-23T08:00:00', member: { id: '11', profile_id: '11', membership_type: 'Platinum', start_date: '2025-04-01', end_date: '2026-04-01', status: 'Active', created_at: '2025-04-01', profile: { id: '11', full_name: 'Hendra Gunawan', email: 'hendra@email.com', phone: '081234567800', role: 'member', avatar_url: null, created_at: '2025-04-01' } } },
  { id: '7', member_id: '9', invoice_number: 'INV-2025-06-007', amount: 900000, payment_method: 'E-Wallet', payment_status: 'Failed', type: 'Membership', description: 'Perpanjangan Silver 3 bulan', created_at: '2025-06-22T13:30:00', member: { id: '9', profile_id: '9', membership_type: 'Silver', start_date: '2025-06-01', end_date: '2025-09-01', status: 'Active', created_at: '2025-06-01', profile: { id: '9', full_name: 'Dimas Prayoga', email: 'dimas@email.com', phone: '081234567898', role: 'member', avatar_url: null, created_at: '2025-06-01' } } },
  { id: '8', member_id: '1', invoice_number: 'INV-2025-06-008', amount: 750000, payment_method: 'Kartu Kredit', payment_status: 'Paid', type: 'Merchandise', description: 'Pembelian jersey gym', created_at: '2025-06-21T15:10:00', member: { id: '1', profile_id: '1', membership_type: 'Platinum', start_date: '2025-01-15', end_date: '2026-01-15', status: 'Active', created_at: '2024-06-01', profile: { id: '1', full_name: 'Andi Pratama', email: 'andi@email.com', phone: '081234567890', role: 'member', avatar_url: null, created_at: '2024-06-01' } } },
  { id: '9', member_id: '12', invoice_number: 'INV-2025-06-009', amount: 900000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Membership', description: 'Membership Silver baru', created_at: '2025-06-20T10:00:00', member: { id: '12', profile_id: '12', membership_type: 'Silver', start_date: '2025-07-01', end_date: '2025-10-01', status: 'Active', created_at: '2025-07-01', profile: { id: '12', full_name: 'Nina Permata', email: 'nina@email.com', phone: '081234567801', role: 'member', avatar_url: null, created_at: '2025-07-01' } } },
  { id: '10', member_id: '6', invoice_number: 'INV-2025-06-010', amount: 350000, payment_method: 'Tunai', payment_status: 'Pending', type: 'Personal Training', description: 'Sesi personal training', created_at: '2025-06-19T09:30:00', member: { id: '6', profile_id: '6', membership_type: 'Silver', start_date: '2025-07-01', end_date: '2025-08-01', status: 'Active', created_at: '2025-07-01', profile: { id: '6', full_name: 'Maya Anggraini', email: 'maya@email.com', phone: '081234567895', role: 'member', avatar_url: null, created_at: '2025-07-01' } } },
  { id: '11', member_id: '5', invoice_number: 'INV-2025-06-011', amount: 500000, payment_method: 'E-Wallet', payment_status: 'Paid', type: 'Merchandise', description: 'Pembelian suplemen protein', created_at: '2025-06-18T14:00:00', member: { id: '5', profile_id: '5', membership_type: 'Gold', start_date: '2025-06-15', end_date: '2026-06-15', status: 'Active', created_at: '2025-06-15', profile: { id: '5', full_name: 'Rudi Hermawan', email: 'rudi@email.com', phone: '081234567894', role: 'member', avatar_url: null, created_at: '2025-06-15' } } },
  { id: '12', member_id: '2', invoice_number: 'INV-2025-06-012', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Paid', type: 'Membership', description: 'Perpanjangan Gold 6 bulan', created_at: '2025-06-17T11:45:00', member: { id: '2', profile_id: '2', membership_type: 'Gold', start_date: '2025-03-01', end_date: '2025-12-01', status: 'Active', created_at: '2024-06-02', profile: { id: '2', full_name: 'Siti Rahmawati', email: 'siti@email.com', phone: '081234567891', role: 'member', avatar_url: null, created_at: '2024-06-02' } } },
  { id: '13', member_id: '7', invoice_number: 'INV-2025-06-013', amount: 2500000, payment_method: 'Transfer Bank', payment_status: 'Paid', type: 'Membership', description: 'Perpanjangan Platinum 12 bulan', created_at: '2025-06-16T08:30:00', member: { id: '7', profile_id: '7', membership_type: 'Platinum', start_date: '2025-02-20', end_date: '2026-02-20', status: 'Active', created_at: '2025-02-20', profile: { id: '7', full_name: 'Agus Wijaya', email: 'agus@email.com', phone: '081234567896', role: 'member', avatar_url: null, created_at: '2025-02-20' } } },
  { id: '14', member_id: '10', invoice_number: 'INV-2025-06-014', amount: 900000, payment_method: 'E-Wallet', payment_status: 'Pending', type: 'Membership', description: 'Membership Silver baru', created_at: '2025-06-15T16:00:00', member: { id: '10', profile_id: '10', membership_type: 'Gold', start_date: '2025-07-10', end_date: '2025-08-10', status: 'Pending', created_at: '2025-07-10', profile: { id: '10', full_name: 'Fitri Handayani', email: 'fitri@email.com', phone: '081234567899', role: 'member', avatar_url: null, created_at: '2025-07-10' } } },
  { id: '15', member_id: '4', invoice_number: 'INV-2025-06-015', amount: 1500000, payment_method: 'Kartu Kredit', payment_status: 'Paid', type: 'Membership', description: 'Perpanjangan Gold 6 bulan', created_at: '2025-06-14T10:15:00', member: { id: '4', profile_id: '4', membership_type: 'Platinum', start_date: '2024-01-01', end_date: '2025-01-01', status: 'Expired', created_at: '2024-01-01', profile: { id: '4', full_name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', role: 'member', avatar_url: null, created_at: '2024-01-01' } } },
  { id: '16', member_id: '8', invoice_number: 'INV-2025-06-016', amount: 350000, payment_method: 'Tunai', payment_status: 'Failed', type: 'Personal Training', description: 'Sesi personal training 3x', created_at: '2025-06-13T07:45:00', member: { id: '8', profile_id: '8', membership_type: 'Gold', start_date: '2024-08-01', end_date: '2025-02-01', status: 'Expired', created_at: '2024-08-01', profile: { id: '8', full_name: 'Rina Amelia', email: 'rina@email.com', phone: '081234567897', role: 'member', avatar_url: null, created_at: '2024-08-01' } } },
];

const dummyActivities: ActivityType[] = [
  { id: '1', text: 'Andi Pratama melakukan pembayaran membership Platinum', time: '2025-06-28T10:30:00', type: 'payment' },
  { id: '2', text: 'Siti Rahmawati memperpanjang membership Gold', time: '2025-06-27T14:15:00', type: 'payment' },
  { id: '3', text: 'Member baru: Rudi Hermawan bergabung', time: '2025-06-26T09:00:00', type: 'member' },
  { id: '4', text: 'Sistem melakukan backup data harian', time: '2025-06-26T02:00:00', type: 'system' },
  { id: '5', text: 'Agus Wijaya meng-upgrade ke Platinum', time: '2025-06-25T16:45:00', type: 'member' },
  { id: '6', text: 'Budi Santoso membeli sesi personal training', time: '2025-06-24T11:20:00', type: 'payment' },
  { id: '7', text: 'Pembayaran Dimas Prayoga gagal - saldo tidak cukup', time: '2025-06-22T13:30:00', type: 'system' },
  { id: '8', text: 'Nina Permata mendaftar membership Silver', time: '2025-06-20T10:00:00', type: 'member' },
];

function generateRevenueData() {
  const data: { date: string; revenue: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const revenue = Math.floor(Math.random() * 3000000) + 500000;
    data.push({ date: dateStr, revenue });
  }
  return data;
}

const dummyRevenueData = generateRevenueData();

function getPaymentStatusBadge(status: string) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    Paid: { variant: 'default', label: 'Lunas' },
    Pending: { variant: 'secondary', label: 'Menunggu' },
    Failed: { variant: 'destructive', label: 'Gagal' },
  };
  return map[status] || { variant: 'outline' as const, label: status };
}

function getActivityDotColor(type: ActivityType['type']) {
  switch (type) {
    case 'payment': return 'bg-emerald-500';
    case 'member': return 'bg-blue-500';
    case 'system': return 'bg-orange-500';
  }
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const {
    data: queryMembers,
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useMembers();
  const {
    data: queryTransactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions();

  const members = queryMembers && queryMembers.length > 0 ? queryMembers : dummyMembers;
  const transactions = queryTransactions && queryTransactions.length > 0 ? queryTransactions : dummyTransactions;

  const isLoading = membersLoading || transactionsLoading;
  const error = membersError || transactionsError;

  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'Active').length;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringMembers = members.filter((m) => {
      if (m.status !== 'Active') return false;
      const end = new Date(m.end_date);
      return end <= thirtyDaysFromNow && end >= new Date();
    }).length;
    const todayRevenue = 4750000;
    const monthlyRevenue = 18950000;
    return { totalMembers, activeMembers, expiringMembers, todayRevenue, monthlyRevenue };
  }, [members]);

  if (isLoading) return <LoadingScreen message="Memuat dashboard..." />;

  if (error) {
    return (
      <ErrorState
        message="Gagal memuat data dashboard. Silakan coba lagi."
        onRetry={() => { refetchMembers(); refetchTransactions(); }}
      />
    );
  }

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Selamat Datang, {user?.full_name || 'Admin'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Berikut ringkasan gym Anda hari ini
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/members/add')}>
            <Plus className="h-4 w-4" />
            Tambah Member
          </Button>
          <Button variant="outline" onClick={() => router.push('/transactions/add')}>
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label="Total Member"
          value={stats.totalMembers.toString()}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Activity}
          label="Member Aktif"
          value={stats.activeMembers.toString()}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="Akan Habis"
          value={stats.expiringMembers.toString()}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={Wallet}
          label="Pendapatan Hari Ini"
          value={formatCurrency(stats.todayRevenue)}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Pendapatan Bulan Ini"
          value={formatCurrency(stats.monthlyRevenue)}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Pendapatan</CardTitle>
            <CardDescription>Pendapatan harian selama 30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: number) => `Rp${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Pendapatan']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Notifikasi dan aktivitas terkini</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {dummyActivities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 px-6 py-3">
                  <Circle
                    className={`mt-0.5 h-2.5 w-2.5 shrink-0 fill-current ${getActivityDotColor(activity.type)} text-transparent`}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => {
                const badge = getPaymentStatusBadge(tx.payment_status);
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="text-primary hover:underline"
                      >
                        {tx.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>{tx.member?.profile?.full_name || '-'}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tx.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end border-t px-6 py-3">
          <Button variant="link" asChild>
            <Link href="/transactions" className="flex items-center gap-1">
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
