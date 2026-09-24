'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { normalizeUrl } from '@/lib/utils/url';
import { slugify, uniqueSlug } from '@/lib/utils/slug';
import { defaultBranding, defaultCta, defaultPresentation, defaultWhatsapp } from '@/lib/defaults';
import type { Branding, CtaSettings, OverlayElement, Presentation, WhatsappSettings } from '@/lib/types';

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

async function requireUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return { supabase, user: data.user };
}

export async function createProject(input: {
  projectName: string;
  customerName: string;
  websiteUrl: string;
  description?: string;
  status: 'draft' | 'published';
}): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const { supabase, user } = await requireUser();

    if (!input.projectName.trim() || !input.customerName.trim()) {
      return { ok: false, error: 'Project name and customer name are required.' };
    }

    const normalizedUrl = normalizeUrl(input.websiteUrl);
    if (!normalizedUrl) {
      return { ok: false, error: 'Please enter a valid website URL, e.g. https://example.com' };
    }

    const { data: existingSlugs } = await supabase.from('projects').select('slug').eq('owner_id', user.id);
    const slugSet = new Set((existingSlugs ?? []).map((r) => r.slug));
    const slug = uniqueSlug(slugify(input.projectName), slugSet);

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        project_name: input.projectName.trim(),
        customer_name: input.customerName.trim(),
        website_url: normalizedUrl,
        description: input.description?.trim() || null,
        slug,
        status: input.status
      })
      .select('id, slug')
      .single();

    if (error || !project) return { ok: false, error: error?.message ?? 'Failed to create project.' };

    const { error: settingsError } = await supabase.from('project_settings').insert({
      project_id: project.id,
      branding: defaultBranding,
      presentation: defaultPresentation,
      overlays: [],
      cta: defaultCta,
      whatsapp: defaultWhatsapp
    });

    if (settingsError) return { ok: false, error: settingsError.message };

    revalidatePath('/dashboard');
    revalidatePath('/projects');
    return { ok: true, data: { id: project.id, slug: project.slug } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

export async function updateProjectMeta(
  id: string,
  patch: Partial<{ project_name: string; customer_name: string; website_url: string; description: string | null; slug: string; fallback_behavior: 'show_fallback' | 'redirect' }>
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();

    const cleanPatch: Record<string, unknown> = { ...patch };
    if (patch.website_url) {
      const normalized = normalizeUrl(patch.website_url);
      if (!normalized) return { ok: false, error: 'Invalid website URL.' };
      cleanPatch.website_url = normalized;
      cleanPatch.embed_mode = 'unknown'; // re-check next time the editor loads it
    }
    if (patch.slug) {
      cleanPatch.slug = slugify(patch.slug);
      const { data: clashes } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', user.id)
        .eq('slug', cleanPatch.slug)
        .neq('id', id);
      if (clashes && clashes.length > 0) return { ok: false, error: 'That slug is already in use.' };
    }

    const { error } = await supabase.from('projects').update(cleanPatch).eq('id', id).eq('owner_id', user.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

export async function updateProjectSettings(
  projectId: string,
  patch: Partial<{ branding: Branding; presentation: Presentation; overlays: OverlayElement[]; cta: CtaSettings; whatsapp: WhatsappSettings }>
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();

    const { data: owned } = await supabase.from('projects').select('id').eq('id', projectId).eq('owner_id', user.id).single();
    if (!owned) return { ok: false, error: 'Project not found.' };

    const { error } = await supabase.from('project_settings').update(patch).eq('project_id', projectId);
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

export async function setProjectStatus(id: string, status: 'draft' | 'published' | 'unpublished'): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from('projects').update({ status }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${id}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

export async function duplicateProject(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireUser();

    const { data: original, error: fetchError } = await supabase
      .from('projects')
      .select('*, project_settings(*)')
      .eq('id', id)
      .single();

    if (fetchError || !original) return { ok: false, error: 'Original project not found.' };

    const { data: existingSlugs } = await supabase.from('projects').select('slug').eq('owner_id', user.id);
    const slugSet = new Set((existingSlugs ?? []).map((r) => r.slug));
    const newSlug = uniqueSlug(slugify(`${original.project_name}-copy`), slugSet);

    const { data: copy, error: copyError } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        project_name: `${original.project_name} (Copy)`,
        customer_name: original.customer_name,
        website_url: original.website_url,
        description: original.description,
        slug: newSlug,
        status: 'draft',
        embed_mode: original.embed_mode,
        fallback_behavior: original.fallback_behavior
      })
      .select('id')
      .single();

    if (copyError || !copy) return { ok: false, error: copyError?.message ?? 'Failed to duplicate.' };

    const settingsSource = Array.isArray(original.project_settings) ? original.project_settings[0] : original.project_settings;

    const { error: settingsError } = await supabase.from('project_settings').insert({
      project_id: copy.id,
      branding: settingsSource?.branding ?? defaultBranding,
      presentation: settingsSource?.presentation ?? defaultPresentation,
      overlays: settingsSource?.overlays ?? [],
      cta: settingsSource?.cta ?? defaultCta,
      whatsapp: settingsSource?.whatsapp ?? defaultWhatsapp
    });

    if (settingsError) return { ok: false, error: settingsError.message };

    revalidatePath('/projects');
    return { ok: true, data: { id: copy.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

/**
 * Server-side check of whether a customer's site can be embedded in an
 * iframe. We can't know for certain without loading it in a real browser
 * (frame-busting JS only runs client-side), so the editor combines this
 * header check with a client-side load-timeout fallback. We never attempt
 * to strip or bypass these headers — only detect and report them.
 */
export async function checkEmbeddable(url: string): Promise<ActionResult<{ embeddable: boolean; reason?: string }>> {
  try {
    const normalized = normalizeUrl(url);
    if (!normalized) return { ok: false, error: 'Invalid URL.' };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(normalized, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WhiteLabelPlatformBot/1.0; +preview-check)' }
    }).finally(() => clearTimeout(timeout));

    const xfo = res.headers.get('x-frame-options')?.toLowerCase() ?? '';
    const csp = res.headers.get('content-security-policy')?.toLowerCase() ?? '';

    if (xfo.includes('deny') || xfo.includes('sameorigin')) {
      return { ok: true, data: { embeddable: false, reason: `X-Frame-Options: ${xfo}` } };
    }
    if (csp.includes('frame-ancestors')) {
      const directive = csp.split('frame-ancestors')[1]?.split(';')[0]?.trim() ?? '';
      const allowsAny = directive.includes('*') && !directive.includes("'none'");
      if (!allowsAny) {
        return { ok: true, data: { embeddable: false, reason: `Content-Security-Policy: frame-ancestors ${directive}` } };
      }
    }

    return { ok: true, data: { embeddable: true } };
  } catch (e) {
    // Network failure / timeout — treat as "unknown", not a confirmed block.
    // The client-side iframe attempt still gets the final say.
    return { ok: true, data: { embeddable: true, reason: 'header-check-unavailable' } };
  }
}
