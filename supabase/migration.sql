-- ============================================================
-- FitFlow - Gym Management Database Schema
-- Execute this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- 1. PROFILES (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MEMBERS (gym membership records)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE RESTRICT,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('Platinum', 'Gold', 'Silver')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Expired', 'Pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_profile_id ON members(profile_id);
CREATE INDEX idx_members_status ON members(status);

-- 3. TRANSACTIONS (financial transactions)
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

CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- 4. MEMBERSHIP HISTORY (audit trail for membership changes)
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

CREATE INDEX idx_membership_history_member_id ON membership_history(member_id);

-- 5. PAYMENT HISTORY (detailed payment records)
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

CREATE INDEX idx_payment_history_member_id ON payment_history(member_id);
CREATE INDEX idx_payment_history_transaction_id ON payment_history(transaction_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- AUTO-POPULATE MEMBERSHIP HISTORY ON MEMBER INSERT/UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_membership_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.membership_history (member_id, membership_type, start_date, end_date, amount, status)
  VALUES (
    NEW.id,
    NEW.membership_type,
    NEW.start_date,
    NEW.end_date,
    CASE
      WHEN NEW.membership_type = 'Platinum' THEN 2500000
      WHEN NEW.membership_type = 'Gold' THEN 1500000
      ELSE 900000
    END,
    NEW.status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_created ON members;
CREATE TRIGGER on_member_created
  AFTER INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_membership_change();

-- ============================================================
-- AUTO-POPULATE PAYMENT HISTORY ON PAID TRANSACTION INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_paid_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'Paid' THEN
    INSERT INTO public.payment_history (member_id, transaction_id, amount, payment_method, payment_status, description, paid_at)
    VALUES (
      NEW.member_id,
      NEW.id,
      NEW.amount,
      NEW.payment_method,
      NEW.payment_status,
      NEW.description,
      NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_paid ON transactions;
CREATE TRIGGER on_transaction_paid
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paid_transaction();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- MEMBERS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members
  FOR SELECT USING (
    profile_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "members_update" ON members;
CREATE POLICY "members_update" ON members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_delete" ON members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select" ON transactions;
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "transactions_insert" ON transactions;
CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "transactions_delete" ON transactions;
CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- MEMBERSHIP HISTORY
ALTER TABLE membership_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "membership_history_select" ON membership_history;
CREATE POLICY "membership_history_select" ON membership_history
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

DROP POLICY IF EXISTS "membership_history_delete" ON membership_history;
CREATE POLICY "membership_history_delete" ON membership_history
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- PAYMENT HISTORY
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_history_select" ON payment_history;
CREATE POLICY "payment_history_select" ON payment_history
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- ============================================================
-- SEED DATA
-- ============================================================

-- Create initial owner account (password: owner123456)
-- Note: Run this AFTER creating the user via Supabase Auth dashboard or signup API
-- Then update the profile role manually:
-- UPDATE profiles SET role = 'owner' WHERE email = 'owner@fitflow.com';

-- For convenience, create a function to set up demo data
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS void AS $$
DECLARE
  owner_id UUID;
  admin_id UUID;
  member_ids UUID[];
  m_id UUID;
BEGIN
  -- Get owner profile (must exist first via Auth)
  SELECT id INTO owner_id FROM profiles WHERE email = 'owner@fitflow.com' LIMIT 1;
  IF owner_id IS NULL THEN
    RAISE NOTICE 'Owner profile not found. Create user owner@fitflow.com first via Auth dashboard.';
    RETURN;
  END IF;

  -- Update owner role
  UPDATE profiles SET role = 'owner', full_name = 'Budi Pemilik' WHERE id = owner_id;

  -- Create admin user (must be created via Auth first)
  -- UPDATE profiles SET role = 'admin', full_name = 'Admin FitFlow' WHERE email = 'admin@fitflow.com';

  RAISE NOTICE 'Seed complete. Owner profile ready.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
