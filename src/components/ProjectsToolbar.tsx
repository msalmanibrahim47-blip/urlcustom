'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useTransition } from 'react';

export function ProjectsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [, startTransition] = useTransition();

  function update(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && update({ q })}
          onBlur={() => update({ q })}
          placeholder="Search projects or customers..."
          className="w-full rounded-xl border bg-surface pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
      </div>
      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={(e) => update({ status: e.target.value })}
        className="rounded-xl border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="unpublished">Unpublished</option>
      </select>
      <select
        defaultValue={searchParams.get('sort') ?? 'updated_desc'}
        onChange={(e) => update({ sort: e.target.value })}
        className="rounded-xl border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
      >
        <option value="updated_desc">Recently updated</option>
        <option value="created_desc">Newest</option>
        <option value="name_asc">Name A–Z</option>
      </select>
    </div>
  );
}
