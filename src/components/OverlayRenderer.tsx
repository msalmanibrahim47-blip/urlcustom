'use client';

import { MessageCircle, Phone, X } from 'lucide-react';
import type { CtaSettings, OverlayElement, Position, WhatsappSettings } from '@/lib/types';
import { buildWhatsappUrl } from '@/lib/utils/misc';
import { cx } from '@/lib/utils/misc';

const POSITION_CLASSES: Record<Position, string> = {
  'top-left': 'top-3 left-3 items-start',
  'top-center': 'top-3 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-3 right-3 items-end',
  'bottom-left': 'bottom-3 left-3 items-start',
  'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-3 right-3 items-end'
};

const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = { sm: 36, md: 44, lg: 52 };

const ANIM_CLASS: Record<OverlayElement['animation'], string> = {
  none: '',
  fade: 'anim-fade',
  slide: 'anim-slide',
  bounce: 'anim-bounce'
};

export function OverlayRenderer({
  overlays,
  cta,
  whatsapp,
  accentColor
}: {
  overlays: OverlayElement[];
  cta: CtaSettings;
  whatsapp: WhatsappSettings;
  accentColor: string;
}) {
  const announcement = overlays.find((o) => o.type === 'announcement' && o.enabled);
  const floating = overlays.filter((o) => o.type !== 'announcement' && o.enabled);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {announcement && (
        <div
          className={cx('pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white', ANIM_CLASS[announcement.animation])}
          style={{
            backgroundColor: accentColor,
            opacity: announcement.opacity / 100,
            fontWeight: announcement.fontWeight,
            fontSize: `${announcement.fontSize}px`
          }}
        >
          {announcement.link ? (
            <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {announcement.text}
            </a>
          ) : (
            <span>{announcement.text}</span>
          )}
        </div>
      )}

      {floating.map((el) => (
        <FloatingOverlay key={el.id} el={el} />
      ))}

      {cta.enabled && cta.text && (
        <a
          href={cta.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={cx('pointer-events-auto absolute flex anim-slide', POSITION_CLASSES[cta.position])}
          style={{ zIndex: 30 }}
        >
          <span
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
            style={{ backgroundColor: accentColor }}
          >
            {cta.text}
          </span>
        </a>
      )}

      {whatsapp.enabled && whatsapp.phoneNumber && (
        <a
          href={buildWhatsappUrl(whatsapp.phoneNumber, whatsapp.message)}
          target="_blank"
          rel="noopener noreferrer"
          className={cx('pointer-events-auto absolute flex anim-bounce', POSITION_CLASSES[whatsapp.position])}
          style={{ zIndex: 30 }}
        >
          <span
            className="rounded-full flex items-center justify-center text-white shadow-soft hover:opacity-90 transition"
            style={{ backgroundColor: whatsapp.color, width: SIZE_PX[whatsapp.size], height: SIZE_PX[whatsapp.size] }}
          >
            <MessageCircle className="h-1/2 w-1/2" />
          </span>
        </a>
      )}
    </div>
  );
}

function FloatingOverlay({ el }: { el: OverlayElement }) {
  const size = SIZE_PX[el.size];

  if (el.type === 'image' && el.link) {
    return (
      <div className={cx('pointer-events-auto absolute flex', POSITION_CLASSES[el.position], ANIM_CLASS[el.animation])} style={{ opacity: el.opacity / 100, zIndex: 30 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={el.link} alt={el.text || 'Overlay image'} style={{ width: size * 1.5, borderRadius: el.borderRadius }} />
      </div>
    );
  }

  if (el.type === 'badge') {
    return (
      <div
        className={cx('pointer-events-auto absolute flex', POSITION_CLASSES[el.position], ANIM_CLASS[el.animation])}
        style={{ opacity: el.opacity / 100, zIndex: 30 }}
      >
        <span
          className="bg-fg text-bg px-2.5 py-1 shadow-soft"
          style={{ borderRadius: el.borderRadius, fontSize: el.fontSize, fontWeight: el.fontWeight }}
        >
          {el.text}
        </span>
      </div>
    );
  }

  if (el.type === 'call' && el.link) {
    return (
      <a
        href={`tel:${el.link}`}
        className={cx('pointer-events-auto absolute flex', POSITION_CLASSES[el.position], ANIM_CLASS[el.animation])}
        style={{ opacity: el.opacity / 100, zIndex: 30 }}
      >
        <span className="rounded-full bg-fg text-bg flex items-center justify-center shadow-soft" style={{ width: size, height: size, borderRadius: el.borderRadius }}>
          <Phone className="h-1/2 w-1/2" />
        </span>
      </a>
    );
  }

  // 'text' and 'contact' fall back to a simple pill/button
  return (
    <a
      href={el.link || undefined}
      target={el.link ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={cx('pointer-events-auto absolute flex', POSITION_CLASSES[el.position], ANIM_CLASS[el.animation])}
      style={{ opacity: el.opacity / 100, zIndex: 30 }}
    >
      <span
        className="bg-surface border shadow-soft px-3 py-2 hover:bg-surface-2 transition"
        style={{ borderRadius: el.borderRadius, fontSize: el.fontSize, fontWeight: el.fontWeight }}
      >
        {el.text}
      </span>
    </a>
  );
}

export function dismissIcon() {
  return <X className="h-3.5 w-3.5" />;
}
