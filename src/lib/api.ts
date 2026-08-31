import { supabase } from '@/lib/supabase';

// ── Content ──

export async function loadAllContent(): Promise<{ key: string; value: Record<string, unknown> }[]> {
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
    .order('key');
  if (error) throw new Error(error.message);
  return (data ?? []) as { key: string; value: Record<string, unknown> }[];
}

export async function saveAllContent(entries: { key: string; value: Record<string, unknown> }[]): Promise<void> {
  for (const entry of entries) {
    const { error } = await supabase
      .from('site_content')
      .upsert(
        { key: entry.key, value: entry.value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) throw new Error(error.message);
  }
}

// ── Giveaway (free) daily entries ──

export type EligibilityResult = {
  eligible: boolean;
  last_entry: string | null;
  next_eligible: string | null;
  total_entries: number;
};

export type SubmitResult = {
  success: boolean;
  reason?: string;
  entry_id?: string;
  next_eligible: string;
  total_entries: number;
};

export async function checkEligibility(email: string): Promise<EligibilityResult> {
  const { data, error } = await supabase.rpc('check_entry_eligibility', {
    p_email: email.trim().toLowerCase(),
  });
  if (error) throw new Error(error.message);
  return data as EligibilityResult;
}

export async function submitDailyEntry(data: {
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  story?: string;
}): Promise<SubmitResult> {
  const { data: result, error } = await supabase.rpc('submit_daily_entry', {
    p_full_name: data.full_name,
    p_email: data.email.trim().toLowerCase(),
    p_phone: data.phone || null,
    p_city: data.city || null,
    p_state: data.state || null,
    p_story: data.story || null,
  });
  if (error) throw new Error(error.message);
  return result as SubmitResult;
}

/** @deprecated kept for admin dashboard backward compat */
export async function submitEntry(data: {
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
}): Promise<void> {
  const result = await submitDailyEntry(data);
  if (!result.success) {
    throw new Error(result.reason === 'cooldown' ? 'cooldown' : 'Failed to submit entry');
  }
}

export async function loadEntries() {
  const { data, error } = await supabase
    .from('giveaway_entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from('giveaway_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Paid entries ──

export async function loadPaidEntries() {
  const { data, error } = await supabase
    .from('paid_entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deletePaidEntry(id: string) {
  const { error } = await supabase.from('paid_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Combined entries (admin dashboard) ──

export async function loadAllEntries() {
  const [freeRes, paidRes] = await Promise.all([
    supabase.from('giveaway_entries').select('*').order('created_at', { ascending: false }),
    supabase.from('paid_entries').select('*').order('created_at', { ascending: false }),
  ]);

  if (freeRes.error) throw new Error(freeRes.error.message);
  if (paidRes.error) throw new Error(paidRes.error.message);

  const free = (freeRes.data ?? []).map((e) => ({
    ...e,
    entry_type: 'free' as const,
    entry_count: 1,
    product_name: null as string | null,
    source: 'Free Entry',
  }));

  const paid = (paidRes.data ?? []).map((e) => ({
    ...e,
    entry_type: 'paid' as const,
    source: e.product_name as string,
  }));

  return [...free, ...paid].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ── Car donations ──

export async function submitDonation(data: Record<string, unknown>) {
  const { error } = await supabase.from('car_donations').insert(data);
  if (error) throw new Error(error.message);
}

export async function loadDonations() {
  const { data, error } = await supabase
    .from('car_donations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateDonationStatus(id: string, status: string) {
  const { error } = await supabase.from('car_donations').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteDonation(id: string) {
  const { error } = await supabase.from('car_donations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── File upload (uses Supabase storage directly) ──

export async function uploadFile(file: File): Promise<string> {
  const fileName = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;

  const { error: uploadError } = await supabase
    .storage
    .from('site-assets')
    .upload(fileName, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase
    .storage
    .from('site-assets')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
