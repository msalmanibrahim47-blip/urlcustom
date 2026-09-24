import type { Branding, CtaSettings, Presentation, WhatsappSettings } from './types';

export const defaultBranding: Branding = {
  logoUrl: null,
  faviconUrl: null,
  brandName: null,
  theme: 'light',
  accentColor: '#6366f1',
  backgroundColor: '#ffffff'
};

export const defaultPresentation: Presentation = {
  borderRadius: 12,
  frameWidth: '100%',
  frameHeight: '100%',
  defaultDevice: 'desktop'
};

export const defaultCta: CtaSettings = {
  enabled: false,
  text: 'Contact Us',
  url: '',
  position: 'bottom-right'
};

export const defaultWhatsapp: WhatsappSettings = {
  enabled: false,
  phoneNumber: '',
  message: 'Hi! I have a question.',
  position: 'bottom-left',
  color: '#25D366',
  size: 'md'
};
