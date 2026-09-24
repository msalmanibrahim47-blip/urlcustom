'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { upsertPlatformSettings } from '@/lib/actions/settings';
import { Field, TextInput, ColorInput } from '@/components/editor/fields';
import { Spinner } from '@/components/ui';
import type { PlatformSettings } from '@/lib/types';

export function SettingsForm({ initial }: { initial: Partial<PlatformSettings> | null }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial?.platform_name ?? 'White Label Platform');
  const [logo, setLogo] = useState(initial?.logo_url ?? '');
  const [favicon, setFavicon] = useState(initial?.favicon_url ?? '');
  const [primary, setPrimary] = useState(initial?.primary_color ?? '#6366f1');
  const [bg, setBg] = useState(initial?.default_background ?? '#0b0c10');
  const [footer, setFooter] = useState(initial?.footer_text ?? '');

  function save() {
    startTransition(async () => {
      const res = await upsertPlatformSettings({
        platform_name: name,
        logo_url: logo || null,
        favicon_url: favicon || null,
        primary_color: primary,
        default_background: bg,
        footer_text: footer || null
      });
      if (res.ok) toast.success('Platform settings saved.');
      else toast.error(res.error ?? 'Could not save settings.');
    });
  }

  return (
    <div className="bg-surface border rounded-2xl shadow-soft p-6 space-y-5 max-w-xl">
      <Field label="Platform Name" hint="Shown across the admin UI — not tied to any single customer.">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Platform Logo URL"><TextInput value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://.../logo.svg" /></Field>
      <Field label="Favicon URL"><TextInput value={favicon} onChange={(e) => setFavicon(e.target.value)} placeholder="https://.../favicon.ico" /></Field>
      <Field label="Primary Color"><ColorInput value={primary} onChange={setPrimary} /></Field>
      <Field label="Default Background"><ColorInput value={bg} onChange={setBg} /></Field>
      <Field label="Custom Footer Text"><TextInput value={footer} onChange={(e) => setFooter(e.target.value)} placeholder="© 2026 Your Company" /></Field>
      <button
        onClick={save}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2.5 hover:opacity-90 transition disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />} Save Settings
      </button>
    </div>
  );
}
