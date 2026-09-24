'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProject } from '@/lib/actions/projects';
import { isValidHttpUrl } from '@/lib/utils/url';
import { Spinner } from '@/components/ui';

export function CreateProjectForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [urlError, setUrlError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidHttpUrl(websiteUrl)) {
      setUrlError('Enter a valid URL, e.g. https://example.com');
      return;
    }
    setUrlError(null);

    startTransition(async () => {
      const res = await createProject({ projectName, customerName, websiteUrl, description, status });
      if (res.ok && res.data) {
        toast.success('Project created.');
        router.push(`/projects/${res.data.id}/edit`);
      } else {
        toast.error(res.error ?? 'Could not create project.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border rounded-2xl shadow-soft p-6 space-y-5 max-w-xl">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Project Name</label>
        <input
          required
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="ABC Restaurant"
          className="w-full rounded-xl border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Customer Name</label>
        <input
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="ABC Restaurant"
          className="w-full rounded-xl border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Customer Website URL</label>
        <input
          required
          value={websiteUrl}
          onChange={(e) => { setWebsiteUrl(e.target.value); setUrlError(null); }}
          placeholder="https://abcrestaurant.com"
          className="w-full rounded-xl border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
        {urlError && <p className="text-xs text-danger mt-1.5">{urlError}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional notes about this project..."
          className="w-full rounded-xl border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Status</label>
        <div className="flex gap-2">
          {(['draft', 'published'] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition ${
                status === s ? 'border-accent bg-accent/10 text-accent' : 'hover:bg-surface-2'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-fg text-sm font-medium py-2.5 hover:opacity-90 transition disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />}
        Create Project
      </button>
    </form>
  );
}
