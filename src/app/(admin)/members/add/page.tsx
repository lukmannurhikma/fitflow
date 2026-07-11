'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useCreateMember } from '@/hooks/use-members';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, getMemberPrice, calcEndDate } from '@/lib/utils';
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

const memberSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  phone: z.string().min(1, 'No. telepon wajib diisi'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  address: z.string().optional(),
  membership_type: z.string().min(1, 'Tipe membership wajib dipilih'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function AddMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMember = useCreateMember();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      gender: '',
      birth_date: '',
      address: '',
      membership_type: '',
      start_date: '',
      emergency_name: '',
      emergency_phone: '',
      notes: '',
    },
  });

  const watchType = form.watch('membership_type');
  const watchStart = form.watch('start_date');
  const price = watchType ? getMemberPrice(watchType) : 0;
  const endDate = watchType && watchStart ? calcEndDate(watchStart, watchType) : '';

  const onSubmit = async (data: MemberFormValues) => {
    try {
      await createMember.mutateAsync(data);
      toast({ title: 'Berhasil', description: 'Member baru berhasil ditambahkan' });
      router.push('/members');
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menambahkan member', variant: 'destructive' });
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
              <Link href="/members">Daftar Member</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tambah Member</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Member Baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lengkapi data member untuk mendaftarkan membership baru</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" {...form.register('full_name')} />
              {form.formState.errors.full_name && (
                <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input id="phone" {...form.register('phone')} />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <Select
                value={form.watch('gender')}
                onValueChange={(v) => form.setValue('gender', v, { shouldValidate: true })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-xs text-destructive">{form.formState.errors.gender.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Tanggal Lahir</Label>
              <Input id="birth_date" type="date" {...form.register('birth_date')} />
              {form.formState.errors.birth_date && (
                <p className="text-xs text-destructive">{form.formState.errors.birth_date.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <textarea
                id="address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register('address')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Membership</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="membership_type">Tipe Membership</Label>
              <Select
                value={form.watch('membership_type')}
                onValueChange={(v) => form.setValue('membership_type', v, { shouldValidate: true })}
              >
                <SelectTrigger id="membership_type">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Platinum">Platinum - {formatCurrency(2500000)}/tahun</SelectItem>
                  <SelectItem value="Gold">Gold - {formatCurrency(1500000)}/6 bulan</SelectItem>
                  <SelectItem value="Silver">Silver - {formatCurrency(900000)}/3 bulan</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.membership_type && (
                <p className="text-xs text-destructive">{form.formState.errors.membership_type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input id="start_date" type="date" {...form.register('start_date')} />
              {form.formState.errors.start_date && (
                <p className="text-xs text-destructive">{form.formState.errors.start_date.message}</p>
              )}
            </div>
            {price > 0 && (
              <div className="rounded-md bg-muted p-3 sm:col-span-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Harga Membership</span>
                  <span className="font-semibold text-foreground">{formatCurrency(price)}</span>
                </div>
                {endDate && (
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tanggal Berakhir</span>
                    <span className="font-medium text-foreground">{endDate}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontak Darurat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Nama Kontak</Label>
              <Input id="emergency_name" {...form.register('emergency_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">No. Telepon Darurat</Label>
              <Input id="emergency_phone" {...form.register('emergency_phone')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <textarea
                id="notes"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Catatan tambahan tentang member..."
                {...form.register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push('/members')}>
            <ArrowLeft className="h-4 w-4" />
            Batal
          </Button>
          <Button type="submit" disabled={createMember.isPending}>
            {createMember.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {createMember.isPending ? 'Menyimpan...' : 'Simpan Member'}
          </Button>
        </div>
      </form>
    </div>
  );
}
