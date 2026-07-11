export type Role = 'owner' | 'admin' | 'member';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export type MembershipType = 'Platinum' | 'Gold' | 'Silver';
export type MemberStatus = 'Active' | 'Expired' | 'Pending';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';
export type PaymentMethod = 'Transfer Bank' | 'Kartu Kredit' | 'E-Wallet' | 'Tunai';
export type TransactionType = 'Membership' | 'Personal Training' | 'Merchandise';

export interface Member {
  id: string;
  profile_id: string;
  membership_type: MembershipType;
  start_date: string;
  end_date: string;
  status: MemberStatus;
  created_at: string;
  profile?: Profile;
}

export interface Transaction {
  id: string;
  member_id: string;
  invoice_number: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  type: TransactionType;
  description: string | null;
  created_at: string;
  member?: Member & { profile?: Profile };
}

export interface MembershipHistory {
  id: string;
  member_id: string;
  membership_type: MembershipType;
  start_date: string;
  end_date: string;
  amount: number;
  status: MemberStatus;
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  member_id: string;
  transaction_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  description: string | null;
  paid_at: string;
}
