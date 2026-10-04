'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>⚡</div>
          <h1 className={styles.title}>UNDERGROUND</h1>
          <p className={styles.subtitle}>Painel Administrativo CMS</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input id="login-email" className="form-input" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@underground.com" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Senha</label>
              <input id="login-password" className="form-input" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={`btn btn--primary-tattoo ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no CMS'}
            </button>
          </form>

          <div className={styles.hint}>
            <p>👑 <b>Super Admin:</b> admin@underground.com</p>
            <p>🖋️ <b>Tattoo Admin:</b> tattoo@underground.com</p>
            <p>💈 <b>Barber Admin:</b> barber@underground.com</p>
            <p>👕 <b>Store Admin:</b> store@underground.com</p>
            <p style={{ marginTop: 6, opacity: 0.8 }}>Senha para todos: <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
