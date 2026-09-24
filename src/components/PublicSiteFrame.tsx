'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, ShieldAlert, Loader2 } from 'lucide-react';
import { OverlayRenderer } from '@/components/OverlayRenderer';
import type { CtaSettings, OverlayElement, WhatsappSettings } from '@/lib/types';

export function PublicSiteFrame({
  slug,
  websiteUrl,
  borderRadius,
  overlays,
  cta,
  whatsapp,
  accentColor,
  initiallyBlocked
}: {
  slug: string;
  websiteUrl: string;
  borderRadius: number;
  overlays: OverlayElement[];
  cta: CtaSettings;
  whatsapp: WhatsappSettings;
  accentColor: string;
  initiallyBlocked: boolean;
}) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'blocked'>(initiallyBlocked ? 'blocked' : 'loading');
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Best-effort view tracking — never blocks or breaks the page if it fails.
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, referrer: document.referrer || null })
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (initiallyBlocked) return;
    timeout.current = setTimeout(() => setLoadState((s) => (s === 'loading' ? 'blocked' : s)), 7000);
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, [initiallyBlocked]);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden" style={{ borderRadius }}>
      {loadState === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading website...
        </div>
      )}

      {loadState === 'blocked' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 px-8 bg-gray-50">
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
          </div>
          <p className="font-medium text-gray-800">This website does not allow embedded viewing.</p>
          <p className="text-sm text-gray-500 max-w-xs">Open it directly to continue.</p>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
            style={{ backgroundColor: accentColor }}
          >
            <ExternalLink className="h-4 w-4" /> Open Website
          </a>
        </div>
      ) : (
        <iframe
          src={websiteUrl}
          title="Website"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadState('loaded')}
        />
      )}

      {loadState === 'loaded' && <OverlayRenderer overlays={overlays} cta={cta} whatsapp={whatsapp} accentColor={accentColor} />}
    </div>
  );
}
