'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Branding, CtaSettings, DeviceMode, OverlayElement, OverlayType, Position, Presentation, WhatsappSettings } from '@/lib/types';
import { Field, TextInput, ColorInput, Select, Toggle, Slider } from './fields';
import { cx } from '@/lib/utils/misc';

const TABS = ['Branding', 'Overlay', 'CTA', 'WhatsApp', 'Appearance', 'Advanced'] as const;
type Tab = (typeof TABS)[number];

const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' }, { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' }, { value: 'bottom-right', label: 'Bottom Right' }
];

const OVERLAY_TYPE_OPTIONS: { value: OverlayType; label: string }[] = [
  { value: 'announcement', label: 'Top Announcement Bar' },
  { value: 'contact', label: 'Contact Button' },
  { value: 'call', label: 'Call Button' },
  { value: 'text', label: 'Custom Text' },
  { value: 'image', label: 'Custom Image (URL)' },
  { value: 'badge', label: 'Custom Badge' }
];

export interface CustomizationState {
  branding: Branding;
  presentation: Presentation;
  overlays: OverlayElement[];
  cta: CtaSettings;
  whatsapp: WhatsappSettings;
  fallbackBehavior: 'show_fallback' | 'redirect';
}

export function CustomizationPanel({
  state,
  onChange,
  publicUrl
}: {
  state: CustomizationState;
  onChange: (patch: Partial<CustomizationState>) => void;
  publicUrl: string;
}) {
  const [tab, setTab] = useState<Tab>('Branding');

  return (
    <div className="flex flex-col h-full">
      <div className="flex overflow-x-auto border-b bg-surface shrink-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              'px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition',
              tab === t ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {tab === 'Branding' && <BrandingTab branding={state.branding} onChange={(b) => onChange({ branding: b })} />}
        {tab === 'Overlay' && <OverlaysTab overlays={state.overlays} onChange={(o) => onChange({ overlays: o })} />}
        {tab === 'CTA' && <CtaTab cta={state.cta} onChange={(c) => onChange({ cta: c })} />}
        {tab === 'WhatsApp' && <WhatsappTab whatsapp={state.whatsapp} onChange={(w) => onChange({ whatsapp: w })} />}
        {tab === 'Appearance' && <AppearanceTab presentation={state.presentation} onChange={(p) => onChange({ presentation: p })} />}
        {tab === 'Advanced' && (
          <AdvancedTab fallbackBehavior={state.fallbackBehavior} onChange={(f) => onChange({ fallbackBehavior: f })} publicUrl={publicUrl} />
        )}
      </div>
    </div>
  );
}

function BrandingTab({ branding, onChange }: { branding: Branding; onChange: (b: Branding) => void }) {
  const set = (patch: Partial<Branding>) => onChange({ ...branding, ...patch });
  return (
    <>
      <Field label="Brand Name"><TextInput value={branding.brandName ?? ''} onChange={(e) => set({ brandName: e.target.value })} placeholder="Displayed on the public page" /></Field>
      <Field label="Logo URL"><TextInput value={branding.logoUrl ?? ''} onChange={(e) => set({ logoUrl: e.target.value })} placeholder="https://..." /></Field>
      <Field label="Favicon URL"><TextInput value={branding.faviconUrl ?? ''} onChange={(e) => set({ faviconUrl: e.target.value })} placeholder="https://.../favicon.ico" /></Field>
      <Field label="Theme"><Select value={branding.theme} onChange={(v) => set({ theme: v as Branding['theme'] })} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} /></Field>
      <Field label="Primary Accent Color"><ColorInput value={branding.accentColor} onChange={(v) => set({ accentColor: v })} /></Field>
      <Field label="Background Color"><ColorInput value={branding.backgroundColor} onChange={(v) => set({ backgroundColor: v })} /></Field>
    </>
  );
}

function AppearanceTab({ presentation, onChange }: { presentation: Presentation; onChange: (p: Presentation) => void }) {
  const set = (patch: Partial<Presentation>) => onChange({ ...presentation, ...patch });
  return (
    <>
      <Field label={`Border Radius (${presentation.borderRadius}px)`}><Slider value={presentation.borderRadius} onChange={(v) => set({ borderRadius: v })} min={0} max={32} unit="px" /></Field>
      <Field label="Preview Frame Width" hint="e.g. 100%, 1200px"><TextInput value={presentation.frameWidth} onChange={(e) => set({ frameWidth: e.target.value })} /></Field>
      <Field label="Preview Frame Height" hint="e.g. 100%, 800px"><TextInput value={presentation.frameHeight} onChange={(e) => set({ frameHeight: e.target.value })} /></Field>
      <Field label="Default Device Mode">
        <Select value={presentation.defaultDevice} onChange={(v) => set({ defaultDevice: v as DeviceMode })} options={[{ value: 'desktop', label: 'Desktop' }, { value: 'tablet', label: 'Tablet' }, { value: 'mobile', label: 'Mobile' }]} />
      </Field>
    </>
  );
}

function CtaTab({ cta, onChange }: { cta: CtaSettings; onChange: (c: CtaSettings) => void }) {
  const set = (patch: Partial<CtaSettings>) => onChange({ ...cta, ...patch });
  const presets = ['Contact Us', 'Get Started', 'Book Now', 'Call Us', 'WhatsApp Us', 'Learn More', 'Visit Website'];
  return (
    <>
      <Field label="Enable CTA"><Toggle checked={cta.enabled} onChange={(v) => set({ enabled: v })} /></Field>
      <Field label="Button Text">
        <TextInput value={cta.text} onChange={(e) => set({ text: e.target.value })} list="cta-presets" />
        <datalist id="cta-presets">{presets.map((p) => <option key={p} value={p} />)}</datalist>
      </Field>
      <Field label="URL"><TextInput value={cta.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://example.com/contact" /></Field>
      <Field label="Position"><Select value={cta.position} onChange={(v) => set({ position: v as Position })} options={POSITION_OPTIONS} /></Field>
    </>
  );
}

function WhatsappTab({ whatsapp, onChange }: { whatsapp: WhatsappSettings; onChange: (w: WhatsappSettings) => void }) {
  const set = (patch: Partial<WhatsappSettings>) => onChange({ ...whatsapp, ...patch });
  return (
    <>
      <Field label="Enable WhatsApp Button"><Toggle checked={whatsapp.enabled} onChange={(v) => set({ enabled: v })} /></Field>
      <Field label="Phone Number" hint="Include country code, digits only, e.g. 15551234567"><TextInput value={whatsapp.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} placeholder="15551234567" /></Field>
      <Field label="Message"><TextInput value={whatsapp.message} onChange={(e) => set({ message: e.target.value })} /></Field>
      <Field label="Position"><Select value={whatsapp.position} onChange={(v) => set({ position: v as Position })} options={POSITION_OPTIONS} /></Field>
      <Field label="Color"><ColorInput value={whatsapp.color} onChange={(v) => set({ color: v })} /></Field>
      <Field label="Size"><Select value={whatsapp.size} onChange={(v) => set({ size: v as WhatsappSettings['size'] })} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} /></Field>
    </>
  );
}

function AdvancedTab({
  fallbackBehavior,
  onChange,
  publicUrl
}: {
  fallbackBehavior: 'show_fallback' | 'redirect';
  onChange: (f: 'show_fallback' | 'redirect') => void;
  publicUrl: string;
}) {
  return (
    <>
      <Field label="Public URL"><TextInput readOnly value={publicUrl} onClick={(e) => (e.target as HTMLInputElement).select()} /></Field>
      <Field label="When embedding is blocked" hint="Some customer sites disallow being shown in a frame. Choose what visitors to the public URL see in that case.">
        <Select
          value={fallbackBehavior}
          onChange={(v) => onChange(v as 'show_fallback' | 'redirect')}
          options={[{ value: 'show_fallback', label: 'Show fallback page' }, { value: 'redirect', label: 'Redirect to original site' }]}
        />
      </Field>
    </>
  );
}

function OverlaysTab({ overlays, onChange }: { overlays: OverlayElement[]; onChange: (o: OverlayElement[]) => void }) {
  function addOverlay(type: OverlayType) {
    const newOverlay: OverlayElement = {
      id: crypto.randomUUID(),
      type,
      enabled: true,
      text: type === 'announcement' ? 'Special offer — 20% off today!' : 'Learn more',
      link: '',
      position: type === 'announcement' ? 'top-center' : 'bottom-right',
      size: 'md',
      opacity: 100,
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      animation: 'fade'
    };
    onChange([...overlays, newOverlay]);
  }

  function update(id: string, patch: Partial<OverlayElement>) {
    onChange(overlays.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function remove(id: string) {
    onChange(overlays.filter((o) => o.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {OVERLAY_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => addOverlay(opt.value)}
            className="inline-flex items-center gap-1 text-xs font-medium rounded-lg border px-2.5 py-1.5 hover:bg-surface-2 transition"
          >
            <Plus className="h-3 w-3" /> {opt.label}
          </button>
        ))}
      </div>

      {overlays.length === 0 && <p className="text-sm text-muted">No overlay elements yet — add one above.</p>}

      {overlays.map((o) => (
        <div key={o.id} className="border rounded-xl p-3 space-y-3 bg-surface-2/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{OVERLAY_TYPE_OPTIONS.find((t) => t.value === o.type)?.label ?? o.type}</span>
            <div className="flex items-center gap-2">
              <Toggle checked={o.enabled} onChange={(v) => update(o.id, { enabled: v })} />
              <button onClick={() => remove(o.id)} className="text-muted hover:text-danger transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <Field label={o.type === 'image' ? 'Image URL' : 'Text'}>
            <TextInput value={o.text} onChange={(e) => update(o.id, { text: e.target.value })} />
          </Field>
          {o.type !== 'image' && o.type !== 'badge' && (
            <Field label={o.type === 'call' ? 'Phone Number' : 'Link'}>
              <TextInput value={o.link} onChange={(e) => update(o.id, { link: e.target.value })} placeholder={o.type === 'call' ? '15551234567' : 'https://...'} />
            </Field>
          )}
          {o.type === 'image' && (
            <Field label="Image URL"><TextInput value={o.link} onChange={(e) => update(o.id, { link: e.target.value })} placeholder="https://.../image.png" /></Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position"><Select value={o.position} onChange={(v) => update(o.id, { position: v as Position })} options={POSITION_OPTIONS} /></Field>
            <Field label="Size"><Select value={o.size} onChange={(v) => update(o.id, { size: v as OverlayElement['size'] })} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} /></Field>
          </div>
          <Field label={`Opacity (${o.opacity}%)`}><Slider value={o.opacity} onChange={(v) => update(o.id, { opacity: v })} min={10} max={100} unit="%" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Border Radius (${o.borderRadius}px)`}><Slider value={o.borderRadius} onChange={(v) => update(o.id, { borderRadius: v })} min={0} max={32} /></Field>
            <Field label={`Font Size (${o.fontSize}px)`}><Slider value={o.fontSize} onChange={(v) => update(o.id, { fontSize: v })} min={10} max={24} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font Weight">
              <Select value={String(o.fontWeight)} onChange={(v) => update(o.id, { fontWeight: Number(v) as OverlayElement['fontWeight'] })} options={[{ value: '400', label: 'Regular' }, { value: '500', label: 'Medium' }, { value: '600', label: 'Semibold' }, { value: '700', label: 'Bold' }]} />
            </Field>
            <Field label="Animation">
              <Select value={o.animation} onChange={(v) => update(o.id, { animation: v as OverlayElement['animation'] })} options={[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' }, { value: 'bounce', label: 'Bounce' }]} />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}
