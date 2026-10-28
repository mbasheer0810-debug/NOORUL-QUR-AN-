export type Language = 'ha' | 'ar';

export interface QuranWord {
  id: number;
  arabic: string;
  transliteration: string; // Hausa Latin
  hausa: string;
}

export interface TajweedNote {
  titleHa: string;
  titleAr: string;
  descriptionHa: string;
  descriptionAr: string;
  ruleType: 'ghunnah' | 'qalqalah' | 'madd' | 'idgham' | 'ikhfa' | 'general';
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  arabic: string;
  transliteration: string;
  hausaTranslation: string;
  audioKey: string; // e.g. "001001"
  words: QuranWord[];
  tajweedNotes?: TajweedNote[];
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameHausa: string;
  nameEnglish: string;
  meaningHausa: string;
  meaningArabic: string;
  revelationType: 'Makkah' | 'Madinah';
  revelationTypeHa: 'Makkiya' | 'Madaniyya';
  ayahCount: number;
  bismillahPre: boolean;
  lessonSummaryHa: string;
  lessonSummaryAr: string;
  ayahs: Ayah[];
  badgeNameHa: string;
  badgeNameAr: string;
}

export interface Reciter {
  id: string;
  nameArabic: string;
  nameHausa: string;
  subname: string;
  baseUrl: string;
  format: string; // e.g. "Husary_Muallim_128kbps"
}

export interface SurahProgress {
  surahNumber: number;
  learnedAyahs: number[]; // ayah numbers
  repeatedAyahs: number[];
  memorizedAyahs: number[];
  quizCompleted: boolean;
  score: number; // 0 - 100
  lastPracticed: string;
}

export interface UserProgress {
  childName: string;
  avatarId: string;
  totalStars: number;
  streakDays: number;
  lastActiveDate: string;
  surahProgress: Record<number, SurahProgress>;
  unlockedBadges: string[];
}
