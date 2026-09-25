'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Rocket, PauseCircle, Eye, SlidersHorizontal, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { PreviewFrame } from './PreviewFrame';
import { CustomizationPanel, type CustomizationState } from './CustomizationPanel';
import { updateProjectMeta, updateProjectSettings, setProjectStatus } from '@/lib/actions/projects';
import { useAutosave } from '@/hooks/useAutosave';
import type { Project, ProjectSettings } from '@/lib/types';
import { cx } from '@/lib/utils/misc';

export function ProjectEditor({ project, settings, siteUrl }: { project: Project; settings: ProjectSettings; siteUrl: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projectName, setProjectName] = useState(project.project_name);
  const [status, setStatus] = useState(project.status);
  const [panelOpen, setPanelOpen] = useState(false);

  const [state, setState] = useState<CustomizationState>({
    branding: settings.branding,
    presentation: settings.presentation,
    overlays: settings.overlays,
    cta: settings.cta,
    whatsapp: settings.whatsapp,
    fallbackBehavior: project.fallback_behavior,
    slug: project.slug
  });

  const settingsSaveState = useAutosave(
    { branding: state.branding, presentation: state.presentation, overlays: state.overlays, cta: state.cta, whatsapp: state.whatsapp },
    (value) => updateProjectSettings(project.id, value)
  );
  const fallbackSaveState = useAutosave({ fallback_behavior: state.fallbackBehavior }, (value) => updateProjectMeta(project.id, value));
  const nameSaveState = useAutosave({ project_name: projectName }, (value) => updateProjectMeta(project.id, value));
  const slugSaveState = useAutosave({ slug: state.slug }, async (value) => {
    const res = await updateProjectMeta(project.id, value);
    if (!res.ok) toast.error(res.error ?? 'Could not update the URL slug.');
    return res;
  });

  const overallState = useMemo(() => {
    const states = [settingsSaveState, fallbackSaveState, nameSaveState, slugSaveState];
    if (states.includes('saving')) return 'saving';
    if (states.includes('error')) return 'error';
    if (states.includes('saved')) return 'saved';
    return 'idle';
  }, [settingsSaveState, fallbackSaveState, nameSaveState, slugSaveState]);

  function patch(p: Partial<CustomizationState>) {
    setState((s) => ({ ...s, ...p }));
  }

  function togglePublish() {
    const next = status === 'published' ? 'unpublished' : 'published';
    startTransition(async () => {
      const res = await setProjectStatus(project.id, next);
      if (res.ok) {
        setStatus(next);
        toast.success(next === 'published' ? 'Project published successfully.' : 'Project unpublished.');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-surface shrink-0 flex-wrap">
        <Link href="/projects" className="text-muted hover:text-fg transition shrink-0" title="Back to projects">
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="font-medium text-sm bg-transparent outline-none min-w-0 flex-1 rounded-lg px-2 py-1 hover:bg-surface-2 focus:bg-surface-2 transition"
        />
        <SaveIndicator state={overallState} />
        {status === 'draft' && <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/15 text-muted shrink-0">DRAFT</span>}

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/p/${state.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg border px-3 py-1.5 hover:bg-surface-2 transition"
          >
            <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Preview</span>
          </Link>
          <button
            onClick={togglePublish}
            disabled={isPending}
            className={cx(
              'inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition text-white',
              status === 'published' ? 'bg-danger hover:opacity-90' : 'bg-accent hover:opacity-90'
            )}
          >
            {status === 'published' ? <PauseCircle className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
            <span className="hidden sm:inline">{status === 'published' ? 'Unpublish' : 'Publish'}</span>
          </button>
          <button
            onClick={() => setPanelOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 text-sm font-medium rounded-lg border px-3 py-1.5 hover:bg-surface-2 transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0">
          <PreviewFrame
            websiteUrl={project.website_url}
            borderRadius={state.presentation.borderRadius}
            overlays={state.overlays}
            cta={state.cta}
            whatsapp={state.whatsapp}
            accentColor={state.branding.accentColor}
            defaultDevice={state.presentation.defaultDevice}
          />
        </div>

        <div className="hidden lg:block w-80 shrink-0 border-l bg-surface">
          <CustomizationPanel state={state} onChange={patch} siteUrl={siteUrl} />
        </div>
      </div>

      {panelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanelOpen(false)} />
          <div className="relative bg-surface w-full max-h-[85vh] rounded-t-2xl flex flex-col anim-slide">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-medium text-sm">Customize</span>
              <button onClick={() => setPanelOpen(false)} className="text-muted"><X className="h-5 w-5" /></button>
            </div>
            <CustomizationPanel state={state} onChange={patch} siteUrl={siteUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (state === 'idle') return null;
  const map = {
    saving: { icon: Loader2, text: 'Saving...', cls: 'text-muted animate-pulse' },
    saved: { icon: Check, text: 'Saved', cls: 'text-success' },
    error: { icon: AlertCircle, text: 'Save failed', cls: 'text-danger' }
  } as const;
  const { icon: Icon, text, cls } = map[state];
  return (
    <span className={cx('hidden md:inline-flex items-center gap-1 text-xs shrink-0', cls)}>
      <Icon className={cx('h-3.5 w-3.5', state === 'saving' && 'animate-spin')} /> {text}
    </span>
  );
}
