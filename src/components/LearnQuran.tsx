import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCircle2, Star, Sparkles, BookOpen, Repeat, Brain, Award, Gauge, Info } from 'lucide-react';
import { Language, UserProgress, Surah, Ayah, QuranWord } from '../types/quran';
import { SURAHS_DATA, RECITERS } from '../data/quranData';
import { audioService, AudioPlaybackState } from '../services/audioService';
import { soundService } from '../services/soundService';

interface LearnQuranProps {
  initialSurahNumber?: number;
  language: Language;
  userProgress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onNavigateTab: (tab: 'learn' | 'repeat' | 'memorize' | 'progress', surahNumber?: number) => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  onOpenCelebration: (data: {
    titleHa: string;
    titleAr: string;
    messageHa: string;
    messageAr: string;
    stars: number;
    badgeHa?: string;
    badgeAr?: string;
  }) => void;
}

export const LearnQuran: React.FC<LearnQuranProps> = ({
  initialSurahNumber = 1,
  language,
  userProgress,
  onUpdateProgress,
  onNavigateTab,
  showTransliteration,
  onToggleTransliteration,
  onOpenCelebration,
}) => {
  const isHa = language === 'ha';
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [activeWord, setActiveWord] = useState<QuranWord | null>(null);
  const [audioState, setAudioState] = useState<AudioPlaybackState>(audioService.getState());
  const [isAutoPlayNext, setIsAutoPlayNext] = useState<boolean>(true);

  const currentSurah = SURAHS_DATA.find((s) => s.number === selectedSurahNumber) || SURAHS_DATA[0];

  useEffect(() => {
    if (initialSurahNumber) {
      setSelectedSurahNumber(initialSurahNumber);
    }
  }, [initialSurahNumber]);

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
    });
    return () => {
      unsubscribe();
      audioService.stop();
    };
  }, []);

  const handlePlayAyah = (ayah: Ayah) => {
    soundService.playClick();
    if (audioService.isPlayingKey(ayah.audioKey)) {
      audioService.pause();
    } else {
      audioService.playAyah(ayah.audioKey, () => {
        // Auto play next ayah if enabled
        if (isAutoPlayNext) {
          const currentIndex = currentSurah.ayahs.findIndex((a) => a.numberInSurah === ayah.numberInSurah);
          if (currentIndex !== -1 && currentIndex < currentSurah.ayahs.length - 1) {
            const nextAyah = currentSurah.ayahs[currentIndex + 1];
            handlePlayAyah(nextAyah);
          }
        }
      });
    }
  };

  const handlePlayEntireSurah = () => {
    if (audioState.isPlaying) {
      audioService.pause();
    } else {
      if (currentSurah.ayahs.length > 0) {
        setIsAutoPlayNext(true);
        handlePlayAyah(currentSurah.ayahs[0]);
      }
    }
  };

  const handleToggleLearned = (ayah: Ayah) => {
    soundService.playCorrectWord();
    const updated = { ...userProgress };
    const sp = updated.surahProgress[currentSurah.number] || {
      surahNumber: currentSurah.number,
      learnedAyahs: [],
      repeatedAyahs: [],
      memorizedAyahs: [],
      quizCompleted: false,
      score: 0,
      lastPracticed: '',
    };

    const isAlreadyLearned = sp.learnedAyahs.includes(ayah.numberInSurah);
    if (isAlreadyLearned) {
      sp.learnedAyahs = sp.learnedAyahs.filter((num) => num !== ayah.numberInSurah);
    } else {
      sp.learnedAyahs.push(ayah.numberInSurah);
      updated.totalStars += 2; // +2 stars for learning an ayah!

      // Check if all ayahs in surah are learned
      if (sp.learnedAyahs.length === currentSurah.ayahCount) {
        updated.totalStars += 5; // Bonus stars!
        onOpenCelebration({
          titleHa: `Masha'Allah! Ka Koyi ${currentSurah.nameHausa}!`,
          titleAr: `ما شاء الله! أتممت تعلم ${currentSurah.nameArabic}!`,
          messageHa: `Ka karanta dukkan ayoyin ${currentSurah.nameHausa}. Yanzu za ka iya maimaitawa ko haddacewa!`,
          messageAr: `أتممت قراءة جميع آيات السورة المباركة. استمر في الترديد والحفظ!`,
          stars: 7,
          badgeHa: currentSurah.badgeNameHa,
          badgeAr: currentSurah.badgeNameAr,
        });
      }
    }

    sp.lastPracticed = new Date().toISOString();
    updated.surahProgress[currentSurah.number] = sp;
    onUpdateProgress(updated);
  };

  const surahProgress = userProgress.surahProgress[currentSurah.number];
  const learnedAyahs = surahProgress?.learnedAyahs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <BookOpen className="h-4 w-4" />
            <span>{isHa ? 'Sashe na 1: Koyon Alƙur\'ani' : 'القسم الأول: تعلّم القرآن الكريم'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {isHa ? currentSurah.nameHausa : currentSurah.nameArabic}{' '}
            <span className="font-quran text-emerald-800 font-bold ml-2">({currentSurah.nameArabic})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            {isHa
              ? `${currentSurah.meaningHausa} · ${currentSurah.ayahCount} Ayoyi (${currentSurah.revelationTypeHa})`
              : `${currentSurah.meaningArabic} · ${currentSurah.ayahCount} آيات (${currentSurah.revelationType === 'Makkah' ? 'مكية' : 'مدنية'})`}
          </p>
        </div>

        {/* Quick Tabs to Repeat and Memorize */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => onNavigateTab('repeat', currentSurah.number)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-slate-900 transition btn-tactile cursor-pointer shadow-xs"
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>{isHa ? 'Maimaita Surar' : 'ترديد السورة'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('memorize', currentSurah.number)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white transition btn-tactile cursor-pointer shadow-xs"
          >
            <Brain className="h-3.5 w-3.5" />
            <span>{isHa ? 'Haddace Surar' : 'حفظ السورة'}</span>
          </button>
        </div>
      </div>

      {/* Surah Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {SURAHS_DATA.map((surah) => {
          const isSelected = surah.number === selectedSurahNumber;
          const p = userProgress.surahProgress[surah.number];
          const isCompleted = p?.learnedAyahs?.length === surah.ayahCount;

          return (
            <button
              key={surah.number}
              onClick={() => {
                soundService.playClick();
                setSelectedSurahNumber(surah.number);
                audioService.stop();
              }}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition whitespace-nowrap cursor-pointer btn-tactile shrink-0 border-2 ${
                isSelected
                  ? 'bg-emerald-800 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold ${
                  isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {surah.number}
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">
                  {isHa ? surah.nameHausa : surah.nameArabic}
                </p>
                <p className={`text-[10px] font-medium ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                  {surah.ayahCount} {isHa ? 'Ayoyi' : 'آيات'}
                </p>
              </div>
              {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Reciter Controls & Audio Deck */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-950 p-4 sm:p-5 text-white shadow-lg border border-amber-400/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Reciter Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-inner">
              <Volume2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                {isHa ? 'Malamin Karatu' : 'القارئ المعتمد'}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {RECITERS.map((r) => {
                  const isCurrent = audioState.reciterId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        soundService.playClick();
                        audioService.setReciter(r.id);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-900 shadow-sm'
                          : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                      }`}
                    >
                      {isHa ? r.nameHausa.split('(')[0] : r.nameArabic.split('(')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Controls: Play Whole Surah, Speed, Transliteration */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            {/* Speed toggle (0.75x slow for kids / 1.0x normal) */}
            <button
              onClick={() => {
                const nextSpeed = audioState.playbackRate === 1.0 ? 0.75 : 1.0;
                audioService.setPlaybackRate(nextSpeed);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-white/20 border border-white/10 transition cursor-pointer"
              title={isHa ? "Saurin Karatu (0.75x a hankali ga yara)" : "سرعة التلاوة الميسرة للأطفال"}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span>{audioState.playbackRate === 0.75 ? (isHa ? 'A Hankali (0.75x)' : 'بطيء (0.75x)') : (isHa ? 'Daidai (1.0x)' : 'عادي (1.0x)')}</span>
            </button>

            {/* Transliteration toggle */}
            <button
              onClick={onToggleTransliteration}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer border ${
                showTransliteration
                  ? 'bg-amber-400 text-slate-900 border-amber-300'
                  : 'bg-white/10 text-emerald-100 border-white/10 hover:bg-white/20'
              }`}
            >
              {isHa ? (showTransliteration ? 'Bayanin Harafi: A Kunne' : 'Bayanin Harafi: A Kashe') : (showTransliteration ? 'اللفظ اللاتيني: مفعل' : 'اللفظ اللاتيني: معطل')}
            </button>

            {/* Play/Pause Surah Button */}
            <button
              onClick={handlePlayEntireSurah}
              className="btn-tactile flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-extrabold text-slate-900 shadow-md hover:from-amber-300 hover:to-amber-400 transition cursor-pointer"
            >
              {audioState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-900" />}
              <span>{audioState.isPlaying ? (isHa ? 'Dakata' : 'إيقاف') : (isHa ? 'Kunna Surar Duka' : 'تشغيل السورة كاملة')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bismillah Header (if applicable) */}
      {currentSurah.bismillahPre && (
        <div className="rounded-2xl bg-amber-50/80 p-4 text-center border border-amber-300/80 shadow-xs">
          <p className="font-quran text-2xl sm:text-3xl text-emerald-950 font-bold">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs text-amber-900 font-semibold mt-1">
            {isHa ? 'Da sūnan Allah, Mai rahama, Mai jin ƙai.' : 'بسم الله الرحمن الرحيم'}
          </p>
        </div>
      )}

      {/* Interactive Ayah Cards */}
      <div className="space-y-4">
        {currentSurah.ayahs.map((ayah) => {
          const isPlayingThisAyah = audioService.isPlayingKey(ayah.audioKey);
          const isLearned = learnedAyahs.includes(ayah.numberInSurah);

          return (
            <div
              key={ayah.numberInSurah}
              className={`relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border-2 transition-all duration-300 ${
                isPlayingThisAyah
                  ? 'border-amber-400 ring-4 ring-amber-300/30 bg-amber-50/30 active-reciting'
                  : isLearned
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              {/* Header row of Ayah card */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-900 border border-emerald-300">
                    {ayah.numberInSurah}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {isHa ? `Aya ta ${ayah.numberInSurah}` : `الآية رقم ${ayah.numberInSurah}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Play audio button */}
                  <button
                    onClick={() => handlePlayAyah(ayah)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition btn-tactile cursor-pointer ${
                      isPlayingThisAyah
                        ? 'bg-amber-500 text-slate-900 shadow-md ring-2 ring-amber-300'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {isPlayingThisAyah ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-emerald-800" />}
                    <span>{isPlayingThisAyah ? (isHa ? 'Ana Karatu' : 'يقرأ الآن') : (isHa ? 'Saurara' : 'استمع')}</span>
                  </button>

                  {/* Mark as Learned */}
                  <button
                    onClick={() => handleToggleLearned(ayah)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isLearned
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isHa ? "Alama cewa ka koya" : "تم التعلم"}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isLearned ? (isHa ? 'Na Koya ✓' : 'تم التعلم ✓') : (isHa ? 'Na Koya?' : 'أتممتها؟')}</span>
                  </button>
                </div>
              </div>

              {/* Main Arabic Text */}
              <div className="py-4 text-right" dir="rtl">
                <p className="font-quran text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-wide leading-loose">
                  {ayah.arabic}{' '}
                  <span className="font-arabic inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-900 text-base font-black mx-1 border border-amber-300 align-middle">
                    ﴿{ayah.numberInSurah}﴾
                  </span>
                </p>
              </div>

              {/* Word-by-Word Interactive Chips */}
              <div className="py-2">
                <div className="text-[11px] font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>{isHa ? 'Danna kowace kalma don ganin ma\'anarta:' : 'اضغط على أي كلمة لعرض معناها:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ayah.words.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        soundService.playClick();
                        setActiveWord(activeWord?.id === w.id ? null : w);
                      }}
                      className={`btn-tactile rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer border ${
                        activeWord?.id === w.id
                          ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <span className="font-arabic text-sm ml-1">{w.arabic}</span>
                      <span className="text-[11px] font-medium opacity-80">({w.hausa})</span>
                    </button>
                  ))}
                </div>

                {/* Active Word Detail Box */}
                {activeWord && (
                  <div className="mt-2 rounded-xl bg-amber-100/80 p-3 text-xs font-medium text-amber-950 border border-amber-300 flex items-center justify-between animate-in fade-in">
                    <div>
                      <span className="font-arabic text-lg font-bold mr-2 text-emerald-900">{activeWord.arabic}</span>
                      <span className="font-bold">[{activeWord.transliteration}]</span>: {activeWord.hausa}
                    </div>
                    <button
                      onClick={() => setActiveWord(null)}
                      className="text-amber-800 hover:text-black font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Transliteration (Hausa pronunciation guide) */}
              {showTransliteration && (
                <div className="mt-2 rounded-xl bg-emerald-50/60 p-2.5 text-xs font-semibold text-emerald-900 border border-emerald-200/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
                    {isHa ? 'Hanyar Karatun Harafai (Transliteration):' : 'اللفظ الصوتي:'}
                  </span>
                  <p className="italic text-sm">{ayah.transliteration}</p>
                </div>
              )}

              {/* Hausa Meaning Translation */}
              <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-200 text-sm text-slate-800">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">
                  {isHa ? 'Fassarar Hausa:' : 'ترجمة المعنى بلغة الهوسا:'}
                </span>
                <p className="font-medium leading-relaxed">{ayah.hausaTranslation}</p>
              </div>

              {/* Child-friendly Tajweed Tip Callout */}
              {ayah.tajweedNotes && ayah.tajweedNotes.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {ayah.tajweedNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl bg-teal-50/80 p-2.5 text-xs text-teal-900 border border-teal-200"
                    >
                      <Info className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                      <div>
                        <span className="font-bold text-teal-950">
                          {isHa ? `Koyon Tajwidi: ${note.titleHa}` : `حكم التجويد: ${note.titleAr}`}
                        </span>
                        <p className="mt-0.5 font-medium text-teal-800">
                          {isHa ? note.descriptionHa : note.descriptionAr}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Lesson Summary Card for Kids */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white shadow-md border-2 border-amber-400">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-900">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {isHa ? 'Darussan Surar Ga Yara' : 'دروس السورة للأطفال'}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {isHa ? `Abin da Wannan Sura (${currentSurah.nameHausa}) ke Koya Mana` : `ماذا تعلمنا سورة ${currentSurah.nameArabic} المباركة؟`}
            </h3>
            <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed font-medium">
              {isHa ? currentSurah.lessonSummaryHa : currentSurah.lessonSummaryAr}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
