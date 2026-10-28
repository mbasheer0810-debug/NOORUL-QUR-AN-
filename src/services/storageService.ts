import { UserProgress, Language } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';

const STORAGE_KEY = 'noorul_quran_user_progress_v1';
const LANG_KEY = 'noorul_quran_lang_pref';
const RECITER_KEY = 'noorul_quran_reciter_pref';
const TRANSLIT_KEY = 'noorul_quran_show_translit';

export function getDefaultProgress(): UserProgress {
  const initialSurahProgress: UserProgress['surahProgress'] = {};

  SURAHS_DATA.forEach((surah) => {
    initialSurahProgress[surah.number] = {
      surahNumber: surah.number,
      learnedAyahs: [],
      repeatedAyahs: [],
      memorizedAyahs: [],
      quizCompleted: false,
      score: 0,
      lastPracticed: '',
    };
  });

  return {
    childName: 'Dan/Yar Makarantar Alƙur\'ani',
    avatarId: '1',
    totalStars: 5, // Welcoming gift stars for encouragement!
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    surahProgress: initialSurahProgress,
    unlockedBadges: [],
  };
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultProgress();
      saveUserProgress(initial);
      return initial;
    }
    const data: UserProgress = JSON.parse(raw);

    // Verify all current surahs exist in progress
    SURAHS_DATA.forEach((surah) => {
      if (!data.surahProgress[surah.number]) {
        data.surahProgress[surah.number] = {
          surahNumber: surah.number,
          learnedAyahs: [],
          repeatedAyahs: [],
          memorizedAyahs: [],
          quizCompleted: false,
          score: 0,
          lastPracticed: '',
        };
      }
    });

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (data.lastActiveDate !== today) {
      const last = new Date(data.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        data.streakDays += 1;
      } else if (diffDays > 1) {
        data.streakDays = 1; // Reset or restart streak
      }
      data.lastActiveDate = today;
      saveUserProgress(data);
    }

    return data;
  } catch {
    return getDefaultProgress();
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress locally:', e);
  }
}

export function getLanguagePreference(): Language {
  try {
    const lang = localStorage.getItem(LANG_KEY);
    return lang === 'ar' ? 'ar' : 'ha';
  } catch {
    return 'ha';
  }
}

export function setLanguagePreference(lang: Language): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // LocalStorage fallback
  }
}

export function getReciterPreference(): string {
  try {
    return localStorage.getItem(RECITER_KEY) || 'husary_muallim';
  } catch {
    return 'husary_muallim';
  }
}

export function setReciterPreference(reciterId: string): void {
  try {
    localStorage.setItem(RECITER_KEY, reciterId);
  } catch {
    // LocalStorage fallback
  }
}

export function getTranslitPreference(): boolean {
  try {
    const val = localStorage.getItem(TRANSLIT_KEY);
    return val !== 'false'; // Default to true for children
  } catch {
    return true;
  }
}

export function setTranslitPreference(show: boolean): void {
  try {
    localStorage.setItem(TRANSLIT_KEY, String(show));
  } catch {
    // LocalStorage fallback
  }
}
