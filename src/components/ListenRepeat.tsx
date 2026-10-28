import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Mic, Square, Check, Star, Sparkles, Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, UserProgress, Surah, Ayah } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';
import { audioService } from '../services/audioService';
import { soundService } from '../services/soundService';

interface ListenRepeatProps {
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

type Stage = 'listen' | 'repeat' | 'done';

export const ListenRepeat: React.FC<ListenRepeatProps> = ({
  initialSurahNumber = 1,
  language,
  userProgress,
  onUpdateProgress,
  onOpenCelebration,
}) => {
  const isHa = language === 'ha';
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [stage, setStage] = useState<Stage>('listen');
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [targetRepeats, setTargetRepeats] = useState<number>(3);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);
  const [repeatCountdown, setRepeatCountdown] = useState<number>(6);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSurah = SURAHS_DATA.find((s) => s.number === selectedSurahNumber) || SURAHS_DATA[0];
  const currentAyah = currentSurah.ayahs[currentAyahIndex] || currentSurah.ayahs[0];

  useEffect(() => {
    if (initialSurahNumber) {
      setSelectedSurahNumber(initialSurahNumber);
      setCurrentAyahIndex(0);
      setRepeatCount(0);
      setStage('listen');
    }
  }, [initialSurahNumber]);

  useEffect(() => {
    return () => {
      audioService.stop();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const startTeacherRecitation = () => {
    soundService.playClick();
    setStage('listen');
    audioService.playAyah(currentAyah.audioKey, () => {
      // Finished listening to teacher, prompt child to repeat
      soundService.playRepeatPrompt();
      setStage('repeat');
      startRepeatTimer();
    });
  };

  const startRepeatTimer = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRepeatCountdown(7);
    countdownIntervalRef.current = setInterval(() => {
      setRepeatCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishRepeat = () => {
    soundService.playStarChime();
    const newCount = repeatCount + 1;
    setRepeatCount(newCount);

    if (newCount >= targetRepeats) {
      setStage('done');
      // Mark as repeated in user progress
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

      if (!sp.repeatedAyahs.includes(currentAyah.numberInSurah)) {
        sp.repeatedAyahs.push(currentAyah.numberInSurah);
        updated.totalStars += 3;
      }
      sp.lastPracticed = new Date().toISOString();
      updated.surahProgress[currentSurah.number] = sp;
      onUpdateProgress(updated);

      if (sp.repeatedAyahs.length === currentSurah.ayahCount) {
        updated.totalStars += 6;
        onOpenCelebration({
          titleHa: `Masha'Allah! Ka Maimaita ${currentSurah.nameHausa}!`,
          titleAr: `ما شاء الله! أتممت ترديد ${currentSurah.nameArabic}!`,
          messageHa: `Ka maimaita kowace aya har sau ${targetRepeats} tare da Sheikh! Yanzu Alƙur'ani ya zauna a bakinka.`,
          messageAr: `رددت جميع آيات السورة الكريمة بنجاح وإتقان! مبارك لك!`,
          stars: 9,
          badgeHa: `Mai Maimaita ${currentSurah.nameHausa}`,
          badgeAr: `بطل الترديد لسورة ${currentSurah.nameArabic}`,
        });
      }
    } else {
      // Play teacher again for the next repetition round
      setTimeout(() => {
        startTeacherRecitation();
      }, 700);
    }
  };

  // Microphone recording
  const startRecordingVoice = async () => {
    try {
      soundService.playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert(isHa ? 'Don Allah ka ba da izinin amfani da Makirufo (Microphone).' : 'يرجى السماح بالوصول إلى الميكروفون لتسجيل صوتك.');
    }
  };

  const stopRecordingVoice = () => {
    if (mediaRecorderRef.current && isRecording) {
      soundService.playClick();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedVoice = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingRecorded && recordedAudioElementRef.current) {
      recordedAudioElementRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      const audio = new Audio(recordedAudioUrl);
      recordedAudioElementRef.current = audio;
      audio.onended = () => setIsPlayingRecorded(false);
      audio.play();
      setIsPlayingRecorded(true);
    }
  };

  const goToNextAyah = () => {
    soundService.playClick();
    if (currentAyahIndex < currentSurah.ayahs.length - 1) {
      setCurrentAyahIndex(currentAyahIndex + 1);
      setRepeatCount(0);
      setStage('listen');
      setRecordedAudioUrl(null);
    }
  };

  const goToPrevAyah = () => {
    soundService.playClick();
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(currentAyahIndex - 1);
      setRepeatCount(0);
      setStage('listen');
      setRecordedAudioUrl(null);
    }
  };

  const surahProgress = userProgress.surahProgress[currentSurah.number];
  const repeatedAyahs = surahProgress?.repeatedAyahs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Volume2 className="h-4 w-4" />
            <span>{isHa ? 'Sashe na 2: Saurara da Maimaitawa' : 'القسم الثاني: استمع وردد مع القارئ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {isHa ? currentSurah.nameHausa : currentSurah.nameArabic}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            {isHa
              ? 'Malamin Alƙur\'ani yana karantawa, kai kuma kana maimaitawa da ƙarfi domin harshenka ya saba.'
              : 'استمع إلى تلاوة الشيخ المتقنة ثم ردد بصوتك ليتدرب لسانك على النطق الصحيح.'}
          </p>
        </div>

        {/* Repetitions target selector */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-amber-50 p-1.5 rounded-2xl border border-amber-200">
          <span className="text-xs font-bold text-amber-900 px-2">
            {isHa ? 'Sau nawa:' : 'التكرار:'}
          </span>
          {[1, 2, 3, 5].map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                soundService.playClick();
                setTargetRepeats(cnt);
                setRepeatCount(0);
              }}
              className={`h-8 w-8 rounded-xl text-xs font-black transition cursor-pointer ${
                targetRepeats === cnt
                  ? 'bg-amber-500 text-slate-900 shadow-sm'
                  : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              {cnt}x
            </button>
          ))}
        </div>
      </div>

      {/* Surah Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {SURAHS_DATA.map((surah) => {
          const isSelected = surah.number === selectedSurahNumber;
          const p = userProgress.surahProgress[surah.number];
          const isDone = p?.repeatedAyahs?.length === surah.ayahCount;

          return (
            <button
              key={surah.number}
              onClick={() => {
                soundService.playClick();
                setSelectedSurahNumber(surah.number);
                setCurrentAyahIndex(0);
                setRepeatCount(0);
                setStage('listen');
                audioService.stop();
              }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer btn-tactile shrink-0 border-2 ${
                isSelected
                  ? 'bg-amber-600 text-white border-amber-300 shadow-md ring-2 ring-amber-300/40'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
              }`}
            >
              <span>{surah.number}. {isHa ? surah.nameHausa : surah.nameArabic}</span>
              {isDone && <Check className="h-3.5 w-3.5 text-emerald-300" />}
            </button>
          );
        })}
      </div>

      {/* Main Focus Card for Current Ayah */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-white via-amber-50/20 to-white p-6 sm:p-8 shadow-lg border-2 border-amber-300">
        
        {/* Ayah Navigation Tracker */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-extrabold text-slate-900 text-sm shadow-xs">
              {currentAyah.numberInSurah}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isHa ? `Aya ta ${currentAyah.numberInSurah} cikin ${currentSurah.ayahCount}` : `الآية ${currentAyah.numberInSurah} من ${currentSurah.ayahCount}`}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: targetRepeats }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-6 rounded-full transition-all ${
                      i < repeatCount ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ayah Previous/Next navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevAyah}
              disabled={currentAyahIndex === 0}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={isHa ? "Ayar da ta gabata" : "الآية السابقة"}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextAyah}
              disabled={currentAyahIndex === currentSurah.ayahs.length - 1}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={isHa ? "Aya ta gaba" : "الآية التالية"}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Large Prominent Arabic Text */}
        <div className="my-8 text-center" dir="rtl">
          <p className="font-quran text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-wide leading-loose">
            {currentAyah.arabic}
          </p>
          <p className="text-base font-semibold text-emerald-800 mt-3 font-sans" dir="ltr">
            {currentAyah.transliteration}
          </p>
          <p className="text-sm font-medium text-slate-600 mt-1 max-w-xl mx-auto" dir="ltr">
            {currentAyah.hausaTranslation}
          </p>
        </div>

        {/* Interactive Guided Action Box */}
        <div className="rounded-2xl bg-amber-50 p-5 sm:p-6 border-2 border-amber-300 shadow-inner">
          
          {stage === 'listen' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-200/80 px-4 py-1.5 text-xs font-bold text-amber-950">
                <Volume2 className="h-4 w-4 animate-bounce" />
                <span>{isHa ? '1. Da Farko: Saurari Muryar Malami' : '١. أولاً: استمع لترتيل الشيخ بدقة'}</span>
              </div>
              <p className="text-sm text-slate-700 font-medium">
                {isHa ? 'Danna maballin don sauraron yadda ake furta kowace kalma daidai:' : 'اضغط للاستماع إلى القراءة المتقنة:'}
              </p>
              <div>
                <button
                  onClick={startTeacherRecitation}
                  className="btn-tactile inline-flex items-center gap-3 rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 px-7 py-4 text-base font-black text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition cursor-pointer"
                >
                  <Play className="h-6 w-6 fill-white" />
                  <span>{isHa ? 'Saurari Karatun Malami' : 'استمع لتلاوة الشيخ'}</span>
                </button>
              </div>
            </div>
          )}

          {stage === 'repeat' && (
            <div className="text-center space-y-4 animate-in fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-200/90 px-4 py-1.5 text-xs font-bold text-emerald-950 ring-2 ring-emerald-400">
                <Sparkles className="h-4 w-4 text-emerald-700 animate-spin" />
                <span>
                  {isHa
                    ? `2. Yanzu Lokacinka Ne! Maimaita da Ƙarfi (${repeatCount + 1}/${targetRepeats})`
                    : `٢. دورك الآن! ردد بصوت واضح (${repeatCount + 1}/${targetRepeats})`}
                </span>
              </div>

              {repeatCountdown > 0 && (
                <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-xs">
                  <span>{isHa ? 'Maimaita a hankali:' : 'ردد الآن:'}</span>
                  <span className="font-mono text-base bg-amber-200 px-2 py-0.5 rounded-lg">{repeatCountdown}s</span>
                </div>
              )}

              {/* Action Buttons: Child records voice or marks repetition complete */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                
                {/* Voice Recorder button */}
                {!isRecording ? (
                  <button
                    onClick={startRecordingVoice}
                    className="btn-tactile flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 px-5 py-3.5 text-sm font-bold text-white shadow-md transition cursor-pointer"
                  >
                    <Mic className="h-4 w-4 text-red-400" />
                    <span>{isHa ? 'Ɗauki Muryata (Record)' : 'سجل صوتي'}</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecordingVoice}
                    className="btn-tactile flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-3.5 text-sm font-bold text-white shadow-md transition cursor-pointer animate-pulse"
                  >
                    <Square className="h-4 w-4 fill-white" />
                    <span>{isHa ? 'Daina Ɗaukar Murya' : 'إيقاف التسجيل'}</span>
                  </button>
                )}

                {/* If recorded voice exists, play it back */}
                {recordedAudioUrl && (
                  <button
                    onClick={playRecordedVoice}
                    className="btn-tactile flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-3.5 text-sm font-bold text-slate-900 shadow-md transition cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{isPlayingRecorded ? (isHa ? 'Dakata' : 'إيقاف') : (isHa ? 'Saurari Muryarka' : 'استمع لصوتك')}</span>
                  </button>
                )}

                {/* Button: "Na Maimaita!" (I Finished Repeating) */}
                <button
                  onClick={handleFinishRepeat}
                  className="btn-tactile flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-7 py-3.5 text-base font-black text-white shadow-lg transition cursor-pointer"
                >
                  <Check className="h-5 w-5" />
                  <span>{isHa ? 'Na Maimaita! ✓' : 'رددت الآية بنجاح! ✓'}</span>
                </button>
              </div>

              {/* Re-listen to teacher */}
              <div>
                <button
                  onClick={startTeacherRecitation}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer underline underline-offset-4"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isHa ? 'Sake jin karatun malami' : 'إعادة الاستماع لتلاوة الشيخ'}</span>
                </button>
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="text-center space-y-4 animate-in fade-in">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-950">
                {isHa ? 'Madalla! Ka Kammala Maimaita Wannan Aya!' : 'أحسنت! أتممت ترديد هذه الآية بنجاح!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isHa
                  ? `Ka maimaita sau ${targetRepeats} kuma ka sami taurari +3! Ka shirya don aya ta gaba?`
                  : `كررت الآية ${targetRepeats} مرات وحصلت على النجوم! هل أنت مستعد للآية التالية؟`}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setRepeatCount(0);
                    setStage('listen');
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  {isHa ? 'Sake Maimaitawa' : 'إعادة الترديد'}
                </button>

                {currentAyahIndex < currentSurah.ayahs.length - 1 ? (
                  <button
                    onClick={goToNextAyah}
                    className="btn-tactile flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-black text-white shadow-md hover:from-emerald-700 hover:to-emerald-800 transition cursor-pointer"
                  >
                    <span>{isHa ? 'Je Zuwa Aya Ta Gaba' : 'الانتقال إلى الآية التالية'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 shadow-md">
                    <Star className="h-4 w-4 fill-slate-900" />
                    <span>{isHa ? 'Alhamdulillah! Ka gama dukkan ayoyin surar!' : 'الحمد لله! أتممت ترديد جميع آيات السورة!'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Surah summary progress in repetition */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-semibold border-t border-slate-200/80 pt-4">
          <div className="flex items-center gap-1.5">
            <span>{isHa ? 'Ayoyin da aka maimaita:' : 'الآيات المكتملة:'}</span>
            <span className="font-mono text-emerald-800 font-bold">
              {repeatedAyahs.length} / {currentSurah.ayahCount}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{isHa ? 'Maimaita kowace aya yana karawa da tabbatar hadda!' : 'الترديد يثبت الحفظ في الذاكرة'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
