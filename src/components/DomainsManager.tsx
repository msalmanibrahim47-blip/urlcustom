'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Globe, Plus } from 'lucide-react';
import { addDomain, removeDomain } from '@/lib/actions/settings';
import { Spinner } from '@/components/ui';
import type { DomainRecord } from '@/lib/types';
import { cx } from '@/lib/utils/misc';

export function DomainsManager({ domains }: { domains: DomainRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await addDomain({ domain: value });
      if (res.ok) {
        toast.success('Domain added — follow the DNS steps below to activate it.');
        setValue('');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Could not add domain.');
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await removeDomain(id);
      if (res.ok) { toast.success('Domain removed.'); router.refresh(); }
      else toast.error(res.error ?? 'Could not remove domain.');
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="flex gap-2 max-w-lg">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="app.yourcompany.com"
          className="flex-1 rounded-xl border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending || !value}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2 hover:opacity-90 transition disabled:opacity-60"
        >
          {isPending ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Add Domain
        </button>
      </form>

      {domains.length === 0 ? (
        <p className="text-sm text-muted">No custom domains added yet.</p>
      ) : (
        <div className="bg-surface border rounded-2xl divide-y shadow-soft overflow-hidden max-w-2xl">
          {domains.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="h-4 w-4 text-muted shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{d.domain}</p>
                  <div className="flex gap-2 mt-0.5">
                    <StatusPill label="Domain" value={d.status} />
                    <StatusPill label="SSL" value={d.ssl_status} />
                  </div>
                </div>
              </div>
              <button onClick={() => remove(d.id)} className="text-muted hover:text-danger transition shrink-0"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface-2 border rounded-2xl p-5 max-w-2xl text-sm text-muted space-y-2">
        <p className="font-medium text-fg">Connecting a domain on Netlify</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>In your Netlify site, go to <strong className="text-fg">Domain management → Add a domain</strong> and enter the domain above.</li>
          <li>Point your domain's DNS to Netlify — either use Netlify DNS, or add the CNAME/A record Netlify shows you at your registrar.</li>
          <li>Netlify provisions a free SSL certificate automatically once DNS is verified — this can take a few minutes.</li>
          <li>Once verified, come back here — status updates are informational only; the source of truth is your Netlify dashboard.</li>
        </ol>
      </div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-muted/15 text-muted',
    verified: 'bg-success/15 text-success',
    active: 'bg-success/15 text-success',
    error: 'bg-danger/15 text-danger'
  };
  return (
    <span className={cx('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide', styles[value])}>
      {label}: {value}
    </span>
  );
}
