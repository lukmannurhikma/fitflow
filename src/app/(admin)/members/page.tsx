'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
import { useMembers, useDeleteMember } from '@/hooks/use-members';
import { useToast } from '@/hooks/use-toast';
import { formatShortDate } from '@/lib/utils';
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
import type { Member } from '@/types';

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
  { id: '13', profile_id: '13', membership_type: 'Gold', start_date: '2025-05-20', end_date: '2025-11-20', status: 'Active', created_at: '2025-05-20', profile: { id: '13', full_name: 'Arief Wicaksono', email: 'arief@email.com', phone: '081234567802', role: 'member', avatar_url: null, created_at: '2025-05-20' } },
  { id: '14', profile_id: '14', membership_type: 'Silver', start_date: '2024-11-01', end_date: '2025-02-01', status: 'Expired', created_at: '2024-11-01', profile: { id: '14', full_name: 'Ratna Kusuma', email: 'ratna@email.com', phone: '081234567803', role: 'member', avatar_url: null, created_at: '2024-11-01' } },
  { id: '15', profile_id: '15', membership_type: 'Platinum', start_date: '2025-07-01', end_date: '2026-07-01', status: 'Active', created_at: '2025-07-01', profile: { id: '15', full_name: 'Bayu Permadi', email: 'bayu@email.com', phone: '081234567804', role: 'member', avatar_url: null, created_at: '2025-07-01' } },
];

const PAGE_SIZE = 10;

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

export default function MembersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: queryMembers, isLoading, error, refetch } = useMembers();
  const deleteMember = useDeleteMember();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const members = queryMembers && queryMembers.length > 0 ? queryMembers : dummyMembers;

  const filtered = useMemo(() => {
    let result = members;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.profile?.full_name.toLowerCase().includes(q) ||
          m.profile?.email.toLowerCase().includes(q) ||
          m.profile?.phone?.includes(q)
      );
    }
    if (typeFilter !== 'all') result = result.filter((m) => m.membership_type === typeFilter);
    if (statusFilter !== 'all') result = result.filter((m) => m.status === statusFilter);
    return result;
  }, [members, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try {
      await deleteMember.mutateAsync(id);
      toast({ title: 'Berhasil', description: 'Member berhasil dihapus' });
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menghapus member', variant: 'destructive' });
    }
    setDeleteId(null);
  };

  if (error) return <ErrorState message="Gagal memuat data member" onRetry={refetch} />;

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
            <BreadcrumbPage>Daftar Member</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Member</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} total member</p>
        </div>
        <Button onClick={() => router.push('/members/add')}>
          <Plus className="h-4 w-4" />
          Tambah Member
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau telepon..."
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
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tidak ada member"
              description={search || typeFilter !== 'all' || statusFilter !== 'all' ? 'Tidak ada member yang sesuai dengan filter' : 'Belum ada member terdaftar'}
              action={
                <Button onClick={() => router.push('/members/add')}>
                  <Plus className="h-4 w-4" />
                  Tambah Member
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Berakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((member) => {
                  const sb = statusBadge[member.status] || { variant: 'outline' as const, label: member.status };
                  const tb = typeBadge[member.membership_type] || { variant: 'outline' as const, label: member.membership_type };
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={member.profile?.full_name || ''} className="h-9 w-9" />
                          <div>
                            <p className="font-medium text-foreground">{member.profile?.full_name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{member.profile?.email || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.profile?.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={tb.variant}>{tb.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sb.variant}>{sb.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatShortDate(member.start_date)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatShortDate(member.end_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/members/${member.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/members/edit/${member.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog
                            open={deleteId === member.id}
                            onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(member.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus {member.profile?.full_name}? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(member.id)}>
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
