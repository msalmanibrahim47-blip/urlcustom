import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { EmptyState, Badge } from '@/components/ui';
import { ProjectsToolbar } from '@/components/ProjectsToolbar';
import { ProjectActions } from '@/components/ProjectActions';
import { FolderKanban, PlusCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils/misc';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: { q?: string; status?: string; sort?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  let query = supabase.from('projects').select('id, project_name, customer_name, website_url, slug, status, updated_at').eq('owner_id', userData.user!.id);

  if (searchParams.q) {
    query = query.or(`project_name.ilike.%${searchParams.q}%,customer_name.ilike.%${searchParams.q}%`);
  }
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  switch (searchParams.sort) {
    case 'created_desc':
      query = query.order('created_at', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('project_name', { ascending: true });
      break;
    default:
      query = query.order('updated_at', { ascending: false });
  }

  const { data: projects } = await query;
  const list = projects ?? [];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <ProjectsToolbar />
        <Link
          href="/projects/new"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2 hover:opacity-90 transition shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Create Project
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try adjusting your search or filters, or create a new project."
          action={
            <Link href="/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2 hover:opacity-90 transition">
              <PlusCircle className="h-4 w-4" /> Create Project
            </Link>
          }
        />
      ) : (
        <div className="bg-surface border rounded-2xl shadow-soft overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 text-xs font-medium text-muted border-b bg-surface-2/50">
            <span>Project</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y">
            {list.map((p) => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 md:gap-4 items-center px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.project_name}</p>
                  <p className="text-sm text-muted truncate">{p.customer_name} · {p.website_url} · updated {timeAgo(p.updated_at)}</p>
                </div>
                <div>
                  <Badge status={p.status} />
                </div>
                <div className="justify-self-end">
                  <ProjectActions id={p.id} slug={p.slug} status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
