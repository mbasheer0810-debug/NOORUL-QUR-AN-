import React, { useState, useEffect } from 'react';
import { Brain, Shuffle, Eye, EyeOff, Check, RotateCcw, Star, Sparkles, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language, UserProgress, Surah, Ayah, QuranWord } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';
import { soundService } from '../services/soundService';

interface MemorizeSurahsProps {
  initialSurahNumber?: number;
  language: Language;
  userProgress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
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

type Mode = 'order' | 'hide' | 'quiz';

interface ShuffledWordItem {
  id: number;
  word: QuranWord;
  originalIndex: number;
}

export const MemorizeSurahs: React.FC<MemorizeSurahsProps> = ({
  initialSurahNumber = 1,
  language,
  userProgress,
  onUpdateProgress,
  onOpenCelebration,
}) => {
  const isHa = language === 'ha';
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<Mode>('order');

  // Word Ordering Puzzle State
  const [shuffledWords, setShuffledWords] = useState<ShuffledWordItem[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [isOrderComplete, setIsOrderComplete] = useState<boolean>(false);
  const [orderErrorIndex, setOrderErrorIndex] = useState<number | null>(null);

  // Hide Words Mode State
  const [revealedWordIds, setRevealedWordIds] = useState<number[]>([]);
  const [hideModeAll, setHideModeAll] = useState<boolean>(false);

  // Quiz State
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentSurah = SURAHS_DATA.find((s) => s.number === selectedSurahNumber) || SURAHS_DATA[0];
  const currentAyah = currentSurah.ayahs[currentAyahIndex] || currentSurah.ayahs[0];

  // Setup Word Order Puzzle
  const setupWordOrder = (ayah: Ayah) => {
    setSelectedWordIds([]);
    setIsOrderComplete(false);
    setOrderErrorIndex(null);

    const items: ShuffledWordItem[] = ayah.words.map((w, idx) => ({
      id: w.id,
      word: w,
      originalIndex: idx,
    }));

    // Deterministic or pseudo-random shuffle
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  };

  useEffect(() => {
    if (initialSurahNumber) {
      setSelectedSurahNumber(initialSurahNumber);
      setCurrentAyahIndex(0);
    }
  }, [initialSurahNumber]);

  useEffect(() => {
    setupWordOrder(currentAyah);
    setRevealedWordIds([]);
    setQuizQuestionIndex(0);
    setQuizScore(0);
    setQuizSelectedOption(null);
    setQuizFinished(false);
  }, [selectedSurahNumber, currentAyahIndex, activeMode]);

  // Handle child tapping a word in Word Order puzzle
  const handleWordTap = (item: ShuffledWordItem) => {
    if (selectedWordIds.includes(item.id) || isOrderComplete) return;

    const nextIndex = selectedWordIds.length;
    // Check if this tapped word is the correct next word
    if (item.originalIndex === nextIndex) {
      // Correct!
      soundService.playCorrectWord();
      const newSelected = [...selectedWordIds, item.id];
      setSelectedWordIds(newSelected);
      setOrderErrorIndex(null);

      // Check if all words placed
      if (newSelected.length === currentAyah.words.length) {
        setIsOrderComplete(true);
        soundService.playStarChime();
        handleAyahMemorizedSuccess();
      }
    } else {
      // Incorrect order, notify gently
      soundService.playClick();
      setOrderErrorIndex(item.id);
      setTimeout(() => setOrderErrorIndex(null), 800);
    }
  };

  const handleAyahMemorizedSuccess = () => {
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

    if (!sp.memorizedAyahs.includes(currentAyah.numberInSurah)) {
      sp.memorizedAyahs.push(currentAyah.numberInSurah);
      updated.totalStars += 4; // +4 stars for memorizing an ayah!
    }

    sp.lastPracticed = new Date().toISOString();
    updated.surahProgress[currentSurah.number] = sp;
    onUpdateProgress(updated);

    if (sp.memorizedAyahs.length === currentSurah.ayahCount) {
      updated.totalStars += 10;
      onOpenCelebration({
        titleHa: `Masha'Allah! Ka Haddace Dukkan ${currentSurah.nameHausa}!`,
        titleAr: `ما شاء الله! أتممت حفظ سورة ${currentSurah.nameArabic} كاملة!`,
        messageHa: `Ka kware wajen haddar dukkan ayoyin wannan sura mai albarka. Kai gwarzon Alƙur'ani ne!`,
        messageAr: `حفظت آيات السورة الكريمة عن ظهر قلب بكل جدارة وإتقان!`,
        stars: 12,
        badgeHa: `Hafizin ${currentSurah.nameHausa}`,
        badgeAr: `حافظ سورة ${currentSurah.nameArabic}`,
      });
    }
  };

  // Toggle reveal of word in Hide Words mode
  const toggleRevealWord = (wordId: number) => {
    soundService.playClick();
    if (revealedWordIds.includes(wordId)) {
      setRevealedWordIds(revealedWordIds.filter((id) => id !== wordId));
    } else {
      setRevealedWordIds([...revealedWordIds, wordId]);
    }
  };

  // Generate dynamic quiz questions for current surah
  const generateQuizQuestions = () => {
    return currentSurah.ayahs.map((ayah, idx) => {
      const isLast = idx === currentSurah.ayahs.length - 1;
      const questionPromptHa = isLast
        ? `Wace aya ce aya ta karshe a ${currentSurah.nameHausa}?`
        : `Bayan karanta "${ayah.arabic}", wace aya ce ke biyo baya?`;
      const questionPromptAr = isLast
        ? `ما هي الآية الأخيرة في سورة ${currentSurah.nameArabic}؟`
        : `بعد قوله تعالى: "${ayah.arabic}"، ما هي الآية التالية؟`;

      const correctAnswer = isLast ? ayah.arabic : currentSurah.ayahs[idx + 1].arabic;
      
      // Pick 2 wrong answers from other ayahs or surahs
      const otherAyahs = SURAHS_DATA.flatMap((s) => s.ayahs)
        .filter((a) => a.arabic !== correctAnswer && a.arabic !== ayah.arabic)
        .slice(0, 2)
        .map((a) => a.arabic);

      const options = [correctAnswer, ...otherAyahs].sort(() => 0.5 - Math.random());

      return {
        promptHa: questionPromptHa,
        promptAr: questionPromptAr,
        correctAnswer,
        options,
      };
    });
  };

  const quizQuestions = generateQuizQuestions();
  const currentQuizQ = quizQuestions[quizQuestionIndex] || quizQuestions[0];

  const handleSelectQuizOption = (optionIndex: number) => {
    if (quizSelectedOption !== null) return;
    setQuizSelectedOption(optionIndex);

    const isCorrect = currentQuizQ.options[optionIndex] === currentQuizQ.correctAnswer;
    if (isCorrect) {
      soundService.playCorrectWord();
      setQuizScore((prev) => prev + 1);
    } else {
      soundService.playClick();
    }

    setTimeout(() => {
      if (quizQuestionIndex < quizQuestions.length - 1) {
        setQuizQuestionIndex((prev) => prev + 1);
        setQuizSelectedOption(null);
      } else {
        // Quiz completed
        setQuizFinished(true);
        soundService.playStarChime();
        const finalScore = Math.round(((quizScore + (isCorrect ? 1 : 0)) / quizQuestions.length) * 100);
        
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

        sp.quizCompleted = true;
        sp.score = Math.max(sp.score || 0, finalScore);
        updated.totalStars += Math.round(finalScore / 10);
        updated.surahProgress[currentSurah.number] = sp;
        onUpdateProgress(updated);

        if (finalScore >= 70) {
          onOpenCelebration({
            titleHa: `Madalla! Sakamakon Gwaji: ${finalScore}%!`,
            titleAr: `أحسنت! نتيجة الاختبار: ${finalScore}%!`,
            messageHa: `Ka ci gwajin haddar ${currentSurah.nameHausa} da babban maki!`,
            messageAr: `اجتزت اختبار حفظ سورة ${currentSurah.nameArabic} بدرجة ممتازة!`,
            stars: 8,
            badgeHa: `Gwarzon Gwajin ${currentSurah.nameHausa}`,
            badgeAr: `بطل اختبار ${currentSurah.nameArabic}`,
          });
        }
      }
    }, 1200);
  };

  const surahProgress = userProgress.surahProgress[currentSurah.number];
  const memorizedAyahs = surahProgress?.memorizedAyahs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
            <Brain className="h-4 w-4" />
            <span>{isHa ? 'Sashe na 3: Haddar Surori' : 'القسم الثالث: تثبيت الحفظ وألعاب الذاكرة'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {isHa ? currentSurah.nameHausa : currentSurah.nameArabic}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            {isHa ? 'Zaɓi wasan hadda don gwada ƙwaƙwalwarka da samun taurari!' : 'اختر اللعبة المناسبة لتثبيت حفظك في الذاكرة'}
          </p>
        </div>

        {/* 3 Game Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-teal-50 p-1.5 rounded-2xl border border-teal-200 self-start sm:self-center">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveMode('order');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeMode === 'order'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-teal-900 hover:bg-teal-100'
            }`}
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>{isHa ? 'Jera Kalmomi' : 'ترتيب الكلمات'}</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setActiveMode('hide');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeMode === 'hide'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-teal-900 hover:bg-teal-100'
            }`}
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>{isHa ? 'Ɓoye Kalmomi' : 'إخفاء وكشف'}</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setActiveMode('quiz');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeMode === 'quiz'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-teal-900 hover:bg-teal-100'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>{isHa ? 'Gwajin Hadda' : 'اختبار الحفظ'}</span>
          </button>
        </div>
      </div>

      {/* Surah Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {SURAHS_DATA.map((surah) => {
          const isSelected = surah.number === selectedSurahNumber;
          const p = userProgress.surahProgress[surah.number];
          const isHafiz = p?.memorizedAyahs?.length === surah.ayahCount;

          return (
            <button
              key={surah.number}
              onClick={() => {
                soundService.playClick();
                setSelectedSurahNumber(surah.number);
                setCurrentAyahIndex(0);
              }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer btn-tactile shrink-0 border-2 ${
                isSelected
                  ? 'bg-teal-800 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
              }`}
            >
              <span>{surah.number}. {isHa ? surah.nameHausa : surah.nameArabic}</span>
              {isHafiz && <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />}
            </button>
          );
        })}
      </div>

      {/* GAME MODE 1: WORD ORDERING PUZZLE */}
      {activeMode === 'order' && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-lg border-2 border-teal-300 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-900 font-extrabold text-xs">
                {currentAyah.numberInSurah}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {isHa ? `Jera Kalmomin Aya ta ${currentAyah.numberInSurah}` : `رتّب كلمات الآية رقم ${currentAyah.numberInSurah}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setupWordOrder(currentAyah)}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isHa ? 'Sake Garwayawa' : 'إعادة الترتيب'}</span>
              </button>
            </div>
          </div>

          {/* Construction Board: Tapped words appear here in order */}
          <div className="min-h-[100px] rounded-2xl bg-teal-50/60 p-5 border-2 border-dashed border-teal-300 flex flex-wrap items-center justify-end gap-2.5" dir="rtl">
            {selectedWordIds.length === 0 ? (
              <p className="text-xs font-medium text-slate-500 w-full text-center py-4" dir="ltr">
                {isHa
                  ? '👇 Danna kalmomin da ke ƙasa bisa tsarin karatun Alƙur\'ani daidai:'
                  : '👇 اضغط على الكلمات بالأسفل بالترتيب الصحيح للآية الكريمة:'}
              </p>
            ) : (
              selectedWordIds.map((id, index) => {
                const w = currentAyah.words.find((word) => word.id === id);
                return (
                  <span
                    key={id}
                    className="font-quran text-2xl sm:text-3xl font-bold bg-white text-emerald-950 px-3.5 py-1.5 rounded-xl shadow-xs border-2 border-teal-400 animate-in zoom-in-95"
                  >
                    {w?.arabic}
                  </span>
                );
              })
            )}
          </div>

          {/* Shuffled Word Pool: Large child-friendly touch tiles */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-700 mb-3 text-center">
              {isHa ? 'Zaɓi kalmar da ta dace da ke biyo baya:' : 'اختر الكلمة التالية بالترتيب الصحيح:'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {shuffledWords.map((item) => {
                const isSelected = selectedWordIds.includes(item.id);
                const isError = orderErrorIndex === item.id;

                return (
                  <button
                    key={item.id}
                    disabled={isSelected || isOrderComplete}
                    onClick={() => handleWordTap(item)}
                    className={`btn-tactile rounded-2xl p-4 text-center transition min-w-[100px] cursor-pointer border-2 shadow-sm ${
                      isSelected
                        ? 'opacity-25 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed scale-95'
                        : isError
                        ? 'bg-red-100 border-red-400 text-red-900 animate-shake'
                        : 'bg-white hover:bg-teal-50 border-teal-300 text-slate-900 hover:border-teal-500 hover:scale-105'
                    }`}
                  >
                    <p className="font-quran text-2xl sm:text-3xl font-bold text-emerald-950">
                      {item.word.arabic}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 font-sans">
                      {item.word.hausa}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completion Victory Box */}
          {isOrderComplete && (
            <div className="rounded-2xl bg-amber-50 p-5 border-2 border-amber-300 text-center space-y-3 animate-in zoom-in-95">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-sm">
                <Star className="h-6 w-6 fill-slate-900" />
              </div>
              <h3 className="text-lg font-black text-emerald-950">
                {isHa ? 'Masha\'Allah! Ka Jera Ayar Daidai!' : 'ما شاء الله! قمت بترتيب الآية بنجاح!'}
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                {isHa ? 'Ka samu taurari +4 saboda haddace wannan aya!' : 'حصلت على ٤ نجوم إضافية لحفظك المتقن!'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {currentAyahIndex < currentSurah.ayahs.length - 1 ? (
                  <button
                    onClick={() => {
                      soundService.playClick();
                      setCurrentAyahIndex(currentAyahIndex + 1);
                    }}
                    className="btn-tactile flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    <span>{isHa ? 'Aya Ta Gaba' : 'الآية التالية'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                    {isHa ? 'Alhamdulillah! Ka gama jera dukkan ayoyin!' : 'الحمد لله! أتممت ترتيب جميع آيات السورة!'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ayah Bottom Navigator */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <button
              disabled={currentAyahIndex === 0}
              onClick={() => setCurrentAyahIndex(currentAyahIndex - 1)}
              className="disabled:opacity-30 cursor-pointer"
            >
              ← {isHa ? 'Ayar Baya' : 'السابقة'}
            </button>
            <span>
              {isHa ? `Aya ${currentAyahIndex + 1} cikin ${currentSurah.ayahCount}` : `الآية ${currentAyahIndex + 1} من ${currentSurah.ayahCount}`}
            </span>
            <button
              disabled={currentAyahIndex === currentSurah.ayahs.length - 1}
              onClick={() => setCurrentAyahIndex(currentAyahIndex + 1)}
              className="disabled:opacity-30 cursor-pointer"
            >
              {isHa ? 'Aya ta Gaba' : 'التالية'} →
            </button>
          </div>
        </div>
      )}

      {/* GAME MODE 2: HIDE / BLANK WORDS */}
      {activeMode === 'hide' && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-lg border-2 border-teal-300 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                {isHa ? 'Wasan Gwada Hadda' : 'تمرين الذاكرة وحجب الكلمات'}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHa ? 'Karanta daga ƙwaƙwalwarka sannan ka taɓa don buɗe kalma!' : 'اقرأ من حفظك ثم اضغط على الكلمة المخفية لكشفها!'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundService.playClick();
                  setHideModeAll(!hideModeAll);
                  setRevealedWordIds([]);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100 transition cursor-pointer border border-teal-200"
              >
                {hideModeAll ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>{hideModeAll ? (isHa ? 'Ɓoye Kalmomi 50%' : 'حجب النصف') : (isHa ? 'Ɓoye Duka (100%)' : 'حجب الكل')}</span>
              </button>
            </div>
          </div>

          {/* Ayah display with hidden word cards */}
          <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-right leading-loose" dir="rtl">
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              {currentAyah.words.map((w, idx) => {
                // If hideModeAll is true, hide all; else hide alternate words (even index)
                const isMaskedByDefault = hideModeAll ? true : idx % 2 === 0;
                const isRevealed = revealedWordIds.includes(w.id);
                const shouldHide = isMaskedByDefault && !isRevealed;

                return (
                  <button
                    key={w.id}
                    onClick={() => toggleRevealWord(w.id)}
                    className={`btn-tactile rounded-2xl px-4 py-2 font-quran text-2xl sm:text-3xl font-bold transition cursor-pointer border-2 ${
                      shouldHide
                        ? 'bg-amber-200/90 text-amber-900 border-amber-400 hover:bg-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-white text-emerald-950 border-teal-300 shadow-xs'
                    }`}
                    title={shouldHide ? (isHa ? 'Danna don bayyana kalma' : 'اضغط لكشف الكلمة') : (isHa ? 'Danna don sake boyewa' : 'اضغط للإخفاء')}
                  >
                    {shouldHide ? (
                      <span className="font-sans text-sm font-black px-2 text-amber-900">[ ? ]</span>
                    ) : (
                      w.arabic
                    )}
                  </button>
                );
              })}
              <span className="font-arabic inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-sm font-black mx-1 border border-amber-400">
                ﴿{currentAyah.numberInSurah}﴾
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-2">
            <span>{isHa ? 'Ka karanta daidai? Taba kalmar don duba amsarka!' : 'هل قرأت الكلمة بشكل صحيح؟ اضغط لكشفها والتأكد!'}</span>
            <button
              onClick={() => {
                soundService.playStarChime();
                handleAyahMemorizedSuccess();
              }}
              className="btn-tactile flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-bold text-white shadow-xs cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isHa ? 'Na Haddace Wannan Aya! ✓' : 'حفظت هذه الآية تماماً! ✓'}</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME MODE 3: SURAH QUIZ */}
      {activeMode === 'quiz' && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-lg border-2 border-teal-300 space-y-6">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  {isHa
                    ? `Tambaya ta ${quizQuestionIndex + 1} cikin ${quizQuestions.length}`
                    : `السؤال ${quizQuestionIndex + 1} من ${quizQuestions.length}`}
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                  {isHa ? `Maki: ${quizScore}` : `النقاط: ${quizScore}`}
                </span>
              </div>

              {/* Question prompt */}
              <div className="text-center py-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                  {isHa ? currentQuizQ.promptHa : currentQuizQ.promptAr}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuizQ.options.map((option, idx) => {
                  const isSelected = quizSelectedOption === idx;
                  const isCorrect = option === currentQuizQ.correctAnswer;
                  
                  let optStyle = 'bg-slate-50 hover:bg-teal-50 border-slate-200 text-slate-900';
                  if (quizSelectedOption !== null) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400';
                    } else if (isSelected) {
                      optStyle = 'bg-red-100 border-red-400 text-red-950';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSelectedOption !== null}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`btn-tactile w-full rounded-2xl p-4 text-right transition border-2 cursor-pointer shadow-xs ${optStyle}`}
                      dir="rtl"
                    >
                      <p className="font-quran text-2xl sm:text-3xl leading-relaxed">
                        {option}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-linear-to-tr from-amber-400 to-yellow-200 text-slate-900 shadow-md">
                <Award className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950">
                {isHa ? 'An Kammala Gwajin Hadda!' : 'أحسنت! اكتمل اختبار الحفظ بنجاح!'}
              </h3>
              <p className="text-sm font-semibold text-slate-700">
                {isHa
                  ? `Ka amsa tambayoyi ${quizScore} daidai cikin ${quizQuestions.length}!`
                  : `أجبت على ${quizScore} أسئلة صحيحة من أصل ${quizQuestions.length}!`}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setQuizQuestionIndex(0);
                    setQuizScore(0);
                    setQuizSelectedOption(null);
                    setQuizFinished(false);
                  }}
                  className="rounded-xl bg-teal-700 px-6 py-3 text-xs font-bold text-white hover:bg-teal-800 transition cursor-pointer"
                >
                  {isHa ? 'Sake Yin Gwajin' : 'إعادة الاختبار'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom info on memorized count */}
      <div className="rounded-2xl bg-teal-50 p-4 border border-teal-200 flex items-center justify-between text-xs font-bold text-teal-950">
        <span>
          {isHa
            ? `Ayoyin da aka haddace a ${currentSurah.nameHausa}: ${memorizedAyahs.length} / ${currentSurah.ayahCount}`
            : `الآيات المحفوظة في سورة ${currentSurah.nameArabic}: ${memorizedAyahs.length} / ${currentSurah.ayahCount}`}
        </span>
        <div className="flex items-center gap-1 text-amber-600">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          <span>{isHa ? 'Hadda ita ce taskar zuciya!' : 'القرآن نور الصدور'}</span>
        </div>
      </div>
    </div>
  );
};
