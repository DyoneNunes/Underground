const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers: {
      ...(!(rest.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Sites (Multi-Tenant & Tools Templates)
  getSites: () =>
    fetchApi<import('@/types').Site[]>('/sites'),

  getAllSites: (token?: string) =>
    fetchApi<import('@/types').Site[]>('/sites/all', { token }),

  getSiteBySlug: (slug: string) =>
    fetchApi<import('@/types').Site>(`/sites/${slug}`),

  createSite: (data: Partial<import('@/types').Site>, token?: string) =>
    fetchApi<import('@/types').Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  updateSite: (id: string, data: Partial<import('@/types').Site>, token?: string) =>
    fetchApi<import('@/types').Site>(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteSite: (id: string, token?: string) =>
    fetchApi<{ message: string }>(`/sites/${id}`, {
      method: 'DELETE',
      token,
    }),

  // Music Links per Site (Spotify/SoundCloud/YouTube/Audio)
  getMusicLinks: (site: string) =>
    fetchApi<import('@/types').SiteMusicLink[]>(`/music?site=${site}`),

  getAllMusicLinks: (site: string, token?: string) =>
    fetchApi<import('@/types').SiteMusicLink[]>(`/music/all?site=${site}`, { token }),

  createMusicLink: (data: Partial<import('@/types').SiteMusicLink>, token?: string) =>
    fetchApi<import('@/types').SiteMusicLink>('/music', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  updateMusicLink: (id: string, data: Partial<import('@/types').SiteMusicLink>, token?: string) =>
    fetchApi<import('@/types').SiteMusicLink>(`/music/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteMusicLink: (id: string, token?: string) =>
    fetchApi<{ message: string }>(`/music/${id}`, {
      method: 'DELETE',
      token,
    }),

  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: import('@/types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    fetchApi<import('@/types').User>('/auth/me', { token }),

  // Services
  getServices: (site: string) =>
    fetchApi<import('@/types').Service[]>(`/services?site=${site}`),

  // Professionals
  getProfessionals: (site: string) =>
    fetchApi<import('@/types').Professional[]>(`/professionals?site=${site}`),

  // Events
  getEvents: (site: string) =>
    fetchApi<import('@/types').Event[]>(`/events?site=${site}`),

  // Contact
  getContact: (site: string) =>
    fetchApi<import('@/types').ContactInfo>(`/contact/${site}`),

  sendContactMessage: (data: { name: string; email: string; phone?: string; message: string; siteId?: string; siteType?: string }) =>
    fetchApi('/contact/message', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Hero
  getHeroImages: (site: string) =>
    fetchApi<import('@/types').HeroImage[]>(`/hero?site=${site}`),

  // Radio
  getRadioTracks: () =>
    fetchApi<import('@/types').RadioTrack[]>('/radio/tracks'),

  getRadioConfig: () =>
    fetchApi<import('@/types').RadioConfig>('/radio/config'),

  // Appointments
  getAvailableSlots: (date: string, professionalId: string) =>
    fetchApi<import('@/types').AvailableSlots>(`/appointments/available?date=${date}&professionalId=${professionalId}`),

  createAppointment: (data: {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    professionalId: string;
    date: string;
    time: string;
    service?: string;
  }) =>
    fetchApi<import('@/types').Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export function getImageUrl(path: string): string {
  if (!path || path.includes('placeholder')) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3006';
  return `${baseUrl}${path}`;
}

export default api;
