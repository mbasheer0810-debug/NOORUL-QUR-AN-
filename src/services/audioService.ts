import { RECITERS } from '../data/quranData';

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentAyahKey: string | null;
  playbackRate: number;
  reciterId: string;
  isBuffering: boolean;
}

const CACHE_NAME = 'noorul-quran-audio-v1';
const WORKBOX_AUDIO_CACHE = 'quran-audio-cache';

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentReciterId: string = 'husary_muallim';
  private playbackRate: number = 1.0;
  private listeners: ((state: AudioPlaybackState) => void)[] = [];
  private onEndedCallback: (() => void) | null = null;
  private currentKey: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.addEventListener('ended', () => {
        this.notify();
        if (this.onEndedCallback) {
          const cb = this.onEndedCallback;
          this.onEndedCallback = null;
          cb();
        }
      });

      this.audio.addEventListener('playing', () => this.notify());
      this.audio.addEventListener('pause', () => this.notify());
      this.audio.addEventListener('waiting', () => this.notify());
      this.audio.addEventListener('canplay', () => this.notify());
      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error, attempting fallback or cache:', e);
        this.notify();
      });
    }
  }

  public subscribe(listener: (state: AudioPlaybackState) => void) {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): AudioPlaybackState {
    return {
      isPlaying: !this.audio?.paused && !this.audio?.ended && (this.audio?.currentTime || 0) > 0,
      currentAyahKey: this.currentKey,
      playbackRate: this.playbackRate,
      reciterId: this.currentReciterId,
      isBuffering: this.audio?.readyState ? this.audio.readyState < 3 : false,
    };
  }

  public setReciter(reciterId: string) {
    this.currentReciterId = reciterId;
    this.notify();
  }

  public getReciterId(): string {
    return this.currentReciterId;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.notify();
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getAudioUrl(audioKey: string, reciterId?: string): string {
    const rid = reciterId || this.currentReciterId;
    const reciter = RECITERS.find((r) => r.id === rid) || RECITERS[0];
    return `${reciter.baseUrl}/${audioKey}.mp3`;
  }

  /**
   * Pre-fetch and cache an audio file into CacheStorage for offline playback
   */
  public async cacheAudioFile(audioKey: string, reciterId?: string): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      const url = this.getAudioUrl(audioKey, reciterId);
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) return true;

      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        await cache.put(url, response.clone());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if an audio file is already cached offline across any cache bucket
   */
  public async isAudioCached(audioKey: string, reciterId?: string): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      const url = this.getAudioUrl(audioKey, reciterId);
      const cacheNames = [CACHE_NAME, WORKBOX_AUDIO_CACHE];
      for (const name of cacheNames) {
        try {
          if (await caches.has(name)) {
            const cache = await caches.open(name);
            const match = await cache.match(url);
            if (match) return true;
          }
        } catch {
          // continue
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get total number of cached audio files
   */
  public async getCachedCount(): Promise<number> {
    if (typeof window === 'undefined' || !('caches' in window)) return 0;
    try {
      let count = 0;
      if (await caches.has(CACHE_NAME)) {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        count += keys.length;
      }
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Play an Ayah audio by audioKey (e.g., "001001")
   */
  public async playAyah(audioKey: string, onEnded?: () => void): Promise<void> {
    if (!this.audio) return;

    this.onEndedCallback = onEnded || null;
    const targetUrl = this.getAudioUrl(audioKey);

    // If same audio is currently playing, toggle pause
    if (this.currentKey === audioKey && !this.audio.paused && !this.audio.ended) {
      this.audio.pause();
      this.notify();
      return;
    }

    try {
      this.currentKey = audioKey;
      let playableUrl = targetUrl;

      // Check CacheStorage first for instant offline playback
      if ('caches' in window) {
        try {
          const cacheNames = [CACHE_NAME, WORKBOX_AUDIO_CACHE];
          for (const cName of cacheNames) {
            if (await caches.has(cName)) {
              const cache = await caches.open(cName);
              const cachedResponse = await cache.match(targetUrl);
              if (cachedResponse) {
                const blob = await cachedResponse.blob();
                playableUrl = URL.createObjectURL(blob);
                break;
              }
            }
          }
        } catch {
          // fallback to online URL
        }
      }

      this.audio.src = playableUrl;
      this.audio.playbackRate = this.playbackRate;
      await this.audio.play();
      this.notify();

      // Background cache this file if online and not yet cached
      if (playableUrl === targetUrl && 'caches' in window && navigator.onLine) {
        this.cacheAudioFile(audioKey);
      }
    } catch (err) {
      console.warn('Audio playback was prevented or failed:', err);
      this.notify();
      if (onEnded) {
        setTimeout(onEnded, 1500); // Simulate completion if playback fails
      }
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.currentKey = null;
    this.onEndedCallback = null;
    this.notify();
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.notify();
  }

  public isPlayingKey(audioKey: string): boolean {
    return this.currentKey === audioKey && !this.audio?.paused && !this.audio?.ended;
  }
}

export const audioService = new AudioService();
