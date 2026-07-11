import { createClient } from '@/lib/supabase/client';
import type { Member, MembershipHistory, MemberFormData, PaymentHistory } from '@/types';
import { calcEndDate, getMemberPrice } from '@/lib/utils';

function memberWithProfileQuery() {
  const supabase = createClient();
  return supabase
    .from('members')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false });
}

export async function getMembers(): Promise<Member[]> {
  const supabase = createClient();
  const { data, error } = await memberWithProfileQuery();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMemberById(id: string): Promise<Member | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMemberByProfileId(profileId: string): Promise<Member | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*, profile:profiles(*)')
    .eq('profile_id', profileId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createMember(data: MemberFormData): Promise<Member> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('Not authenticated');

  const password = 'member123';
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password,
    options: {
      data: { full_name: data.full_name, role: 'member' },
    },
  });
  if (signUpError) throw new Error(signUpError.message);
  if (!signUpData.user) throw new Error('Failed to create user');

  const profileId = signUpData.user.id;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: profileId,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    role: 'member',
  }).select().single();
  if (profileError) throw new Error(profileError.message);

  const endDate = calcEndDate(data.start_date, data.membership_type);

  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      profile_id: profileId,
      membership_type: data.membership_type,
      start_date: data.start_date,
      end_date: endDate,
      status: 'Active',
    })
    .select('*, profile:profiles(*)')
    .single();

  if (memberError) throw new Error(memberError.message);

  const amount = getMemberPrice(data.membership_type);
  const invoiceNumber = `INV-${Date.now()}`;

  const { error: txError } = await supabase.from('transactions').insert({
    member_id: member.id,
    invoice_number: invoiceNumber,
    amount,
    payment_method: 'Transfer Bank',
    payment_status: 'Pending',
    type: 'Membership',
    description: `Membership ${data.membership_type} - ${data.full_name}`,
  });
  if (txError) throw new Error(txError.message);

  return member;
}

interface UpdateMemberData {
  full_name?: string;
  email?: string;
  phone?: string;
  membership_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export async function updateMember(id: string, data: UpdateMemberData): Promise<Member> {
  const supabase = createClient();

  if (data.full_name || data.email || data.phone) {
    const { data: member } = await supabase
      .from('members')
      .select('profile_id')
      .eq('id', id)
      .single();

    if (member) {
      const profileUpdate: Record<string, string> = {};
      if (data.full_name) profileUpdate.full_name = data.full_name;
      if (data.email) profileUpdate.email = data.email;
      if (data.phone) profileUpdate.phone = data.phone;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', member.profile_id);
        if (profileError) throw new Error(profileError.message);
      }
    }
  }

  const memberUpdate: Record<string, string> = {};
  const memberFields: (keyof UpdateMemberData)[] = ['membership_type', 'start_date', 'end_date', 'status'];
  for (const field of memberFields) {
    if (data[field] !== undefined) memberUpdate[field] = data[field] as string;
  }

  if (Object.keys(memberUpdate).length > 0) {
    const { error: memberError } = await supabase
      .from('members')
      .update(memberUpdate)
      .eq('id', id);
    if (memberError) throw new Error(memberError.message);
  }

  const { data: updated, error: fetchError } = await supabase
    .from('members')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return updated;
}

export async function deleteMember(id: string): Promise<void> {
  const supabase = createClient();

  const { data: member, error: fetchError } = await supabase
    .from('members')
    .select('profile_id')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error: txDeleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('member_id', id);
  if (txDeleteError) throw new Error(txDeleteError.message);

  const { error: historyDeleteError } = await supabase
    .from('membership_history')
    .delete()
    .eq('member_id', id);
  if (historyDeleteError) throw new Error(historyDeleteError.message);

  const { error: memberDeleteError } = await supabase
    .from('members')
    .delete()
    .eq('id', id);
  if (memberDeleteError) throw new Error(memberDeleteError.message);

  const { error: profileDeleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', member.profile_id);
  if (profileDeleteError) throw new Error(profileDeleteError.message);
}

export async function extendMembership(id: string, months: number): Promise<void> {
  const supabase = createClient();

  const { data: member, error: fetchError } = await supabase
    .from('members')
    .select('end_date, membership_type, profile:profiles(full_name)')
    .eq('id', id)
    .single();
  if (fetchError || !member) throw new Error(fetchError?.message || 'Member not found');

  const currentEnd = new Date(member.end_date);
  const now = new Date();
  const baseDate = currentEnd > now ? currentEnd : now;
  baseDate.setMonth(baseDate.getMonth() + months);
  const newEndDate = baseDate.toISOString().split('T')[0];

  const { error: updateError } = await supabase
    .from('members')
    .update({ end_date: newEndDate, status: 'Active' })
    .eq('id', id);
  if (updateError) throw new Error(updateError.message);

  const basePrice = getMemberPrice(member.membership_type);
  const amount = Math.round((basePrice / 12) * months);

  const invoiceNumber = `INV-${Date.now()}`;

  const { error: txError } = await supabase.from('transactions').insert({
    member_id: id,
    invoice_number: invoiceNumber,
    amount,
    payment_method: 'Transfer Bank',
    payment_status: 'Paid',
    type: 'Membership',
    description: `Extension ${months} month(s) - ${member.profile?.full_name ?? 'Member'}`,
  });
  if (txError) throw new Error(txError.message);
}

export async function getMembershipHistory(memberId: string): Promise<MembershipHistory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('membership_history')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPaymentHistory(memberId: string): Promise<PaymentHistory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('member_id', memberId)
    .order('paid_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
