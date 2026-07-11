export * from './database';

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiringMembers: number;
  todayRevenue: number;
  monthlyRevenue: number;
  revenueData: { date: string; revenue: number }[];
  recentTransactions: Transaction[];
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  type: 'payment' | 'member' | 'system';
}

export interface MemberFormData {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  address: string;
  membership_type: MembershipType;
  start_date: string;
  emergency_name: string;
  emergency_phone: string;
  notes: string;
}

export interface TransactionFormData {
  member_id: string;
  type: TransactionType;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  date: string;
  description: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  avatar_url: string | null;
}
