import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectEditor } from '@/components/editor/ProjectEditor';
import type { Project, ProjectSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', userData.user!.id)
    .single();

  if (!project) notFound();

  const { data: settings } = await supabase.from('project_settings').select('*').eq('project_id', params.id).single();

  if (!settings) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  return <ProjectEditor project={project as Project} settings={settings as ProjectSettings} siteUrl={siteUrl} />;
}
