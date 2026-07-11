import { createClient } from '@/lib/supabase/client';
import type { AuthUser } from '@/types';

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(signInError.message);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error(userError?.message || 'User not found');

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, full_name: user.email?.split('@')[0] || 'User', email: user.email!, role: 'member' })
      .select('role, full_name, avatar_url')
      .single();

    if (insertError || !newProfile) throw new Error('Gagal membuat profil');
    profile = newProfile;
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'member',
): Promise<AuthUser> {
  const supabase = createClient();
  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw new Error(signUpError.message);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error(userError?.message || 'User not found');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: fullName,
    email,
    role,
  });
  if (profileError) throw new Error(profileError.message);

  return {
    id: user.id,
    email: user.email!,
    role,
    full_name: fullName,
    avatar_url: null,
  };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
}

export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function resetPassword(email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}
