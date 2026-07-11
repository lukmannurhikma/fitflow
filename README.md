# FitFlow - Gym Management Dashboard

Next.js 16 + Supabase + TypeScript + Tailwind CSS + shadcn/ui

---

## Panduan Lengkap: Dari 0 Sampai Deploy ke Vercel

### Step 1 — Setup Supabase Database

1. Buka [https://supabase.com](https://supabase.com) → **New project**
   - Name: `fitflow-gym`
   - Password: buat dan simpan
   - Region: pilih yang terdekat
   - Tunggu ~2 menit

2. Buka **SQL Editor** → paste SQL di bawah → **Run**

<details>
<summary>📋 Klik untuk lihat SQL</summary>

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABEL PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABEL MEMBERS
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE RESTRICT,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('Platinum', 'Gold', 'Silver')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Expired', 'Pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABEL TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Transfer Bank', 'Kartu Kredit', 'E-Wallet', 'Tunai')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Pending', 'Failed')),
  type TEXT NOT NULL CHECK (type IN ('Membership', 'Personal Training', 'Merchandise')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABEL MEMBERSHIP HISTORY
CREATE TABLE membership_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('Platinum', 'Gold', 'Silver')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Expired', 'Pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABEL PAYMENT HISTORY
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Transfer Bank', 'Kartu Kredit', 'E-Wallet', 'Tunai')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Pending', 'Failed')),
  description TEXT,
  paid_at TIMESTAMPTZ NOT NULL
);

-- TRIGGER: auto-create profile saat signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'member'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- RLS: MEMBERS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_select" ON members FOR SELECT USING (
  profile_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "members_update" ON members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "members_delete" ON members FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- RLS: TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- RLS: MEMBERSHIP HISTORY
ALTER TABLE membership_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "membership_history_select" ON membership_history FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "membership_history_delete" ON membership_history FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- RLS: PAYMENT HISTORY
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_history_select" ON payment_history FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- INDEX
CREATE INDEX idx_members_profile_id ON members(profile_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_membership_history_member_id ON membership_history(member_id);
CREATE INDEX idx_payment_history_member_id ON payment_history(member_id);
CREATE INDEX idx_payment_history_transaction_id ON payment_history(transaction_id);
```
</details>

3. Buka **Authentication** → **Providers** → **Email** → pastikan **Enabled** ON

4. Buka **Authentication** → **Settings**:
   - **Site URL**: isi nanti setelah deploy (`https://fitflow.vercel.app`)
   - **Redirect URLs**: tambah `https://fitflow.vercel.app/**`

---

### Step 2 — Buat User di Supabase Auth

Buka **Authentication** → **Users** → **Add User**:

| User | Email | Password |
|---|---|---|
| Admin | `admin@fitflow.com` | `admin123456` |
| Owner | `owner@fitflow.com` | `owner123456` |
| Member 1 | `andi@fitflow.com` | `member123` |
| Member 2 | `dewi@fitflow.com` | `member123` |
| Member 3 | `chandra@fitflow.com` | `member123` |

Setelah semua dibuat, jalankan SQL ini untuk set role yang benar:

```sql
UPDATE profiles SET role = 'admin', full_name = 'Admin FitFlow' WHERE email = 'admin@fitflow.com';
UPDATE profiles SET role = 'owner', full_name = 'Owner FitFlow' WHERE email = 'owner@fitflow.com';
```

---

### Step 3 — Tambah Data Member Dummy

Jalankan SQL ini untuk membuat data member dan transaksi:

```sql
-- Ambil profile_id dari masing-masing user
DO $$
DECLARE
  andi_id UUID;
  dewi_id UUID;
  chandra_id UUID;
BEGIN
  SELECT id INTO andi_id FROM profiles WHERE email = 'andi@fitflow.com';
  SELECT id INTO dewi_id FROM profiles WHERE email = 'dewi@fitflow.com';
  SELECT id INTO chandra_id FROM profiles WHERE email = 'chandra@fitflow.com';

  -- Member Andi (Platinum)
  INSERT INTO members (profile_id, membership_type, start_date, end_date, status)
  VALUES (andi_id, 'Platinum', '2025-01-15', '2026-01-15', 'Active');

  -- Member Dewi (Gold)
  INSERT INTO members (profile_id, membership_type, start_date, end_date, status)
  VALUES (dewi_id, 'Gold', '2025-03-01', '2025-09-01', 'Active');

  -- Member Chandra (Silver)
  INSERT INTO members (profile_id, membership_type, start_date, end_date, status)
  VALUES (chandra_id, 'Silver', '2025-05-10', '2025-08-10', 'Active');

  -- Transaksi Andi
  INSERT INTO transactions (member_id, invoice_number, amount, payment_method, payment_status, type, description, created_at)
  VALUES (
    (SELECT id FROM members WHERE profile_id = andi_id),
    'INV-2025-06-001', 2500000, 'Transfer Bank', 'Paid', 'Membership',
    'Perpanjangan Platinum 12 bulan', '2025-06-28 10:30:00+07'
  );

  -- Transaksi Dewi
  INSERT INTO transactions (member_id, invoice_number, amount, payment_method, payment_status, type, description, created_at)
  VALUES (
    (SELECT id FROM members WHERE profile_id = dewi_id),
    'INV-2025-06-002', 1500000, 'Kartu Kredit', 'Paid', 'Membership',
    'Perpanjangan Gold 6 bulan', '2025-06-27 14:20:00+07'
  );

  -- Transaksi Chandra
  INSERT INTO transactions (member_id, invoice_number, amount, payment_method, payment_status, type, description, created_at)
  VALUES (
    (SELECT id FROM members WHERE profile_id = chandra_id),
    'INV-2025-06-003', 900000, 'E-Wallet', 'Paid', 'Membership',
    'Perpanjangan Silver 3 bulan', '2025-06-25 09:15:00+07'
  );
END $$;
```

---

### Step 4 — Push ke GitHub

```bash
cd "C:\Users\ADMINI~1\AppData\Local\Temp\opencode\gym-dashboard-next"
git init
git add .
git commit -m "init: FitFlow Gym Management Dashboard"

# Buat repo di github.com, lalu:
git remote add origin https://github.com/username/fitflow.git
git push -u origin main
```

> ⚠️ File `.env.local` sudah otomatis di-ignore oleh `.gitignore`, jadi credentials tidak ikut terpush.

---

### Step 5 — Deploy ke Vercel

1. Buka [https://vercel.com](https://vercel.com) → login dengan GitHub
2. **Add New** → **Project**
3. Import repo `fitflow`
4. Di halaman **Configure Project**, tambah **Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hvoclffhrfaylxbwbbkv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2b2NsZmZocmZheWx4YndiYmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MzYyODYsImV4cCI6MjA5OTMxMjI4Nn0.QAwApUIUCPzxkr4Vi5jrNNC6-gGA7RL44e-8Siyj-fo` |

5. **Build Command**: ganti ke `npm run build:vercel` (biar pake Turbopack yang lebih cepat di Linux)
6. Klik **Deploy**

Tunggu ~2-3 menit sampai selesai.

---

### Step 6 — Update Supabase Site URL

Setelah dapat URL dari Vercel (misal `https://fitflow.vercel.app`):

1. Buka Supabase Dashboard → **Authentication** → **Settings**
2. **Site URL**: isi `https://fitflow.vercel.app`
3. **Redirect URLs**: tambah `https://fitflow.vercel.app/**`

---

### Step 7 — Testing

Buka URL Vercel. Coba login:

| Halaman | Email | Password |
|---|---|---|
| **Admin Dashboard** → `/dashboard` | `admin@fitflow.com` | `admin123456` |
| **Member Dashboard** → `/member/dashboard` | `andi@fitflow.com` | `member123` |

#### Yang bisa dicek di Admin:
- ✅ Statistik dashboard (total member, pendapatan, grafik)
- ✅ Daftar member → filter, search, pagination
- ✅ Tambah member baru
- ✅ Detail member → lihat profile, riwayat membership, perpanjang
- ✅ Daftar transaksi → filter, search
- ✅ Tambah transaksi baru

#### Yang bisa dicek di Member:
- ✅ Status membership + QR code
- ✅ Riwayat pembayaran
- ✅ Riwayat membership
- ✅ Perpanjang membership

---

### Troubleshooting

| Masalah | Solusi |
|---|---|
| Login gagal "Invalid login credentials" | User belum dibuat di Auth dashboard, atau password salah |
| Login gagal "Profile not found" | Trigger `handle_new_user` belum jalan. Jalankan SQL: `INSERT INTO profiles (id, full_name, email, role) SELECT id, email, email, 'member' FROM auth.users WHERE id NOT IN (SELECT id FROM profiles) ON CONFLICT DO NOTHING;` |
| Data kosong di dashboard | Belum ada data member/transaksi. Jalankan SQL seed di Step 3 |
| 403 Forbidden | RLS policies belum aktif. Jalankan ulang migration SQL |
| Halaman tidak ditemukan (404) | Sudah deploy ulang setelah push? Jalankan `git push` lalu redeploy di Vercel |
