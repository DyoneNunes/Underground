import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

interface FooterProps {
  variant?: 'tattoo' | 'barber' | 'landing';
}

export default function Footer({ variant = 'landing' }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${styles[variant]}`}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>⚡ UNDERGROUND</span>
          <p className={styles.tagline}>Tattoo Studio & Barber Shop</p>
        </div>

        <div className={styles.links}>
          <Link href="/tattoo" className={styles.link}>Tattoo Studio</Link>
          <Link href="/barber" className={styles.link}>Barbearia</Link>
          <Link href="/admin/login" className={styles.link}>Admin</Link>
        </div>

        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} Underground Tattoo. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
