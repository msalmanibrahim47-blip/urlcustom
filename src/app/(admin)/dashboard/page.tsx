import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StatCard, EmptyState, Badge } from '@/components/ui';
import { FolderKanban, CheckCircle2, Eye, Rocket, PlusCircle, ExternalLink } from 'lucide-react';
import { formatNumber, timeAgo } from '@/lib/utils/misc';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, customer_name, slug, status, updated_at')
    .eq('owner_id', userData.user!.id)
    .order('updated_at', { ascending: false });

  const list = projects ?? [];
  const total = list.length;
  const active = list.filter((p) => p.status !== 'unpublished').length;
  const published = list.filter((p) => p.status === 'published').length;

  const projectIds = list.map((p) => p.id);
  let totalViews = 0;
  if (projectIds.length > 0) {
    const { count } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds);
    totalViews = count ?? 0;
  }

  const recent = list.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={total} icon={FolderKanban} />
        <StatCard label="Active Projects" value={active} icon={CheckCircle2} />
        <StatCard label="Published Projects" value={published} icon={Rocket} />
        <StatCard label="Total Views" value={formatNumber(totalViews)} icon={Eye} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-accent font-medium hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first customer project to start customizing and publishing a white-labeled experience."
            action={
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2 hover:opacity-90 transition"
              >
                <PlusCircle className="h-4 w-4" /> Create Project
              </Link>
            }
          />
        ) : (
          <div className="bg-surface border rounded-2xl divide-y shadow-soft overflow-hidden">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}/edit`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{p.project_name}</span>
                    <Badge status={p.status} />
                  </div>
                  <p className="text-sm text-muted truncate">{p.customer_name} · updated {timeAgo(p.updated_at)}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
