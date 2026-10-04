'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { RadioTrack } from '@/types';
import api from '@/lib/api';

interface RadioContextType {
  tracks: RadioTrack[];
  currentTrack: RadioTrack | null;
  isPlaying: boolean;
  isOnAir: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
}

const RadioContext = createContext<RadioContextType | null>(null);

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
}

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnAir, setIsOnAir] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadRadioData = useCallback(async () => {
    try {
      const [tracksData, configData] = await Promise.all([
        api.getRadioTracks().catch(() => []),
        api.getRadioConfig().catch(() => ({ isOnAir: true })),
      ]);
      setTracks(tracksData);
      setIsOnAir(configData.isOnAir !== false);
    } catch (err) {
      console.error('Failed to load radio data:', err);
    }
  }, []);

  // Initial load + periodic polling for On Air status sync
  useEffect(() => {
    loadRadioData();
    const interval = setInterval(loadRadioData, 15000);
    return () => clearInterval(interval);
  }, [loadRadioData]);

  // Initialize Audio Element and Event Listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (tracks.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Resilient error handler for broken links or network glitches
    const handleError = (e: Event) => {
      console.warn('Radio audio error, skipping to next track:', e);
      setIsPlaying(false);
      if (tracks.length > 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % tracks.length);
        }, 1000);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [tracks.length, volume]);

  // Load current track source safely
  useEffect(() => {
    if (tracks.length > 0 && audioRef.current && currentIndex < tracks.length) {
      const track = tracks[currentIndex];
      if (!track || !track.audioUrl) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3006';
      const targetSrc = `${baseUrl}${track.audioUrl}`;

      if (audioRef.current.src !== targetSrc) {
        audioRef.current.src = targetSrc;
        if (isPlaying) {
          audioRef.current.play().catch((err) => {
            console.warn('Autoplay prevented or playback error:', err);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentIndex, tracks, isPlaying]);

  const play = useCallback(() => {
    if (audioRef.current && tracks.length > 0) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Play request blocked by browser policy:', err);
        setIsPlaying(false);
      });
    }
  }, [tracks.length]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (tracks.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    }
  }, [tracks.length]);

  const prev = useCallback(() => {
    if (tracks.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  }, [tracks.length]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const currentTrack = tracks[currentIndex] || null;

  return (
    <RadioContext.Provider value={{
      tracks, currentTrack, isPlaying, isOnAir,
      currentTime, duration, volume,
      play, pause, toggle, next, prev, setVolume,
    }}>
      {children}
    </RadioContext.Provider>
  );
}
