'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, CreditCard, Wallet, Banknote, ExternalLink } from 'lucide-react';
import { useTransaction } from '@/hooks/use-transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const paymentStatusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  Paid: { variant: 'default', label: 'Berhasil' },
  Pending: { variant: 'secondary', label: 'Pending' },
  Failed: { variant: 'destructive', label: 'Gagal' },
};

const methodIcon: Record<string, React.ReactNode> = {
  'Transfer Bank': <Building2 className="h-5 w-5" />,
  'Kartu Kredit': <CreditCard className="h-5 w-5" />,
  'E-Wallet': <Wallet className="h-5 w-5" />,
  Tunai: <Banknote className="h-5 w-5" />,
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: transaction, isLoading, error, refetch } = useTransaction(id);

  if (isLoading) return <LoadingScreen message="Memuat detail transaksi..." />;

  if (error) return <ErrorState message="Gagal memuat data transaksi" onRetry={refetch} />;

  if (!transaction) {
    router.push('/transactions');
    return null;
  }

  const psb = paymentStatusBadge[transaction.payment_status] || { variant: 'outline' as const, label: transaction.payment_status };
  const memberName = transaction.member?.profile?.full_name || '-';
  const memberEmail = transaction.member?.profile?.email || '';

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
            <BreadcrumbPage>Detail Transaksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Detail Transaksi</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{transaction.invoice_number}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/transactions')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(transaction.amount)}</p>
              </div>
              <Badge variant={psb.variant} className="text-sm px-3 py-1">{psb.label}</Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Invoice</span>
                <span className="text-sm font-medium text-foreground font-mono">{transaction.invoice_number}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Tanggal</span>
                <span className="text-sm font-medium text-foreground">{formatDate(transaction.created_at)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Tipe</span>
                <Badge variant="outline">{transaction.type}</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Metode Pembayaran</span>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {methodIcon[transaction.payment_method]}
                  <span>{transaction.payment_method}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={psb.variant}>{psb.label}</Badge>
              </div>
              {transaction.description && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-muted-foreground shrink-0">Deskripsi</span>
                  <span className="text-sm font-medium text-foreground text-right">{transaction.description}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
              <UserAvatar name={memberName} className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{memberName}</p>
                <p className="text-sm text-muted-foreground truncate">{memberEmail || 'Email tidak tersedia'}</p>
              </div>
              {transaction.member && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/members/${transaction.member.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm text-muted-foreground">Nama</span>
                <span className="text-sm font-medium text-foreground">{memberName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground">{memberEmail || '-'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm text-muted-foreground">Telepon</span>
                <span className="text-sm text-foreground">{transaction.member?.profile?.phone || '-'}</span>
              </div>
              {transaction.member && (
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Membership</span>
                  <Badge variant="outline">{transaction.member.membership_type}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
