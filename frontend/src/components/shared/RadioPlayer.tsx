'use client';

import React from 'react';
import { useRadio } from '@/contexts/RadioContext';
import styles from './RadioPlayer.module.css';

export default function RadioPlayer() {
  const { currentTrack, isPlaying, isOnAir, toggle, next, prev, volume, setVolume } = useRadio();

  if (!isOnAir) return null;

  return (
    <div className={styles.player}>
      <div className={styles.soundwave}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`${styles.bar} ${isPlaying ? styles.barActive : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      <button className={styles.controlBtn} onClick={prev} aria-label="Anterior">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <button className={styles.playBtn} onClick={toggle} aria-label={isPlaying ? 'Pausar' : 'Tocar'}>
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button className={styles.controlBtn} onClick={next} aria-label="Próxima">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      <div className={styles.trackInfo}>
        <span className={styles.trackTitle}>
          {currentTrack ? currentTrack.title : 'Sem faixas'}
        </span>
        {currentTrack?.artist && (
          <span className={styles.trackArtist}>{currentTrack.artist}</span>
        )}
      </div>

      <div className={styles.volumeControl}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={styles.volumeIcon}>
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className={styles.volumeSlider}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
