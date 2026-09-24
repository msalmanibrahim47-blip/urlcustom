'use client';

import { useEffect, useRef, useState } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Maximize2, ShieldAlert } from 'lucide-react';
import { cx } from '@/lib/utils/misc';
import type { DeviceMode, OverlayElement, CtaSettings, WhatsappSettings } from '@/lib/types';
import { OverlayRenderer } from '@/components/OverlayRenderer';
import { checkEmbeddable } from '@/lib/actions/projects';

const DEVICE_WIDTH: Record<DeviceMode, string> = { desktop: '100%', tablet: '768px', mobile: '390px' };

export function PreviewFrame({
  websiteUrl,
  borderRadius,
  overlays,
  cta,
  whatsapp,
  accentColor,
  defaultDevice
}: {
  websiteUrl: string;
  borderRadius: number;
  overlays: OverlayElement[];
  cta: CtaSettings;
  whatsapp: WhatsappSettings;
  accentColor: string;
  defaultDevice: DeviceMode;
}) {
  const [device, setDevice] = useState<DeviceMode>(defaultDevice);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'blocked'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');

    checkEmbeddable(websiteUrl).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data && res.data.embeddable === false) {
        setLoadState('blocked');
      }
    });

    // If the iframe hasn't fired onLoad within 7s, or a frame-busting
    // script navigates it away, treat it as blocked rather than hanging
    // on a spinner forever.
    if (loadTimeout.current) clearTimeout(loadTimeout.current);
    loadTimeout.current = setTimeout(() => {
      if (!cancelled) setLoadState((s) => (s === 'loading' ? 'blocked' : s));
    }, 7000);

    return () => {
      cancelled = true;
      if (loadTimeout.current) clearTimeout(loadTimeout.current);
    };
  }, [websiteUrl, reloadKey]);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!fullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-surface flex-wrap">
        <div className="flex items-center gap-0.5 rounded-lg border bg-surface-2 p-0.5">
          <DeviceButton icon={Monitor} active={device === 'desktop'} onClick={() => setDevice('desktop')} label="Desktop" />
          <DeviceButton icon={Tablet} active={device === 'tablet'} onClick={() => setDevice('tablet')} label="Tablet" />
          <DeviceButton icon={Smartphone} active={device === 'mobile'} onClick={() => setDevice('mobile')} label="Mobile" />
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={RefreshCw} onClick={() => setReloadKey((k) => k + 1)} label="Refresh" />
          <IconButton icon={ExternalLink} onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')} label="Open Original" />
          <IconButton icon={Maximize2} onClick={toggleFullscreen} label="Fullscreen" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface-2 flex justify-center p-4">
        <div
          ref={containerRef}
          className="relative bg-white overflow-hidden shadow-soft transition-all"
          style={{ width: DEVICE_WIDTH[device], maxWidth: '100%', height: fullscreen ? '100vh' : '100%', minHeight: 480, borderRadius }}
        >
          {loadState === 'loading' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 text-sm text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading website...
            </div>
          )}

          {loadState === 'blocked' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 px-8 bg-gray-50">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
              </div>
              <p className="font-medium text-gray-800">This website does not allow embedded viewing.</p>
              <p className="text-sm text-gray-500 max-w-xs">
                The destination site's security policy blocks being shown inside another page. Open it directly instead.
              </p>
              <button
                onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2 hover:opacity-90 transition"
              >
                <ExternalLink className="h-4 w-4" /> Open Website
              </button>
            </div>
          ) : (
            <iframe
              key={reloadKey}
              src={websiteUrl}
              title="Customer website preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              onLoad={() => setLoadState('loaded')}
            />
          )}

          {loadState === 'loaded' && <OverlayRenderer overlays={overlays} cta={cta} whatsapp={whatsapp} accentColor={accentColor} />}
        </div>
      </div>
    </div>
  );
}

function DeviceButton({ icon: Icon, active, onClick, label }: { icon: typeof Monitor; active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} title={label} className={cx('h-7 w-7 flex items-center justify-center rounded-md transition', active ? 'bg-surface shadow-soft text-fg' : 'text-muted hover:text-fg')}>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function IconButton({ icon: Icon, onClick, label }: { icon: typeof RefreshCw; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} title={label} className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-surface-2 transition">
      <Icon className="h-4 w-4" />
    </button>
  );
}
