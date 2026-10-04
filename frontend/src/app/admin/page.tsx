'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Site } from '@/types';
import api from '@/lib/api';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api';

export default function UnifiedCMSAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [activeTab, setActiveTab] = useState('services');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modals & form state
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // New/Edit Site form
  const [siteForm, setSiteForm] = useState({
    name: '', slug: '', title: '', subtitle: '', badge: '', accentColor: '#c41e3a', order: '0',
    hasAgenda: false, hasWhatsappCard: true, whatsappCardTitle: 'Atendimento Direto no WhatsApp',
    whatsappCardText: 'Fale com nossa equipe para dúvidas, orçamentos ou agendamentos.',
    whatsappCardMessage: 'Olá! Vim pelo site.', hasMusicPlayer: true,
  });

  // Tools Config Form for active site
  const [siteToolsForm, setSiteToolsForm] = useState({
    hasAgenda: false,
    hasWhatsappCard: true,
    whatsappCardTitle: '',
    whatsappCardText: '',
    whatsappCardMessage: '',
    hasMusicPlayer: true,
  });
  const [toolsStatus, setToolsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Items forms
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', order: '0' });
  const [proForm, setProForm] = useState({ name: '', specialty: '', bio: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
  const [heroForm, setHeroForm] = useState({ altText: '', order: '0' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contactForm, setContactForm] = useState({ phone: '', whatsapp: '', email: '', address: '', instagram: '', latitude: '', longitude: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [musicLinkForm, setMusicLinkForm] = useState({ title: '', artist: '', url: '', type: 'spotify', order: '0' });
  const [radioForm, setRadioForm] = useState({ title: '', artist: '', order: '0' });
  const [radioOnAir, setRadioOnAir] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { router.push('/admin/login'); return; }
    const u: User = JSON.parse(stored);
    setUser(u);
    loadSites(u);
  }, [router]);

  const getToken = () => localStorage.getItem('token') || '';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSites = async (currentUser: User) => {
    try {
      const allSites = await api.getAllSites(getToken());
      setSites(allSites);

      if (allSites.length > 0) {
        if (currentUser.siteId) {
          const userSite = allSites.find(s => s.id === currentUser.siteId) || allSites[0];
          setSelectedSite(userSite);
          initSiteToolsForm(userSite);
        } else {
          setSelectedSite(allSites[0]);
          initSiteToolsForm(allSites[0]);
        }
      }
    } catch (err) {
      console.error('Error loading sites:', err);
    }
  };

  const initSiteToolsForm = (site: Site) => {
    setSiteToolsForm({
      hasAgenda: !!site.hasAgenda,
      hasWhatsappCard: site.hasWhatsappCard !== false,
      whatsappCardTitle: site.whatsappCardTitle || 'Atendimento Direto no WhatsApp',
      whatsappCardText: site.whatsappCardText || 'Fale com nossa equipe para dúvidas ou orçamentos.',
      whatsappCardMessage: site.whatsappCardMessage || `Olá! Vim pelo site da ${site.name}.`,
      hasMusicPlayer: site.hasMusicPlayer !== false,
    });
  };

  useEffect(() => {
    if (selectedSite) {
      initSiteToolsForm(selectedSite);
      loadData();
    }
  }, [selectedSite, activeTab]);

  const loadData = async () => {
    if (!selectedSite) return;
    setLoading(true);
    try {
      if (activeTab === 'contact') {
        const res = await fetch(`${API}/contact/${selectedSite.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const c = await res.json().catch(() => ({}));
        setContactForm({
          phone: c.phone || '', whatsapp: c.whatsapp || '', email: c.email || '',
          address: c.address || '', instagram: c.instagram || '',
          latitude: c.latitude != null ? String(c.latitude) : '',
          longitude: c.longitude != null ? String(c.longitude) : '',
        });
        setData([]);
      } else if (activeTab === 'radio') {
        const [tracksRes, cfgRes] = await Promise.all([
          fetch(`${API}/radio/tracks/all`, { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch(`${API}/radio/config`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        ]);
        const tracks = await tracksRes.json().catch(() => []);
        const cfg = await cfgRes.json().catch(() => ({ isOnAir: false }));
        setData(Array.isArray(tracks) ? tracks : []);
        setRadioOnAir(!!cfg.isOnAir);
      } else if (activeTab === 'music') {
        const res = await fetch(`${API}/music/all?site=${selectedSite.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const json = await res.json().catch(() => []);
        setData(Array.isArray(json) ? json : []);
      } else {
        let endpoint = '';
        if (activeTab === 'appointments') endpoint = '/appointments';
        else if (activeTab === 'messages') endpoint = `/contact/messages/${selectedSite.id}`;
        else endpoint = `/${activeTab}/all?site=${selectedSite.id}`;

        const res = await fetch(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const json = await res.json().catch(() => []);
        setData(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    }
    setLoading(false);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      const newSite = await api.createSite({
        name: siteForm.name,
        slug: siteForm.slug,
        title: siteForm.title,
        subtitle: siteForm.subtitle,
        badge: siteForm.badge,
        accentColor: siteForm.accentColor,
        order: parseInt(siteForm.order) || 0,
        hasAgenda: siteForm.hasAgenda,
        hasWhatsappCard: siteForm.hasWhatsappCard,
        whatsappCardTitle: siteForm.whatsappCardTitle,
        whatsappCardText: siteForm.whatsappCardText,
        whatsappCardMessage: siteForm.whatsappCardMessage,
        hasMusicPlayer: siteForm.hasMusicPlayer,
        isTemplate: true,
      }, getToken());

      setShowSiteModal(false);
      showToast('Nova Unidade cadastrada com sucesso!');
      if (user) loadSites(user);
      setSelectedSite(newSite);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar unidade');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSaveTools = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    setToolsStatus('saving');
    try {
      const updated = await api.updateSite(selectedSite.id, siteToolsForm, getToken());
      setSelectedSite(updated);
      setToolsStatus('saved');
      showToast('Ferramentas e Templates atualizados!');
      setTimeout(() => setToolsStatus('idle'), 2500);
    } catch {
      setToolsStatus('error');
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade? Todos os dados vinculados a ela serão apagados.')) return;
    try {
      await api.deleteSite(siteId, getToken());
      showToast('Unidade excluída');
      if (user) loadSites(user);
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir unidade', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    const endpoint = activeTab === 'radio' ? `/radio/tracks/${id}` : activeTab === 'music' ? `/music/${id}` : `/${activeTab}/${id}`;
    await fetch(`${API}${endpoint}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    showToast('Excluído com sucesso!');
    loadData();
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    setContactStatus('saving');
    try {
      const res = await fetch(`${API}/contact/${selectedSite.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contactForm.phone || null,
          whatsapp: contactForm.whatsapp || null,
          email: contactForm.email || null,
          address: contactForm.address || null,
          instagram: contactForm.instagram || null,
          latitude: contactForm.latitude ? parseFloat(contactForm.latitude) : null,
          longitude: contactForm.longitude ? parseFloat(contactForm.longitude) : null,
        }),
      });
      if (!res.ok) throw new Error('falha');
      setContactStatus('saved');
      showToast('Contato salvo!');
      setTimeout(() => setContactStatus('idle'), 2500);
    } catch { setContactStatus('error'); }
  };

  const toggleOnAir = async () => {
    const next = !radioOnAir;
    setRadioOnAir(next);
    try {
      await fetch(`${API}/radio/config`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnAir: next }),
      });
      showToast(next ? '📻 Rádio no ar!' : 'Rádio fora do ar');
    } catch { setRadioOnAir(!next); }
  };

  const resetItemForms = () => {
    setServiceForm({ name: '', description: '', order: '0' });
    setProForm({ name: '', specialty: '', bio: '' });
    setEventForm({ title: '', description: '', date: '', location: '' });
    setHeroForm({ altText: '', order: '0' });
    setMusicLinkForm({ title: '', artist: '', url: '', type: 'spotify', order: '0' });
    setRadioForm({ title: '', artist: '', order: '0' });
    setSelectedFile(null);
  };

  const openCreateItem = () => {
    setError('');
    setEditingItem(null);
    resetItemForms();
    setShowItemModal(true);
  };

  const openEditItem = (item: any) => {
    setError('');
    setSelectedFile(null);
    setEditingItem(item);
    if (activeTab === 'services') setServiceForm({ name: item.name || '', description: item.description || '', order: String(item.order ?? 0) });
    else if (activeTab === 'professionals') setProForm({ name: item.name || '', specialty: item.specialty || '', bio: item.bio || '' });
    else if (activeTab === 'events') setEventForm({ title: item.title || '', description: item.description || '', date: item.date ? String(item.date).slice(0, 10) : '', location: item.location || '' });
    else if (activeTab === 'hero') setHeroForm({ altText: item.altText || '', order: String(item.order ?? 0) });
    else if (activeTab === 'music') setMusicLinkForm({ title: item.title || '', artist: item.artist || '', url: item.url || '', type: item.type || 'spotify', order: String(item.order ?? 0) });
    else if (activeTab === 'radio') setRadioForm({ title: item.title || '', artist: item.artist || '', order: String(item.order ?? 0) });
    setShowItemModal(true);
  };

  const toggleActive = async (item: any) => {
    const endpoint = activeTab === 'radio' ? `/radio/tracks/${item.id}` : activeTab === 'music' ? `/music/${item.id}` : `/${activeTab}/${item.id}`;
    await fetch(`${API}${endpoint}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    });
    showToast('Status atualizado!');
    loadData();
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    await fetch(`${API}/appointments/${id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const handleCreateOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite && activeTab !== 'radio') return;
    setSubmitLoading(true);
    setError('');

    try {
      let body: any = null;
      let headers: any = { Authorization: `Bearer ${getToken()}` };
      let isMultipart = false;
      const formData = new FormData();
      const isEdit = !!editingItem;

      if (activeTab === 'services') {
        formData.append('name', serviceForm.name);
        formData.append('description', serviceForm.description);
        formData.append('order', serviceForm.order);
        formData.append('siteId', selectedSite!.id);
        if (selectedFile) formData.append('image', selectedFile);
        isMultipart = true;
      } else if (activeTab === 'professionals') {
        formData.append('name', proForm.name);
        formData.append('bio', proForm.bio);
        formData.append('specialty', proForm.specialty);
        formData.append('siteId', selectedSite!.id);
        if (selectedFile) formData.append('image', selectedFile);
        isMultipart = true;
      } else if (activeTab === 'events') {
        formData.append('title', eventForm.title);
        formData.append('description', eventForm.description);
        formData.append('date', eventForm.date);
        formData.append('location', eventForm.location);
        formData.append('siteId', selectedSite!.id);
        if (selectedFile) formData.append('image', selectedFile);
        isMultipart = true;
      } else if (activeTab === 'hero') {
        if (!isEdit && !selectedFile) {
          setError('Selecione uma imagem para fazer upload');
          setSubmitLoading(false);
          return;
        }
        if (selectedFile) formData.append('image', selectedFile);
        formData.append('altText', heroForm.altText);
        formData.append('order', heroForm.order);
        formData.append('siteId', selectedSite!.id);
        isMultipart = true;
      } else if (activeTab === 'music') {
        body = JSON.stringify({
          title: musicLinkForm.title,
          artist: musicLinkForm.artist,
          url: musicLinkForm.url,
          type: musicLinkForm.type,
          order: parseInt(musicLinkForm.order) || 0,
          siteId: selectedSite!.id,
        });
        headers['Content-Type'] = 'application/json';
      } else if (activeTab === 'radio') {
        if (isEdit) {
          body = JSON.stringify({ title: radioForm.title, artist: radioForm.artist, order: parseInt(radioForm.order) || 0 });
          headers['Content-Type'] = 'application/json';
        } else {
          if (!selectedFile) {
            setError('Selecione um arquivo de áudio para upload');
            setSubmitLoading(false);
            return;
          }
          formData.append('audio', selectedFile);
          formData.append('title', radioForm.title);
          formData.append('artist', radioForm.artist);
          formData.append('order', radioForm.order);
          isMultipart = true;
        }
      }

      let endpoint = activeTab === 'radio' ? '/radio/tracks' : activeTab === 'music' ? '/music' : `/${activeTab}`;
      if (isEdit) endpoint = activeTab === 'radio' ? `/radio/tracks/${editingItem.id}` : activeTab === 'music' ? `/music/${editingItem.id}` : `/${activeTab}/${editingItem.id}`;

      const res = await fetch(`${API}${endpoint}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: isMultipart ? { Authorization: `Bearer ${getToken()}` } : headers,
        body: isMultipart ? formData : body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
        throw new Error(errData.error || 'Erro ao salvar item');
      }

      setShowItemModal(false);
      showToast(editingItem ? 'Alterações salvas!' : 'Cadastrado com sucesso!');
      resetItemForms();
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin/login');
  };

  const tabs = [
    { key: 'services', label: '✂️ Serviços / Produtos' },
    { key: 'professionals', label: '👤 Equipe / Artistas' },
    { key: 'tools', label: '⚙️ Ferramentas & Templates' },
    { key: 'appointments', label: '📋 Agendamentos / Agenda' },
    { key: 'events', label: '📅 Eventos & Convenções' },
    { key: 'hero', label: '🖼️ Hero & Backgrounds' },
    { key: 'contact', label: '📍 Contato & Mapa' },
    // Rádio é global: só o super admin gerencia (a API também bloqueia)
    ...(user?.role === 'SUPER_ADMIN' ? [{ key: 'radio', label: '📻 Rádio Global' }] : []),
  ];

  const renderTable = () => {
    if (loading) return <p className={styles.loadingText}>Carregando dados do CMS...</p>;

    if (activeTab === 'tools') {
      return (
        <form onSubmit={handleSaveTools} style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>CONFIGURAÇÃO DE FERRAMENTAS E TEMPLATES</h3>

          <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, cursor: 'pointer', fontSize: '1.05rem' }}>
              <input type="checkbox" checked={siteToolsForm.hasAgenda} onChange={e => setSiteToolsForm({ ...siteToolsForm, hasAgenda: e.target.checked })} style={{ width: 20, height: 20 }} />
              📅 Ativar Ferramenta de Agenda / Agendamentos
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6, marginLeft: 32 }}>
              Exibe o seletor de profissional, datas e horários na página pública para que clientes reservem direto.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, cursor: 'pointer', fontSize: '1.05rem' }}>
              <input type="checkbox" checked={siteToolsForm.hasWhatsappCard} onChange={e => setSiteToolsForm({ ...siteToolsForm, hasWhatsappCard: e.target.checked })} style={{ width: 20, height: 20 }} />
              💬 Ativar Card de Chamadas para WhatsApp
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 32 }}>
              Exibe um card de alta conversão convidando o visitante para conversar diretamente no WhatsApp.
            </p>
            {siteToolsForm.hasWhatsappCard && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <div className="form-group"><label className="form-label">Título do Card</label><input className="form-input" value={siteToolsForm.whatsappCardTitle} onChange={e => setSiteToolsForm({ ...siteToolsForm, whatsappCardTitle: e.target.value })} placeholder="Atendimento Direto no WhatsApp" /></div>
                <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-input form-textarea" value={siteToolsForm.whatsappCardText} onChange={e => setSiteToolsForm({ ...siteToolsForm, whatsappCardText: e.target.value })} placeholder="Fale com nossa equipe..." /></div>
                <div className="form-group"><label className="form-label">Mensagem Pronta do WhatsApp</label><input className="form-input" value={siteToolsForm.whatsappCardMessage} onChange={e => setSiteToolsForm({ ...siteToolsForm, whatsappCardMessage: e.target.value })} placeholder="Olá! Vim pelo site." /></div>
              </div>
            )}
          </div>


          <button className="btn" style={{ background: selectedSite?.accentColor || '#c41e3a', color: '#fff', width: 'fit-content', marginTop: 8 }} disabled={toolsStatus === 'saving'}>
            {toolsStatus === 'saving' ? 'Salvando...' : toolsStatus === 'saved' ? '✓ Configuração Salva!' : 'Salvar Ferramentas'}
          </button>
        </form>
      );
    }

    if (activeTab === 'music') {
      return (
        <div>
          {!data.length ? (
            <p className={styles.emptyText}>Nenhum link de música cadastrado nesta unidade. Clique em &quot;+ Adicionar Novo&quot;.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Plataforma</th><th>Título</th><th>Artista / Descrição</th><th>Link URL</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {data.map((item: any) => (
                    <tr key={item.id}>
                      <td className={styles.tdBold}>{item.type?.toUpperCase()}</td>
                      <td>{item.title}</td>
                      <td>{item.artist || '-'}</td>
                      <td className={styles.tdMuted} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>{item.url}</a>
                      </td>
                      <td><span className={`${styles.badge} ${item.active ? styles.badgeActive : styles.badgeInactive}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>{item.active ? 'Ativo' : 'Inativo'}</span></td>
                      <td><button className={styles.deleteBtn} onClick={() => openEditItem(item)}>✏️</button><button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'contact') {
      return (
        <form onSubmit={handleSaveContact} style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="(11) 99999-0000" /></div>
          <div className="form-group"><label className="form-label">WhatsApp (com DDI — ex: 5511999990000)</label><input className="form-input" value={contactForm.whatsapp} onChange={e => setContactForm({ ...contactForm, whatsapp: e.target.value })} placeholder="5511999990000" /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="contato@underground.com" /></div>
          <div className="form-group"><label className="form-label">Endereço</label><input className="form-input" value={contactForm.address} onChange={e => setContactForm({ ...contactForm, address: e.target.value })} placeholder="Rua Exemplo, 123 - Centro" /></div>
          <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" value={contactForm.instagram} onChange={e => setContactForm({ ...contactForm, instagram: e.target.value })} placeholder="@underground" /></div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Latitude</label><input className="form-input" value={contactForm.latitude} onChange={e => setContactForm({ ...contactForm, latitude: e.target.value })} placeholder="-23.5505" /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Longitude</label><input className="form-input" value={contactForm.longitude} onChange={e => setContactForm({ ...contactForm, longitude: e.target.value })} placeholder="-46.6333" /></div>
          </div>
          <button className="btn" style={{ background: selectedSite?.accentColor || '#c41e3a', color: '#fff', width: 'fit-content', marginTop: 8 }} disabled={contactStatus === 'saving'}>
            {contactStatus === 'saving' ? 'Salvando...' : contactStatus === 'saved' ? '✓ Salvo!' : 'Salvar Contato'}
          </button>
        </form>
      );
    }

    if (activeTab === 'radio') {
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontWeight: 600 }}>Status da Rádio Global:</span>
            <span className={`${styles.badge} ${radioOnAir ? styles.badgeActive : styles.badgeInactive}`}>
              {radioOnAir ? '🔴 No Ar' : '⚫ Fora do Ar'}
            </span>
            <button className="btn btn--outline" style={{ marginLeft: 'auto' }} onClick={toggleOnAir}>
              {radioOnAir ? 'Tirar do Ar' : 'Colocar no Ar'}
            </button>
          </div>
          {!data.length ? (
            <p className={styles.emptyText}>Nenhuma faixa cadastrada. Clique em &quot;+ Adicionar Novo&quot;.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Título</th><th>Artista</th><th>Ordem</th><th>Ativo</th><th>Ações</th></tr></thead>
                <tbody>
                  {data.map((item: any) => (
                    <tr key={item.id}>
                      <td className={styles.tdBold}>{item.title}</td>
                      <td>{item.artist || '-'}</td>
                      <td>{item.order}</td>
                      <td><span className={`${styles.badge} ${item.active ? styles.badgeActive : styles.badgeInactive}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>{item.active ? 'Sim' : 'Não'}</span></td>
                      <td><button className={styles.deleteBtn} onClick={() => openEditItem(item)}>✏️</button><button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (!data.length) return <p className={styles.emptyText}>Nenhum item cadastrado nesta seção.</p>;

    if (activeTab === 'appointments') {
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Profissional</th><th>Data</th><th>Horário</th><th>Serviço</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td className={styles.tdBold}>{item.clientName}</td>
                  <td>{item.clientPhone}</td>
                  <td>{item.professional?.name || '-'}</td>
                  <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td>{item.time}</td>
                  <td>{item.service || '-'}</td>
                  <td><span className={styles.badge}>{item.status}</span></td>
                  <td>
                    {item.status === 'pending' && (
                      <>
                        <button className={styles.deleteBtn} onClick={() => updateAppointmentStatus(item.id, 'confirmed')}>✓</button>
                        <button className={styles.deleteBtn} onClick={() => updateAppointmentStatus(item.id, 'cancelled')}>✕</button>
                      </>
                    )}
                    <button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'services') {
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Nome</th><th>Descrição</th><th>Ordem</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td className={styles.tdBold}>{item.name}</td>
                  <td className={styles.tdMuted}>{item.description?.substring(0, 60)}...</td>
                  <td>{item.order}</td>
                  <td><span className={`${styles.badge} ${item.active ? styles.badgeActive : styles.badgeInactive}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>{item.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td><button className={styles.deleteBtn} onClick={() => openEditItem(item)}>✏️</button><button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'professionals') {
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Nome</th><th>Especialidade</th><th>Bio</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td className={styles.tdBold}>{item.name}</td>
                  <td>{item.specialty || '-'}</td>
                  <td className={styles.tdMuted}>{item.bio?.substring(0, 50)}...</td>
                  <td><span className={`${styles.badge} ${item.active ? styles.badgeActive : styles.badgeInactive}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>{item.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td><button className={styles.deleteBtn} onClick={() => openEditItem(item)}>✏️</button><button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'events') {
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Título</th><th>Data</th><th>Local</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td className={styles.tdBold}>{item.title}</td>
                  <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td>{item.location || '-'}</td>
                  <td><span className={`${styles.badge} ${item.active ? styles.badgeActive : styles.badgeInactive}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>{item.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td><button className={styles.deleteBtn} onClick={() => openEditItem(item)}>✏️</button><button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'hero') {
      const baseUrl = API.replace('/api', '');
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Preview</th><th>Alt Text</th><th>Ordem</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.imageUrl ? <img src={`${baseUrl}${item.imageUrl}`} alt={item.altText} className={styles.heroThumbnail} /> : '-'}</td>
                  <td>{item.altText || '-'}</td>
                  <td>{item.order}</td>
                  <td><span className={`${styles.badge} ${item.active ? styles.badgeActive : styles.badgeInactive}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>{item.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td><button className={styles.deleteBtn} onClick={() => openEditItem(item)}>✏️</button><button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'messages') {
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Nome</th><th>Email</th><th>Mensagem</th><th>Data</th></tr></thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td className={styles.tdBold}>{item.name}</td>
                  <td>{item.email}</td>
                  <td className={styles.tdMuted}>{item.message}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>⚡</span>
          <span className={styles.sidebarTitle}>UNDERGROUND CMS</span>
        </div>

        {/* Site Selector Dropdown */}
        <div className={styles.siteSelector}>
          <span className={styles.siteSelectorLabel}>Unidade / Site Ativo</span>
          <select
            className={styles.siteSelectDropdown}
            value={selectedSite?.id || ''}
            onChange={(e) => {
              const target = sites.find(s => s.id === e.target.value);
              if (target) {
                setSelectedSite(target);
                initSiteToolsForm(target);
              }
            }}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.isDefault ? '⭐ ' : s.badge ? `${s.badge} ` : ''}{s.name} (/{s.slug})
              </option>
            ))}
          </select>

          {user.role === 'SUPER_ADMIN' && (
            <button className={styles.newSiteBtn} onClick={() => setShowSiteModal(true)}>
              + Nova Unidade (Template)
            </button>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.navItem} ${activeTab === tab.key ? styles.navItemActive : ''}`}
              style={{
                borderLeftColor: activeTab === tab.key ? (selectedSite?.accentColor || '#c41e3a') : undefined,
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div>
            <span className={styles.userName}>{user.name}</span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>
              {tabs.find(t => t.key === activeTab)?.label}
            </h1>
            {selectedSite && (
              <span style={{ fontSize: '0.85rem', color: selectedSite.accentColor, fontWeight: 600 }}>
                Unidade: {selectedSite.name} {selectedSite.isDefault ? '(DEFAULT)' : ''} (/{selectedSite.slug})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {user.role === 'SUPER_ADMIN' && selectedSite && !selectedSite.isDefault && (
              <button
                className="btn btn--outline"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => handleDeleteSite(selectedSite.id)}
              >
                🗑️ Excluir Unidade
              </button>
            )}

            {activeTab !== 'messages' && activeTab !== 'contact' && activeTab !== 'tools' && (
              <button
                className={styles.addBtn}
                style={{ background: selectedSite?.accentColor || '#c41e3a' }}
                onClick={openCreateItem}
              >
                + Adicionar Novo
              </button>
            )}
          </div>
        </header>

        <div className={styles.content}>{renderTable()}</div>
      </main>

      {/* Modal for Creating NEW SITE */}
      {showSiteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>+ Criar Nova Unidade (Template)</h2>
              <button className={styles.closeBtn} onClick={() => setShowSiteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSite} className={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Nome da Unidade *</label>
                <input className="form-input" required value={siteForm.name}
                  onChange={e => setSiteForm({ ...siteForm, name: e.target.value })} placeholder="Ex: Estúdio de Gravação & Produção" />
              </div>
              <div className="form-group">
                <label className="form-label">Slug / Rota URL *</label>
                <input className="form-input" value={siteForm.slug}
                  onChange={e => setSiteForm({ ...siteForm, slug: e.target.value })} placeholder="Ex: studio (gerará /studio)" />
              </div>
              <div className="form-group">
                <label className="form-label">Título do Banner Hero *</label>
                <input className="form-input" required value={siteForm.title}
                  onChange={e => setSiteForm({ ...siteForm, title: e.target.value })} placeholder="Ex: GRAVAÇÃO & PRODUÇÃO MUSICAL" />
              </div>
              <div className="form-group">
                <label className="form-label">Subtítulo</label>
                <input className="form-input" value={siteForm.subtitle}
                  onChange={e => setSiteForm({ ...siteForm, subtitle: e.target.value })} placeholder="Ex: Equipamentos vintage e acústica de alta precisão." />
              </div>
              <div className="form-group">
                <label className="form-label">Badge (Emoji + Texto)</label>
                <input className="form-input" value={siteForm.badge}
                  onChange={e => setSiteForm({ ...siteForm, badge: e.target.value })} placeholder="Ex: 🎙️ ESTÚDIO DE MÚSICA" />
              </div>
              <div className="form-group">
                <label className="form-label">Cor de Destaque / Tema (HEX)</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={siteForm.accentColor} onChange={e => setSiteForm({ ...siteForm, accentColor: e.target.value })} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                  <input className="form-input" value={siteForm.accentColor} onChange={e => setSiteForm({ ...siteForm, accentColor: e.target.value })} placeholder="#c41e3a" />
                </div>
              </div>

              {/* Tool Toggles */}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={siteForm.hasAgenda} onChange={e => setSiteForm({ ...siteForm, hasAgenda: e.target.checked })} />
                  📅 Incluir Ferramenta de Agenda / Agendamentos
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={siteForm.hasWhatsappCard} onChange={e => setSiteForm({ ...siteForm, hasWhatsappCard: e.target.checked })} />
                  💬 Incluir Card de Chamadas para WhatsApp
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={siteForm.hasMusicPlayer} onChange={e => setSiteForm({ ...siteForm, hasMusicPlayer: e.target.checked })} />
                  🎧 Incluir Player e Links de Música
                </label>
              </div>

              {error && <p className={styles.modalError}>{error}</p>}

              <button className="btn" style={{ background: siteForm.accentColor || '#c41e3a', color: '#fff', marginTop: 16 }} disabled={submitLoading}>
                {submitLoading ? 'Criando...' : 'Criar Unidade Instantaneamente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Creating/Editing ITEMS */}
      {showItemModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? 'Editar' : 'Novo'} Item</h2>
              <button className={styles.closeBtn} onClick={() => setShowItemModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOrUpdateItem} className={styles.modalForm}>
              {activeTab === 'services' && (
                <>
                  <div className="form-group"><label className="form-label">Nome</label><input className="form-input" required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="Ex: Blackwork Tattoo / Corte" /></div>
                  <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-input form-textarea" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Detalhes..." /></div>
                  <div className="form-group"><label className="form-label">Ordem</label><input className="form-input" type="number" value={serviceForm.order} onChange={e => setServiceForm({ ...serviceForm, order: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Imagem (opcional)</label><input className="form-input" type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} /></div>
                </>
              )}

              {activeTab === 'professionals' && (
                <>
                  <div className="form-group"><label className="form-label">Nome</label><input className="form-input" required value={proForm.name} onChange={e => setProForm({ ...proForm, name: e.target.value })} placeholder="Ex: Marcos Silva" /></div>
                  <div className="form-group"><label className="form-label">Especialidade</label><input className="form-input" value={proForm.specialty} onChange={e => setProForm({ ...proForm, specialty: e.target.value })} placeholder="Ex: Tattoo / Barba" /></div>
                  <div className="form-group"><label className="form-label">Biografia</label><textarea className="form-input form-textarea" value={proForm.bio} onChange={e => setProForm({ ...proForm, bio: e.target.value })} placeholder="Biografia..." /></div>
                  <div className="form-group"><label className="form-label">Foto (opcional)</label><input className="form-input" type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} /></div>
                </>
              )}

              {activeTab === 'music' && (
                <>
                  <div className="form-group"><label className="form-label">Título da Música ou Playlist *</label><input className="form-input" required value={musicLinkForm.title} onChange={e => setMusicLinkForm({ ...musicLinkForm, title: e.target.value })} placeholder="Ex: Playlist Tattoo Vibes" /></div>
                  <div className="form-group"><label className="form-label">Artista / Descrição</label><input className="form-input" value={musicLinkForm.artist} onChange={e => setMusicLinkForm({ ...musicLinkForm, artist: e.target.value })} placeholder="Ex: Curadoria Estúdio" /></div>
                  <div className="form-group"><label className="form-label">Plataforma</label>
                    <select className="form-input" value={musicLinkForm.type} onChange={e => setMusicLinkForm({ ...musicLinkForm, type: e.target.value })}>
                      <option value="spotify">Spotify Link</option>
                      <option value="soundcloud">SoundCloud Link</option>
                      <option value="youtube">YouTube Link</option>
                      <option value="audio">Áudio Direto / MP3</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">URL do Link *</label><input className="form-input" required value={musicLinkForm.url} onChange={e => setMusicLinkForm({ ...musicLinkForm, url: e.target.value })} placeholder="https://open.spotify.com/..." /></div>
                  <div className="form-group"><label className="form-label">Ordem</label><input className="form-input" type="number" value={musicLinkForm.order} onChange={e => setMusicLinkForm({ ...musicLinkForm, order: e.target.value })} /></div>
                </>
              )}

              {activeTab === 'events' && (
                <>
                  <div className="form-group"><label className="form-label">Título</label><input className="form-input" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Ex: Convenção de Tattoo" /></div>
                  <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-input form-textarea" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Data</label><input className="form-input" type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Local</label><input className="form-input" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Imagem (opcional)</label><input className="form-input" type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} /></div>
                </>
              )}

              {activeTab === 'hero' && (
                <>
                  <div className="form-group"><label className="form-label">Imagem de Fundo</label><input className="form-input" type="file" accept="image/*" required={!editingItem} onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} /></div>
                  <div className="form-group"><label className="form-label">Alt Text</label><input className="form-input" value={heroForm.altText} onChange={e => setHeroForm({ ...heroForm, altText: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Ordem</label><input className="form-input" type="number" value={heroForm.order} onChange={e => setHeroForm({ ...heroForm, order: e.target.value })} /></div>
                </>
              )}

              {activeTab === 'radio' && (
                <>
                  {!editingItem && <div className="form-group"><label className="form-label">Áudio (MP3)</label><input className="form-input" type="file" accept="audio/*" required onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} /></div>}
                  <div className="form-group"><label className="form-label">Título</label><input className="form-input" required value={radioForm.title} onChange={e => setRadioForm({ ...radioForm, title: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Artista</label><input className="form-input" value={radioForm.artist} onChange={e => setRadioForm({ ...radioForm, artist: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Ordem</label><input className="form-input" type="number" value={radioForm.order} onChange={e => setRadioForm({ ...radioForm, order: e.target.value })} /></div>
                </>
              )}

              {error && <p className={styles.modalError}>{error}</p>}

              <button className="btn" style={{ background: selectedSite?.accentColor || '#c41e3a', color: '#fff', marginTop: 16 }} disabled={submitLoading}>
                {submitLoading ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, padding: '14px 22px', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', background: toast.type === 'error' ? '#ef4444' : '#22c55e' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
