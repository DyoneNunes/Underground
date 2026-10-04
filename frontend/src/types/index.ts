export interface Site {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  accentColor: string;
  isDefault?: boolean;
  isTemplate?: boolean;
  hasAgenda?: boolean;
  hasWhatsappCard?: boolean;
  whatsappCardTitle?: string | null;
  whatsappCardText?: string | null;
  whatsappCardMessage?: string | null;
  hasMusicPlayer?: boolean;
  active: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteMusicLink {
  id: string;
  title: string;
  artist?: string | null;
  url: string;
  type: 'audio' | 'spotify' | 'soundcloud' | 'youtube' | string;
  siteId: string;
  active: boolean;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SITE_ADMIN';
  siteId?: string | null;
  siteSlug?: string | null;
  siteName?: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  siteId: string;
  active: boolean;
  order: number;
}

export interface Professional {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  specialty: string | null;
  siteId: string;
  active: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  date: string;
  location: string | null;
  siteId: string;
  active: boolean;
}

export interface ContactInfo {
  id?: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  instagram: string | null;
  siteId?: string;
}

export interface HeroImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  order: number;
  siteId: string;
  active: boolean;
}

export interface RadioTrack {
  id: string;
  title: string;
  artist: string | null;
  audioUrl: string;
  order: number;
  active: boolean;
}

export interface RadioConfig {
  id: string;
  isOnAir: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  professionalId: string;
  professional?: { name: string; imageUrl?: string };
  date: string;
  time: string;
  service: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
}

export interface AvailableSlots {
  available: boolean;
  slots: string[];
  message?: string;
}
