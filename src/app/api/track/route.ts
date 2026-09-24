import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectDeviceType } from '@/lib/utils/misc';

/**
 * Records one page-view event for a published project's public page.
 * Called client-side (not during SSR) so we get the browser's real
 * document.referrer. No raw IP is ever stored — analytics_events has no
 * IP column, only a device-type/referrer summary, per the "no invasive
 * tracking" requirement.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug: string | undefined = body?.slug;
    if (!slug) return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 });

    const supabase = createClient();

    const { data: project } = await supabase.from('projects').select('id, status').eq('slug', slug).single();
    if (!project || project.status !== 'published') {
      return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    }

    const userAgent = request.headers.get('user-agent');

    const { error } = await supabase.from('analytics_events').insert({
      project_id: project.id,
      event_type: 'page_view',
      referrer: typeof body?.referrer === 'string' ? body.referrer.slice(0, 500) : null,
      device_type: detectDeviceType(userAgent)
    });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}
