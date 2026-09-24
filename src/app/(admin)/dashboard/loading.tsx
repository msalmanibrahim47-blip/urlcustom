import { Skeleton } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
