'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Copy, Eye, Pencil, MoreVertical, Trash2, Rocket, CopyPlus, PauseCircle } from 'lucide-react';
import { duplicateProject, deleteProject, setProjectStatus } from '@/lib/actions/projects';
import { ConfirmModal } from '@/components/ui';
import { cx } from '@/lib/utils/misc';
import Link from 'next/link';

export function ProjectActions({ id, slug, status }: { id: string; slug: string; status: 'draft' | 'published' | 'unpublished' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function copyUrl() {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard');
    setOpen(false);
  }

  function togglePublish() {
    const next = status === 'published' ? 'unpublished' : 'published';
    startTransition(async () => {
      const res = await setProjectStatus(id, next);
      if (res.ok) {
        toast.success(next === 'published' ? 'Project published successfully.' : 'Project unpublished.');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Something went wrong.');
      }
      setOpen(false);
    });
  }

  function duplicate() {
    startTransition(async () => {
      const res = await duplicateProject(id);
      if (res.ok) {
        toast.success('Project duplicated.');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Something went wrong.');
      }
      setOpen(false);
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteProject(id);
      if (res.ok) {
        toast.success('Project deleted.');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Something went wrong.');
      }
      setConfirmDelete(false);
    });
  }

  return (
    <div className="relative flex items-center gap-1">
      <Link href={`/projects/${id}/edit`} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-fg transition" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <Link href={`/p/${slug}`} target="_blank" className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-fg transition" title="Preview">
        <Eye className="h-4 w-4" />
      </Link>
      <button onClick={copyUrl} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-fg transition" title="Copy public URL">
        <Copy className="h-4 w-4" />
      </button>
      <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-fg transition" title="More">
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-44 bg-surface border rounded-xl shadow-soft py-1 anim-fade">
            <button
              disabled={isPending}
              onClick={togglePublish}
              className={cx('w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2 transition', status === 'published' && 'text-danger')}
            >
              {status === 'published' ? <PauseCircle className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
              {status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button disabled={isPending} onClick={duplicate} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2 transition">
              <CopyPlus className="h-4 w-4" /> Duplicate
            </button>
            <button
              disabled={isPending}
              onClick={() => { setConfirmDelete(true); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmDelete}
        title="Delete project?"
        description="This permanently deletes the project, its settings, and its public URL. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
