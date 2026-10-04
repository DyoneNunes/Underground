'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RadioPlayer from './RadioPlayer';
import styles from './Header.module.css';

interface HeaderProps {
  variant?: 'tattoo' | 'barber' | 'landing';
}

export default function Header({ variant = 'landing' }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTattoo = variant === 'tattoo';
  const isBarber = variant === 'barber';

  const navLinks = isTattoo
    ? [
        { href: '#servicos', label: 'Serviços' },
        { href: '#tatuadores', label: 'Tatuadores' },
        { href: '#eventos', label: 'Eventos' },
        { href: '#contato', label: 'Contato' },
      ]
    : isBarber
      ? [
          { href: '#servicos', label: 'Serviços' },
          { href: '#profissionais', label: 'Barbeiros' },
          { href: '#agendamento', label: 'Agendar' },
          { href: '#eventos', label: 'Eventos' },
          { href: '#contato', label: 'Contato' },
        ]
      : [];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${styles[variant]}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>UNDERGROUND</span>
        </Link>

        {navLinks.length > 0 && (
          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.navLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className={styles.actions}>
          <RadioPlayer />

          {variant !== 'landing' && (
            <Link
              href={variant === 'tattoo' ? '/barber' : '/tattoo'}
              className={styles.switchBtn}
            >
              {variant === 'tattoo' ? '💈 Barbearia' : '🖋️ Tattoo'}
            </Link>
          )}

          {navLinks.length > 0 && (
            <button
              className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
