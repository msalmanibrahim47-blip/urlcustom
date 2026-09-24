'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './projects';

export async function upsertPlatformSettings(patch: {
  platform_name: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color: string;
  default_background: string;
  footer_text?: string | null;
}): Promise<ActionResult> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('platform_settings')
    .upsert({ owner_id: userData.user.id, ...patch }, { onConflict: 'owner_id' });

  if (error) return { ok: false, error: error.message };
  revalidatePath('/settings');
  return { ok: true };
}

export async function addDomain(input: { domain: string; project_id?: string | null; is_primary?: boolean }): Promise<ActionResult> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Not authenticated' };

  const cleanDomain = input.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleanDomain)) {
    return { ok: false, error: 'Enter a valid domain, e.g. app.yourcompany.com' };
  }

  const { error } = await supabase.from('domains').insert({
    owner_id: userData.user.id,
    domain: cleanDomain,
    project_id: input.project_id ?? null,
    is_primary: input.is_primary ?? false,
    status: 'pending',
    ssl_status: 'pending'
  });

  if (error) return { ok: false, error: error.code === '23505' ? 'That domain is already added.' : error.message };
  revalidatePath('/domains');
  return { ok: true };
}

export async function removeDomain(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('domains').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/domains');
  return { ok: true };
}
