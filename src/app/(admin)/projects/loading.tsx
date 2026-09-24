import { Skeleton } from '@/components/ui';

export default function ProjectsLoading() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-10 rounded-xl max-w-md" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    </div>
  );
}
