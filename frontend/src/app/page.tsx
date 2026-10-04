'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import api, { getImageUrl } from '@/lib/api';
import { Site } from '@/types';
import styles from './page.module.css';

export default function SplitLandingPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [heroBgs, setHeroBgs] = useState<Record<string, string>>({});
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);

  useEffect(() => {
    const loadSitesAndHeroes = async () => {
      try {
        const loadedSites = await api.getSites();
        setSites(loadedSites);

        const bgs: Record<string, string> = {};
        for (const s of loadedSites) {
          const heroes = await api.getHeroImages(s.slug).catch(() => []);
          if (heroes && heroes.length > 0) {
            const activeHero = heroes.find(h => h.active) || heroes[0];
            bgs[s.id] = getImageUrl(activeHero.imageUrl);
          }
        }
        setHeroBgs(bgs);
      } catch (err) {
        console.error('Failed to load landing sites:', err);
      }
    };

    loadSitesAndHeroes();
  }, []);

  return (
    <div className={styles.page}>
      <Header variant="landing" />

      <main className={styles.splitWrapper}>
        {sites.map((site) => {
          const isHovered = hoveredSiteId === site.id;
          const isOtherHovered = hoveredSiteId !== null && !isHovered;
          const bg = heroBgs[site.id];

          return (
            <Link
              key={site.id}
              href={`/${site.slug}`}
              className={`${styles.panel} ${isHovered ? styles.expanded : isOtherHovered ? styles.shrunk : ''}`}
              onMouseEnter={() => setHoveredSiteId(site.id)}
              onMouseLeave={() => setHoveredSiteId(null)}
              style={{
                borderTop: site.accentColor ? `3px solid ${site.accentColor}` : undefined,
              }}
            >
              <div
                className={styles.bgImage}
                style={{
                  backgroundImage: bg ? `url(${bg})` : undefined,
                  backgroundColor: site.accentColor ? `${site.accentColor}12` : '#0b0b0b',
                }}
              />
              <div className={styles.overlay} />

              <div className={styles.centerText}>
                <span className={styles.centerLine}>{site.title}</span>
                <p className={styles.centerSubtitle}>UNDERGROUND 027</p>
              </div>

              <div className={styles.panelContent}>
                {site.badge && (
                  <span
                    className={styles.badge}
                    style={{
                      borderColor: site.accentColor ? `${site.accentColor}60` : undefined,
                      color: site.accentColor || undefined,
                    }}
                  >
                    {site.badge}
                  </span>
                )}
                <h2 className={styles.panelBrand}>{site.name}</h2>
                {site.subtitle && (
                  <p className={styles.panelText}>{site.subtitle}</p>
                )}
                <span
                  className={styles.cta}
                  style={{ color: site.accentColor || undefined }}
                >
                  Acessar {site.name}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
