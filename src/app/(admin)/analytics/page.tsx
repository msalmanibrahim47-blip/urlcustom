import { createClient } from '@/lib/supabase/server';
import { StatCard, EmptyState, Badge } from '@/components/ui';
import { Eye, Users, Smartphone, BarChart3 } from 'lucide-react';
import { formatNumber, timeAgo } from '@/lib/utils/misc';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, slug, status')
    .eq('owner_id', userData.user!.id);

  const list = projects ?? [];
  const projectIds = list.map((p) => p.id);

  if (projectIds.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <EmptyState icon={BarChart3} title="No analytics yet" description="Publish a project and share its public URL to start collecting page views." />
      </div>
    );
  }

  const { data: events } = await supabase
    .from('analytics_events')
    .select('id, project_id, device_type, referrer, created_at')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(500);

  const list_events = events ?? [];
  const totalViews = list_events.length;
  const deviceCounts: Record<string, number> = {};
  const perProject: Record<string, number> = {};
  list_events.forEach((e) => {
    deviceCounts[e.device_type ?? 'unknown'] = (deviceCounts[e.device_type ?? 'unknown'] ?? 0) + 1;
    perProject[e.project_id] = (perProject[e.project_id] ?? 0) + 1;
  });

  const uniqueReferrers = new Set(list_events.filter((e) => e.referrer).map((e) => e.referrer)).size;
  const topDevice = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const projectRows = list
    .map((p) => ({ ...p, views: perProject[p.id] ?? 0 }))
    .sort((a, b) => b.views - a.views);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={formatNumber(totalViews)} icon={Eye} />
        <StatCard label="Referring Sources" value={formatNumber(uniqueReferrers)} icon={Users} />
        <StatCard label="Top Device Type" value={topDevice} icon={Smartphone} />
        <StatCard label="Tracked Projects" value={list.length} icon={BarChart3} />
      </div>

      <div>
        <h2 className="font-semibold mb-4">Views by Project</h2>
        <div className="bg-surface border rounded-2xl divide-y shadow-soft overflow-hidden">
          {projectRows.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">{p.project_name}</span>
                <Badge status={p.status} />
              </div>
              <span className="text-sm text-muted shrink-0">{formatNumber(p.views)} views</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        {list_events.length === 0 ? (
          <p className="text-sm text-muted">No page views recorded yet.</p>
        ) : (
          <div className="bg-surface border rounded-2xl divide-y shadow-soft overflow-hidden">
            {list_events.slice(0, 20).map((e) => {
              const proj = list.find((p) => p.id === e.project_id);
              return (
                <div key={e.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="truncate">{proj?.project_name ?? 'Unknown project'}</span>
                  <span className="text-muted shrink-0">{e.device_type ?? 'unknown'} · {timeAgo(e.created_at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
