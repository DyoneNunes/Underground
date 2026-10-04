'use client';

import React, { useEffect, useState, use } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import api, { getImageUrl } from '@/lib/api';
import { Site, Service, Professional, Event as EventType, ContactInfo, AvailableSlots, SiteMusicLink } from '@/types';
import styles from './page.module.css';

export default function DynamicSitePage({ params }: { params: Promise<{ site: string }> }) {
  const resolvedParams = use(params);
  const siteSlug = resolvedParams.site;

  const [siteData, setSiteData] = useState<Site | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [musicLinks, setMusicLinks] = useState<SiteMusicLink[]>([]);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Agenda tool state
  const [scheduleStep, setScheduleStep] = useState(1);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'done' | 'error'>('idle');

  useEffect(() => {
    const loadData = async () => {
      try {
        const site = await api.getSiteBySlug(siteSlug);
        setSiteData(site);

        const [s, p, e, c, m] = await Promise.all([
          api.getServices(siteSlug).catch(() => []),
          api.getProfessionals(siteSlug).catch(() => []),
          api.getEvents(siteSlug).catch(() => []),
          api.getContact(siteSlug).catch(() => null),
          api.getMusicLinks(siteSlug).catch(() => []),
        ]);
        setServices(s);
        setProfessionals(p);
        setEvents(e);
        setContact(c);
        setMusicLinks(m);
      } catch (err) {
        console.error('Failed to load site data:', err);
      }
    };
    loadData();
  }, [siteSlug]);

  useEffect(() => {
    if (selectedDate && selectedPro) {
      setLoadingSlots(true);
      api.getAvailableSlots(selectedDate, selectedPro.id)
        .then(setAvailableSlots)
        .catch(() => setAvailableSlots(null))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedPro]);

  const handleBook = async () => {
    if (!selectedPro || !selectedDate || !selectedTime || !clientName || !clientPhone) return;
    setBookingStatus('booking');
    try {
      await api.createAppointment({
        clientName, clientPhone, professionalId: selectedPro.id,
        date: selectedDate, time: selectedTime, service: selectedService || undefined,
      });
      setBookingStatus('done');
    } catch { setBookingStatus('error'); }
  };

  const handleWhatsAppBook = () => {
    if (!contact?.whatsapp || !selectedPro) return;
    const msg = `Olá! Gostaria de agendar:\n👤 ${clientName}\n📱 ${clientPhone}\n💈 ${selectedPro.name}\n📅 ${selectedDate}\n🕐 ${selectedTime}${selectedService ? `\n✂️ ${selectedService}` : ''}`;
    window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleWhatsAppDirectCall = () => {
    const phone = contact?.whatsapp || '5511999990001';
    const text = siteData?.whatsappCardMessage || `Olá! Gostaria de mais informações sobre ${siteData?.name || 'o estúdio'}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPhone = contact?.whatsapp || contact?.phone || '5511999990001';
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const formattedMsg = `Olá! Gostaria de entrar em contato via site:\n👤 *Nome:* ${formData.name}\n✉️ *Email:* ${formData.email}${formData.phone ? `\n📱 *Telefone:* ${formData.phone}` : ''}\n💬 *Mensagem:* ${formData.message}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedMsg)}`, '_blank');
    setFormStatus('sent');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setFormStatus('idle'), 4000);
  };

  const resetBooking = () => {
    setBookingStatus('idle');
    setScheduleStep(1);
    setSelectedPro(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
  };

  const accent = siteData?.accentColor || '#c41e3a';
  const showAgenda = siteData?.hasAgenda || siteSlug === 'barber';
  const showWhatsappCard = siteData?.hasWhatsappCard !== false;
  const showMusicPlayer = siteData?.hasMusicPlayer !== false;

  return (
    <div className={styles.page}>
      <Header variant="landing" />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {siteData?.badge && (
            <div
              className={styles.heroBadge}
              style={{ color: accent, borderColor: `${accent}40` }}
            >
              {siteData.badge}
            </div>
          )}
          <h1 className={styles.heroTitle}>{siteData?.title || siteData?.name || 'UNDERGROUND'}</h1>
          {siteData?.subtitle && (
            <p className={styles.heroSubtitle}>{siteData.subtitle}</p>
          )}
          <a
            href="#servicos"
            className="btn"
            style={{ background: accent, color: '#fff' }}
          >
            Explorar {siteData?.name || 'Serviços'}
          </a>
        </div>
        <div className={styles.heroScroll}>
          <span>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className={`section ${styles.sectionAlt}`}>
        <div className="container">
          <div>
            <h2 className="section-title" style={{ color: accent }}>
              {siteSlug === 'store' ? 'CATÁLOGO DE PRODUTOS' : 'NOSSOS SERVIÇOS'}
            </h2>
            <p className="section-subtitle">
              {siteSlug === 'store'
                ? 'Conheça nossas peças e coleções exclusivas.'
                : 'Conheça as especialidades e técnicas que dominamos.'}
            </p>
          </div>
          <div className="grid grid--3">
            {services.map((service) => (
              <div key={service.id} className="card">
                <div className="card__image-wrapper">
                  {getImageUrl(service.imageUrl) ? (
                    <img src={getImageUrl(service.imageUrl)} alt={service.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'var(--bg-elevated)' }}>
                      {siteData?.badge?.[0] || '⚡'}
                    </div>
                  )}
                </div>
                <div className="card__body">
                  <h3 className="card__title">{service.name}</h3>
                  <p className="card__description">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Professionals Section */}
      {professionals.length > 0 && (
        <section id="profissionais" className="section">
          <div className="container">
            <div>
              <h2 className="section-title" style={{ color: accent }}>
                {siteSlug === 'store' ? 'CURADORIA & DESIGN' : 'NOSSA EQUIPE'}
              </h2>
              <p className="section-subtitle">Profissionais qualificados prontos para atender você.</p>
            </div>
            <div className="grid grid--3">
              {professionals.map((pro) => (
                <div key={pro.id} className={styles.proCard}>
                  <div className={styles.proAvatar}>
                    {getImageUrl(pro.imageUrl) ? (
                      <img src={getImageUrl(pro.imageUrl)} alt={pro.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className={styles.proInitial}>{pro.name[0]}</span>
                    )}
                  </div>
                  <h3 className={styles.proName}>{pro.name}</h3>
                  {pro.specialty && <span className={styles.proSpecialty}>{pro.specialty}</span>}
                  <p className={styles.proBio}>{pro.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tool Template 1: Agenda / Agendamento WIDGET */}
      {showAgenda && (
        <section id="agendamento" className={`section ${styles.sectionAlt}`}>
          <div className="container container--narrow">
            <div>
              <h2 className="section-title" style={{ color: accent }}>AGENDA & AGENDAMENTO</h2>
              <p className="section-subtitle">Escolha o profissional, selecione a data e o horário disponível.</p>
            </div>

            {bookingStatus === 'done' ? (
              <div className={styles.scheduleCard}>
                <div className={styles.bookingSuccess}>
                  <span className={styles.successIcon}>✅</span>
                  <h3>Agendamento Confirmado!</h3>
                  <p>Seu horário foi reservado com sucesso.</p>
                  <button className="btn" style={{ background: accent, color: '#fff' }} onClick={resetBooking}>Novo Agendamento</button>
                </div>
              </div>
            ) : (
              <div className={styles.scheduleCard}>
                <div className={styles.steps}>
                  {[1, 2, 3].map((step) => (
                    <div key={step} className={`${styles.step} ${scheduleStep >= step ? styles.stepActive : ''}`}>
                      <div className={styles.stepNumber}>{step}</div>
                      <span className={styles.stepLabel}>{step === 1 ? 'Profissional' : step === 2 ? 'Data & Hora' : 'Confirmação'}</span>
                    </div>
                  ))}
                </div>

                {scheduleStep === 1 && (
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>Escolha o Profissional</h3>
                    <div className={styles.proSelect}>
                      {professionals.map((pro) => (
                        <button key={pro.id} className={`${styles.proOption} ${selectedPro?.id === pro.id ? styles.proOptionActive : ''}`} onClick={() => setSelectedPro(pro)}>
                          <div className={styles.proOptAvatar}>{pro.name[0]}</div>
                          <div><div className={styles.proOptName}>{pro.name}</div><div className={styles.proOptSpec}>{pro.specialty}</div></div>
                        </button>
                      ))}
                    </div>
                    <button className="btn" style={{ background: accent, color: '#fff', width: '100%', marginTop: '16px' }} disabled={!selectedPro} onClick={() => setScheduleStep(2)}>Continuar</button>
                  </div>
                )}

                {scheduleStep === 2 && (
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>Escolha Data e Horário</h3>
                    <div className="form-group">
                      <label className="form-label">Serviço (opcional)</label>
                      <select className="form-input" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                        <option value="">Selecione</option>
                        {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Data</label>
                      <input type="date" className="form-input" min={getMinDate()} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} />
                    </div>
                    {selectedDate && (
                      <div className={styles.slotsSection}>
                        <label className="form-label">Horários Disponíveis na Agenda</label>
                        {loadingSlots ? <p>Carregando horários...</p> : availableSlots?.available ? (
                          <div className={styles.slotsGrid}>
                            {availableSlots.slots.map((slot) => (
                              <button key={slot} className={`${styles.slotBtn} ${selectedTime === slot ? styles.slotBtnActive : ''}`} onClick={() => setSelectedTime(slot)}>{slot}</button>
                            ))}
                          </div>
                        ) : <p>{availableSlots?.message || 'Sem horários nesta data.'}</p>}
                      </div>
                    )}
                    <div className={styles.stepActions}>
                      <button className="btn btn--outline" onClick={() => setScheduleStep(1)}>Voltar</button>
                      <button className="btn" style={{ background: accent, color: '#fff' }} disabled={!selectedDate || !selectedTime} onClick={() => setScheduleStep(3)}>Continuar</button>
                    </div>
                  </div>
                )}

                {scheduleStep === 3 && (
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>Confirme seus Dados</h3>
                    <div className={styles.summary}>
                      <div className={styles.summaryItem}><span className={styles.summaryLabel}>Profissional</span><span>{selectedPro?.name}</span></div>
                      <div className={styles.summaryItem}><span className={styles.summaryLabel}>Data</span><span>{selectedDate && new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR')}</span></div>
                      <div className={styles.summaryItem}><span className={styles.summaryLabel}>Horário</span><span>{selectedTime}</span></div>
                    </div>
                    <div className="form-group"><label className="form-label">Seu Nome *</label><input className="form-input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome completo" /></div>
                    <div className="form-group"><label className="form-label">Seu Telefone *</label><input className="form-input" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-0000" /></div>
                    <div className={styles.stepActions}>
                      <button className="btn btn--outline" onClick={() => setScheduleStep(2)}>Voltar</button>
                      <button className="btn" style={{ background: accent, color: '#fff' }} disabled={!clientName || !clientPhone || bookingStatus === 'booking'} onClick={handleBook}>{bookingStatus === 'booking' ? 'Agendando...' : 'Confirmar'}</button>
                    </div>
                    {contact?.whatsapp && <button className="btn btn--outline" style={{ marginTop: 12, width: '100%' }} onClick={handleWhatsAppBook} disabled={!clientName || !clientPhone}>💬 Confirmar via WhatsApp</button>}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tool Template 2: Card de Chamada Rápida WhatsApp */}
      {showWhatsappCard && (
        <section className="section">
          <div className="container">
            <div className={styles.whatsappCallCard}>
              <div className={styles.waIcon}>💬</div>
              <h2 className={styles.waTitle}>
                {siteData?.whatsappCardTitle || 'Atendimento Direto no WhatsApp'}
              </h2>
              <p className={styles.waText}>
                {siteData?.whatsappCardText || 'Fale diretamente com nossa equipe para orçamentos, tirar dúvidas ou agendamentos rápidos.'}
              </p>
              <button
                className={styles.waActionBtn}
                onClick={handleWhatsAppDirectCall}
              >
                <span>Falar pelo WhatsApp Agora</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tool Template 3: Seção de Músicas & Links de Música */}
      {showMusicPlayer && musicLinks.length > 0 && (
        <section className={`section ${styles.sectionAlt}`}>
          <div className="container">
            <div>
              <h2 className="section-title" style={{ color: accent }}>PLAYLIST & LINKS DE MÚSICA</h2>
              <p className="section-subtitle">Ouça as trilhas e playlists oficiais que embalam nossa atmosfera.</p>
            </div>
            <div className={styles.musicGrid}>
              {musicLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.musicCard}
                >
                  <div className={styles.musicBadge}>
                    {item.type === 'spotify' ? '🎧' : item.type === 'soundcloud' ? '☁️' : item.type === 'youtube' ? '▶️' : '🎵'}
                  </div>
                  <div>
                    <h3 className={styles.musicTitle}>{item.title}</h3>
                    {item.artist && <div className={styles.musicArtist}>{item.artist}</div>}
                    <div className={styles.musicType}>{item.type.toUpperCase()} • Ouvir agora ➔</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section id="eventos" className="section">
          <div className="container">
            <div>
              <h2 className="section-title" style={{ color: accent }}>EVENTOS & CONVENÇÕES</h2>
              <p className="section-subtitle">Participe dos nossos eventos e novidades.</p>
            </div>
            <div className="grid grid--2">
              {events.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventDay}>{new Date(event.date).getDate()}</span>
                    <span className={styles.eventMonth}>{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                  </div>
                  <div className={styles.eventInfo}>
                    {getImageUrl(event.imageUrl || '') && (
                      <img src={getImageUrl(event.imageUrl || '')} alt={event.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    )}
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDesc}>{event.description}</p>
                    {event.location && <span className={styles.eventLocation}>📍 {event.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contato" className={`section ${styles.sectionAlt}`}>
        <div className="container">
          <div>
            <h2 className="section-title" style={{ color: accent }}>CONTATO</h2>
            <p className="section-subtitle">Dúvidas, orçamentos ou pedidos? Entre em contato.</p>
          </div>
          <div className={styles.contactGrid}>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Nome</label><input className="form-input" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Seu nome" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" /></div>
              <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-0000" /></div>
              <div className="form-group"><label className="form-label">Mensagem</label><textarea className="form-input form-textarea" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Sua mensagem..." /></div>
              <button type="submit" className="btn" style={{ background: accent, color: '#fff', width: '100%' }} disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Enviando...' : formStatus === 'sent' ? '✓ Enviada!' : formStatus === 'error' ? 'Erro. Tentar novamente' : 'Enviar Mensagem'}
              </button>
            </form>
            <div className={styles.contactInfo}>
              {contact?.phone && <div className={styles.contactItem}><span className={styles.contactIconEmoji}>📞</span><div><span className={styles.contactLabel}>Telefone</span><span className={styles.contactValue}>{contact.phone}</span></div></div>}
              {contact?.email && <div className={styles.contactItem}><span className={styles.contactIconEmoji}>✉️</span><div><span className={styles.contactLabel}>Email</span><span className={styles.contactValue}>{contact.email}</span></div></div>}
              {contact?.address && <div className={styles.contactItem}><span className={styles.contactIconEmoji}>📍</span><div><span className={styles.contactLabel}>Endereço</span><span className={styles.contactValue}>{contact.address}</span></div></div>}
              {contact?.instagram && <div className={styles.contactItem}><span className={styles.contactIconEmoji}>📸</span><div><span className={styles.contactLabel}>Instagram</span><span className={styles.contactValue}>{contact.instagram}</span></div></div>}
              {contact?.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`btn ${styles.whatsappBtn}`} style={{ background: accent, color: '#fff' }}>💬 WhatsApp</a>}
              {contact?.latitude && contact?.longitude && (
                <div className={styles.mapContainer}>
                  <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${contact.longitude - 0.01}%2C${contact.latitude - 0.01}%2C${contact.longitude + 0.01}%2C${contact.latitude + 0.01}&layer=mapnik&marker=${contact.latitude}%2C${contact.longitude}`} width="100%" height="250" style={{ border: 0, borderRadius: '12px' }} loading="lazy" title="Localização" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}
