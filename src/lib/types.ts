export type ProjectStatus = 'draft' | 'published' | 'unpublished';
export type EmbedMode = 'unknown' | 'embeddable' | 'blocked';
export type FallbackBehavior = 'show_fallback' | 'redirect';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface Project {
  id: string;
  owner_id: string;
  project_name: string;
  customer_name: string;
  website_url: string;
  description: string | null;
  slug: string;
  status: ProjectStatus;
  embed_mode: EmbedMode;
  fallback_behavior: FallbackBehavior;
  created_at: string;
  updated_at: string;
}

export interface Branding {
  logoUrl: string | null;
  faviconUrl: string | null;
  brandName: string | null;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  backgroundColor: string;
}

export interface Presentation {
  borderRadius: number;
  frameWidth: string;
  frameHeight: string;
  defaultDevice: DeviceMode;
}

export type OverlayType = 'announcement' | 'floating_cta' | 'contact' | 'whatsapp' | 'call' | 'text' | 'image' | 'badge';

export interface OverlayElement {
  id: string;
  type: OverlayType;
  enabled: boolean;
  text: string;
  link: string;
  position: Position;
  size: 'sm' | 'md' | 'lg';
  opacity: number; // 0-100
  borderRadius: number;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  animation: 'none' | 'fade' | 'slide' | 'bounce';
}

export interface CtaSettings {
  enabled: boolean;
  text: string;
  url: string;
  position: Position;
}

export interface WhatsappSettings {
  enabled: boolean;
  phoneNumber: string;
  message: string;
  position: Position;
  color: string;
  size: 'sm' | 'md' | 'lg';
}

export interface ProjectSettings {
  id: string;
  project_id: string;
  branding: Branding;
  presentation: Presentation;
  overlays: OverlayElement[];
  cta: CtaSettings;
  whatsapp: WhatsappSettings;
  updated_at: string;
}

export interface PlatformSettings {
  id: string;
  owner_id: string;
  platform_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  default_background: string;
  footer_text: string | null;
}

export interface DomainRecord {
  id: string;
  owner_id: string;
  project_id: string | null;
  domain: string;
  is_primary: boolean;
  status: 'pending' | 'verified' | 'error';
  ssl_status: 'pending' | 'active' | 'error';
  created_at: string;
}

export interface ProjectWithSettings extends Project {
  project_settings: ProjectSettings[] | ProjectSettings | null;
}
