import React, { useState, useEffect } from 'react';
import { Award, Star, Flame, Trophy, CheckCircle2, Download, RefreshCw, User, Sparkles, BookOpen, Repeat, Brain, FolderArchive, ShieldCheck } from 'lucide-react';
import { Language, UserProgress, Surah } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';
import { audioService } from '../services/audioService';
import { soundService } from '../services/soundService';

interface LearningProgressProps {
  language: Language;
  userProgress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onNavigateTab: (tab: 'learn' | 'repeat' | 'memorize' | 'progress', surahNumber?: number) => void;
  onOpenCelebration: (data: {
    titleHa: string;
    titleAr: string;
    messageHa: string;
    messageAr: string;
    stars: number;
    badgeHa?: string;
    badgeAr?: string;
  }) => void;
  onOpenExportModal?: () => void;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  language,
  userProgress,
  onUpdateProgress,
  onNavigateTab,
  onOpenCelebration,
  onOpenExportModal,
}) => {
  const isHa = language === 'ha';
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProgress.childName);
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [cachedAudioCount, setCachedAudioCount] = useState<number>(0);

  useEffect(() => {
    audioService.getCachedCount().then((cnt) => setCachedAudioCount(cnt));
  }, []);

  const handleSaveName = () => {
    soundService.playClick();
    const updated = { ...userProgress, childName: nameInput.trim() || 'Dan/Yar Makarantar Alƙur\'ani' };
    onUpdateProgress(updated);
    setIsEditingName(false);
  };

  // Download all 6 surahs for offline mode
  const handleDownloadOfflineAudio = async () => {
    soundService.playClick();
    setIsDownloadingOffline(true);
    setDownloadProgress(0);
    setDownloadSuccess(false);

    const allAyahKeys = SURAHS_DATA.flatMap((s) => s.ayahs.map((a) => a.audioKey));
    let completed = 0;

    for (const key of allAyahKeys) {
      await audioService.cacheAudioFile(key);
      completed++;
      setDownloadProgress(Math.round((completed / allAyahKeys.length) * 100));
    }

    setIsDownloadingOffline(false);
    setDownloadSuccess(true);
    const count = await audioService.getCachedCount();
    setCachedAudioCount(count);
    soundService.playStarChime();
  };

  // Calculate overall stats
  const totalAyahs = SURAHS_DATA.reduce((sum, s) => sum + s.ayahCount, 0); // 28 ayahs
  const totalLearned = Object.values(userProgress.surahProgress).reduce(
    (sum, sp) => sum + (sp.learnedAyahs?.length || 0),
    0
  );
  const totalRepeated = Object.values(userProgress.surahProgress).reduce(
    (sum, sp) => sum + (sp.repeatedAyahs?.length || 0),
    0
  );
  const totalMemorized = Object.values(userProgress.surahProgress).reduce(
    (sum, sp) => sum + (sp.memorizedAyahs?.length || 0),
    0
  );

  const overallMastery = Math.round(
    ((totalLearned + totalRepeated + totalMemorized) / (totalAyahs * 3)) * 100
  );

  const badges = [
    {
      id: 'fatihah',
      surahNum: 1,
      titleHa: 'Tauraron Fatihah',
      titleAr: 'نجم الفاتحة',
      descHa: 'Koyi da haddace Suratul Fatiha',
      descAr: 'إتقان سورة الفاتحة المباركة',
      unlocked: (userProgress.surahProgress[1]?.memorizedAyahs?.length || 0) === 7,
    },
    {
      id: 'ikhlas',
      surahNum: 112,
      titleHa: 'Masoyin Tauhidi',
      titleAr: 'حبيب التوحيد',
      descHa: 'Koyi da haddace Suratul Ikhlas',
      descAr: 'إتقان سورة الإخلاص',
      unlocked: (userProgress.surahProgress[112]?.memorizedAyahs?.length || 0) === 4,
    },
    {
      id: 'falaq',
      surahNum: 113,
      titleHa: 'Mai Tsaron Falaq',
      titleAr: 'حارس الفلق',
      descHa: 'Koyi da haddace Suratul Falaq',
      descAr: 'إتقan سورة الفلق',
      unlocked: (userProgress.surahProgress[113]?.memorizedAyahs?.length || 0) === 5,
    },
    {
      id: 'nas',
      surahNum: 114,
      titleHa: 'Mai Tsaron Nas',
      titleAr: 'حارس الناس',
      descHa: 'Koyi da haddace Suratun Nas',
      descAr: 'إتقان سورة الناس',
      unlocked: (userProgress.surahProgress[114]?.memorizedAyahs?.length || 0) === 6,
    },
    {
      id: 'kawthar',
      surahNum: 108,
      titleHa: 'Mai Rafin Kauthar',
      titleAr: 'صاحب الكوثر',
      descHa: 'Koyi da haddace Suratul Kauthar',
      descAr: 'إتقان سورة الكوثر',
      unlocked: (userProgress.surahProgress[108]?.memorizedAyahs?.length || 0) === 3,
    },
    {
      id: 'asr',
      surahNum: 103,
      titleHa: 'Mai Kula da Lokaci',
      titleAr: 'حارس الوقت',
      descHa: 'Koyi da haddace Suratul Asr',
      descAr: 'إتقان سورة العصر',
      unlocked: (userProgress.surahProgress[103]?.memorizedAyahs?.length || 0) === 3,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <Award className="h-4 w-4" />
            <span>{isHa ? 'Sashe na 4: Ci gaban Karatu' : 'القسم الرابع: سجل الإنجازات والتقدم'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {isHa ? 'Shafin Ci Gaban Yara' : 'لوحة شرف وإنجازات الطفل'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            {isHa
              ? 'Duba adadin taurarin da ka tara, kofuna, da matsayin haddarka a kowace sura.'
              : 'شاهد مجموع النجوم والأوسمة المكتسبة ونسبة إتقانك لكل سورة.'}
          </p>
        </div>

        {/* Certificate Button */}
        <button
          onClick={() => {
            soundService.playFanfare();
            setShowCertificate(true);
          }}
          className="btn-tactile flex items-center gap-2 rounded-2xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition cursor-pointer self-start sm:self-center"
        >
          <Trophy className="h-4 w-4" />
          <span>{isHa ? 'Duba Takardar Yabo (Certificate)' : 'عرض شهادة الإتقان'}</span>
        </button>
      </div>

      {/* Child Profile & Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Child Profile Box */}
        <div className="rounded-3xl bg-linear-to-br from-emerald-800 to-emerald-950 p-6 text-white shadow-md border-2 border-amber-400/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {isHa ? 'Gwarzon Noorul Quran' : 'بطل نور القرآن'}
              </span>
              <button
                onClick={() => setIsEditingName(!isEditingName)}
                className="text-xs text-amber-200 hover:text-white underline cursor-pointer"
              >
                {isEditingName ? (isHa ? 'Soke' : 'إلغاء') : (isHa ? 'Sauya Suna' : 'تعديل الاسم')}
              </button>
            </div>

            {isEditingName ? (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-hidden"
                  placeholder={isHa ? 'Sunanka...' : 'اسمك الكريم...'}
                />
                <button
                  onClick={handleSaveName}
                  className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900"
                >
                  {isHa ? 'Ajiye' : 'حفظ'}
                </button>
              </div>
            ) : (
              <h2 className="text-xl font-black text-white mt-1">
                {userProgress.childName}
              </h2>
            )}
            <p className="text-xs text-emerald-200 mt-1">
              {isHa ? 'Ɗalibi mai ƙoƙari a karatun Alƙur\'ani' : 'طالب مجتهد في حلقات القرآن الكريم'}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs text-amber-200 font-semibold">
            <span>{isHa ? 'Babban Matsayi:' : 'الدرجة العامة:'}</span>
            <span className="font-bold text-white bg-emerald-700/80 px-2 py-0.5 rounded-md">
              {overallMastery}% {isHa ? 'Kwarewa' : 'إتقان'}
            </span>
          </div>
        </div>

        {/* Stars Counter Card with Generated Medal Image */}
        <div className="rounded-3xl bg-white p-6 shadow-md border-2 border-slate-200 flex items-center gap-4">
          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 shadow-sm bg-amber-50">
            <img
              src="/src/assets/images/badge_quran_star_1792515984848.jpg"
              alt="Quran star medal badge"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {isHa ? 'Taurari (Stars)' : 'مجموع النجوم'}
            </span>
            <p className="text-3xl font-black text-slate-900 font-mono mt-0.5">
              {userProgress.totalStars}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {isHa ? 'Ana samun taurari ta hanyar koya, maimaitawa da hadda!' : 'تكسب النجوم بالاستماع والترديد والحفظ'}
            </p>
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="rounded-3xl bg-white p-6 shadow-md border-2 border-slate-200 flex items-center gap-4">
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 border border-orange-200 shadow-sm">
            <Flame className="h-10 w-10 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              {isHa ? 'Kwanaki a Jere' : 'أيام متتالية'}
            </span>
            <p className="text-3xl font-black text-slate-900 font-mono mt-0.5">
              {userProgress.streakDays} {isHa ? 'Kwanaki' : 'أيام'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {isHa ? 'Karatun kowace rana yana sanya albarka a rayuwa' : 'تلاوة يومية مباركة ومستمرة'}
            </p>
          </div>
        </div>

      </div>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900">
          {isHa ? 'Lambobin Yabo (Badges 6)' : 'أوسمة الإنجاز للسور الست'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl p-4 text-center border-2 transition-all ${
                b.unlocked
                  ? 'bg-amber-50/70 border-amber-400 shadow-md scale-100'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`flex h-12 w-12 mx-auto items-center justify-center rounded-full text-lg mb-2 shadow-xs ${
                  b.unlocked ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {b.unlocked ? '🏅' : '🔒'}
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {isHa ? b.titleHa : b.titleAr}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                {isHa ? b.descHa : b.descAr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Surah Progress Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900">
          {isHa ? 'Matsayin Kowane Sura' : 'تفاصيل إنجاز كل سورة'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SURAHS_DATA.map((surah) => {
            const p = userProgress.surahProgress[surah.number];
            const learnedCount = p?.learnedAyahs?.length || 0;
            const repeatedCount = p?.repeatedAyahs?.length || 0;
            const memorizedCount = p?.memorizedAyahs?.length || 0;

            return (
              <div
                key={surah.number}
                className="rounded-2xl bg-white p-5 border-2 border-slate-200/90 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                      {surah.number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {isHa ? surah.nameHausa : surah.nameArabic}
                    </h3>
                  </div>
                  <span className="font-quran text-lg font-bold text-emerald-800">
                    {surah.nameArabic}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      {isHa ? 'An Koya' : 'المقروء'}
                    </span>
                    <span className="font-mono font-black text-slate-900 mt-0.5 block">
                      {learnedCount}/{surah.ayahCount}
                    </span>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-2 border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">
                      {isHa ? 'An Maimaita' : 'المردد'}
                    </span>
                    <span className="font-mono font-black text-slate-900 mt-0.5 block">
                      {repeatedCount}/{surah.ayahCount}
                    </span>
                  </div>

                  <div className="rounded-xl bg-teal-50 p-2 border border-teal-100">
                    <span className="text-[10px] uppercase font-bold text-teal-700 block">
                      {isHa ? 'An Haddace' : 'المحفوظ'}
                    </span>
                    <span className="font-mono font-black text-slate-900 mt-0.5 block">
                      {memorizedCount}/{surah.ayahCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">
                    {p?.quizCompleted
                      ? (isHa ? `Gwajin Hadda: ${p.score}%` : `الاختبار: ${p.score}%`)
                      : (isHa ? 'Ba a yi gwajin hadda ba tukuna' : 'لم يتم الاختبار بعد')}
                  </span>
                  <button
                    onClick={() => onNavigateTab('learn', surah.number)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition cursor-pointer"
                  >
                    {isHa ? 'Koyi Yanzu ➔' : 'تعلّم الآن ➔'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Offline Storage & Audio Downloader Card */}
      <section className="rounded-3xl bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-7 text-white shadow-lg border-2 border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
              <Download className="h-3.5 w-3.5" />
              <span>{isHa ? 'Aiki Ba Tare Da Intanet Ba (Offline Mode)' : 'خاصية العمل دون اتصال بالإنترنت'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {isHa ? 'Sauke Sautin Dukkan Surori Don Karatu Ba Tare Da Intanet Ba' : 'تحميل جميع التلاوات للعمل بدون إنترنت على جهازك'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
              {isHa
                ? 'Danna maballin da ke ƙasa don sauke dukkan sautin ayoyi 28 na surori 6 a cikin ma\'ajiyar wayarka. Bayan ka sauke, za ka iya karatu a ko\'ina koda babu intanet!'
                : 'اضغط لتحميل جميع الآيات وتخزينها في هاتفك للاستماع إليها أينما كنت بدون حاجة لشبكة الإنترنت.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
            <button
              disabled={isDownloadingOffline}
              onClick={handleDownloadOfflineAudio}
              className="btn-tactile flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 px-6 py-3.5 text-sm font-black text-slate-900 shadow-md transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isDownloadingOffline ? 'animate-spin' : ''}`} />
              <span>
                {isDownloadingOffline
                  ? (isHa ? `Ana saukewa (${downloadProgress}%)...` : `جاري التحميل (${downloadProgress}%)...`)
                  : (isHa ? 'Sauke Don Offline (Free)' : 'تحميل للعمل دون إنترنت')}
              </span>
            </button>

            {downloadSuccess && (
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isHa ? 'An sauke dukkan surori a wayarka!' : 'تم حفظ كافة التلاوات بنجاح!'}</span>
              </span>
            )}

            <div className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1.5 pt-1">
              <span>{isHa ? 'Ayoyin da ke ajiye a wayarka:' : 'الآيات المخزنة في جهازك:'}</span>
              <span className="font-mono font-bold text-amber-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700/60">
                {cachedAudioCount} / 28
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Export Source Code & Android Offline Package Card */}
      <section className="rounded-3xl bg-linear-to-r from-amber-500/10 via-white to-emerald-500/10 p-6 sm:p-7 border-2 border-amber-400 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isHa ? 'Mallakar Code Kyauta · Ba Biyan Google Cloud' : 'تنزيل الكود مجاناً · بدون جوجل كلاود'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {isHa ? 'Sauke Cikakken Fayilolin NOORUL QURAN (ZIP)' : 'تحميل حزمة الكود المصدري الكاملة'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isHa
                ? 'Zaka iya sauke dukkan source code ko ginin dist a cikin fayilolin ZIP don sanyawa a wayar Android, Vercel, Netlify, ko PWABuilder ba tare da katin banki ko biyan kuɗi ba.'
                : 'يمكنك تحميل الكود المصدري كاملاً بصيغة ZIP لتشغيله على هاتفك أو استضافته مجاناً على Vercel أو Netlify.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
            <div className="flex items-center gap-2">
              <a
                href="/noorul-quran-source.zip"
                download="noorul-quran-source.zip"
                onClick={() => soundService.playStarChime()}
                className="btn-tactile flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-black text-white shadow-sm transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isHa ? 'Source ZIP (3.1 MB)' : 'كود المشروع ZIP'}</span>
              </a>

              <a
                href="/noorul-quran-dist.zip"
                download="noorul-quran-dist.zip"
                onClick={() => soundService.playStarChime()}
                className="btn-tactile flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-black text-slate-900 shadow-sm transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isHa ? 'Dist ZIP (396 KB)' : 'النسخة الجاهزة'}</span>
              </a>
            </div>

            {onOpenExportModal && (
              <button
                onClick={() => {
                  soundService.playClick();
                  onOpenExportModal();
                }}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
              >
                {isHa ? 'Duba Cikakken Jagora na Android (Guide) ➔' : 'عرض الدليل الكامل للأندرويد ➔'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#FFFDF8] p-6 sm:p-8 shadow-2xl border-8 border-amber-400 text-center space-y-4">
            
            {/* Certificate Header */}
            <div className="border-b-2 border-amber-300/80 pb-4">
              <span className="font-arabic text-xl font-bold text-emerald-800">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                NOORUL QURAN
              </h2>
              <p className="text-xs uppercase font-extrabold tracking-widest text-amber-800">
                {isHa ? 'Takardar Shaidar Ƙwarewa Ga Yara' : 'شهادة إتقان وتفوق في القرآن الكريم'}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-2 space-y-3">
              <p className="text-sm text-slate-600 font-medium">
                {isHa ? 'Wannan takardar shaida ce mai albarka ga:' : 'تشهد إدارة تطبيق نور القرآن بأن الطالب المبارك:'}
              </p>
              <div className="inline-block rounded-2xl bg-amber-100/70 px-6 py-2.5 border-2 border-amber-400">
                <span className="text-xl sm:text-2xl font-black text-emerald-900">
                  {userProgress.childName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium max-w-md mx-auto">
                {isHa
                  ? `Ya nuna ƙwazo da ƙoƙari a koyo, saurara, maimaitawa da haddar Surorin Alƙur\'ani Mai Tsarki (Fatiha, Ikhlas, Falaq, Nas, Kauthar, Asr) kuma ya tara taurari ${userProgress.totalStars}!`
                  : `قد اجتهد وتميز في تلاوة وترديد وحفظ السور المقررة، وحصل على ${userProgress.totalStars} نجمة مباركة!`}
              </p>
            </div>

            {/* Certificate Seal & Close */}
            <div className="pt-4 border-t border-amber-300 flex items-center justify-between">
              <div className="text-left text-[11px] font-bold text-emerald-900">
                <p>NOORUL QURAN ACADEMY</p>
                <p className="text-slate-400 font-mono text-[10px]">{new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-md border-2 border-amber-500">
                ★ SEAL ★
              </div>

              <button
                onClick={() => setShowCertificate(false)}
                className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                {isHa ? 'Rufe' : 'إغلاق'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
