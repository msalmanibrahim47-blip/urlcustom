import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkEmbeddable } from '@/lib/actions/projects';
import { PublicSiteFrame } from '@/components/PublicSiteFrame';
import type { Project, ProjectSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getPublicProject(slug: string) {
  const supabase = createClient();
  const { data: project } = await supabase.from('projects').select('*').eq('slug', slug).eq('status', 'published').single();
  if (!project) return null;

  const { data: settings } = await supabase.from('project_settings').select('*').eq('project_id', project.id).single();
  if (!settings) return null;

  return { project: project as Project, settings: settings as ProjectSettings };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getPublicProject(params.slug);
  if (!result) return { title: 'Not found' };

  const { project, settings } = result;
  const title = settings.branding.brandName || project.project_name;

  return {
    title,
    description: project.description ?? undefined,
    icons: settings.branding.faviconUrl ? [{ url: settings.branding.faviconUrl }] : undefined
  };
}

export default async function PublicProjectPage({ params }: { params: { slug: string } }) {
  const result = await getPublicProject(params.slug);
  if (!result) notFound();

  const { project, settings } = result;

  const embedCheck = await checkEmbeddable(project.website_url);
  const blocked = embedCheck.ok && embedCheck.data?.embeddable === false;

  if (blocked && project.fallback_behavior === 'redirect') {
    redirect(project.website_url);
  }

  return (
    <div style={{ backgroundColor: settings.branding.backgroundColor }} className="min-h-screen">
      <PublicSiteFrame
        slug={project.slug}
        websiteUrl={project.website_url}
        borderRadius={settings.presentation.borderRadius}
        overlays={settings.overlays}
        cta={settings.cta}
        whatsapp={settings.whatsapp}
        accentColor={settings.branding.accentColor}
        initiallyBlocked={!!blocked}
      />
    </div>
  );
}
