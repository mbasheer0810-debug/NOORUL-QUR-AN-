import React from 'react';
import { BookOpen, Repeat, Brain, Award, Star, Play, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import { Language, UserProgress, Surah } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';
import { soundService } from '../services/soundService';
import { audioService } from '../services/audioService';

interface HomeScreenProps {
  language: Language;
  userProgress: UserProgress;
  onNavigate: (tab: 'learn' | 'repeat' | 'memorize' | 'progress', surahNumber?: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  userProgress,
  onNavigate,
}) => {
  const isHa = language === 'ha';

  const handleBismillahAudio = () => {
    soundService.playStarChime();
    audioService.playAyah('001001');
  };

  const mainButtons = [
    {
      id: 'learn' as const,
      num: '1',
      titleHa: 'Koyon Alƙur\'ani',
      titleAr: 'تعلّم القرآن الكريم',
      descHa: 'Karanta kowace aya, duba fassarar Hausa, da ma\'anar kalma-da-kalma.',
      descAr: 'قراءة الآيات مع التفسير والترجمة كلمة بكلمة وأحكام التجويد الميسرة.',
      icon: BookOpen,
      gradient: 'from-emerald-700 via-emerald-800 to-emerald-950',
      badgeColor: 'bg-emerald-500',
      tagHa: 'Karatu & Fassara',
      tagAr: 'تلاوة وتفسير',
    },
    {
      id: 'repeat' as const,
      num: '2',
      titleHa: 'Saurara da Maimaitawa',
      titleAr: 'استمع وردد مع القارئ',
      descHa: 'Saurari muryar Sheikh Al-Husary a hankali sannan ka maimaita don samun taurari!',
      descAr: 'استمع لترتيل الشيخ المعلم وردد خلفه واكسب النجوم والجوائز.',
      icon: Repeat,
      gradient: 'from-amber-600 via-amber-700 to-amber-900',
      badgeColor: 'bg-amber-500',
      tagHa: 'Karatun Malami',
      tagAr: 'ترتيل تفاعلي',
    },
    {
      id: 'memorize' as const,
      num: '3',
      titleHa: 'Haddar Surori',
      titleAr: 'حفظ السور والمسابقات',
      descHa: 'Wasannin hadda: boye kalmomi, jera kalmomin aya, da gwajin hadda.',
      descAr: 'ألعاب تثبيت الحفظ: إخفاء الكلمات، ترتيب الآيات، واختبارات الحفظ.',
      icon: Brain,
      gradient: 'from-teal-700 via-teal-800 to-teal-950',
      badgeColor: 'bg-teal-500',
      tagHa: 'Wasan Hadda',
      tagAr: 'ألعاب الذاكرة',
    },
    {
      id: 'progress' as const,
      num: '4',
      titleHa: 'Ci gaban Karatu',
      titleAr: 'تقدّم التعلم والإنجازات',
      descHa: 'Duba lambobin yabo (badges), taurarin da ka tara, da shaidar kwarewa.',
      descAr: 'شاهد الأوسمة والشهادات ومجموع النجوم وسجل إنجازاتك اليومية.',
      icon: Award,
      gradient: 'from-indigo-700 via-indigo-800 to-indigo-950',
      badgeColor: 'bg-indigo-500',
      tagHa: 'Kofuna & Shaidu',
      tagAr: 'شهادات وأوسمة',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#047857] via-[#065F46] to-[#044E39] text-white shadow-xl border-2 border-amber-400/40">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/10 blur-2xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-8">
          
          {/* Left Text Zone */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isHa ? 'Bismillah! Barka da zuwa Noorul Quran' : 'بسم الله! أهلاً بكم في نور القرآن'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isHa ? (
                <>
                  Koyon Alƙur'ani Mai Sauƙi da Daɗi{' '}
                  <span className="text-amber-300">Ga Yara (6–10)</span>
                </>
              ) : (
                <>
                  تعلّم وتلاوة وحفظ القرآن الكريم{' '}
                  <span className="text-amber-300">للأطفال (٦-١٠ سنوات)</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base font-medium text-emerald-100/90 leading-relaxed max-w-xl">
              {isHa
                ? 'Koyi karatun surori 6 masu albarka (Fatiha, Ikhlas, Falaq, Nas, Kauthar, Asr) tare da sautin malaman Alƙur\'ani da fassarar Hausa a sauƙaƙe.'
                : 'تعلّم السور الست المباركة (الفاتحة، الإخلاص، الفلق، الناس، الكوثر، العصر) بالصوت العذب والترتيل المتقن والتفسير للأطفال.'}
            </p>

            {/* Quick Interactive Bismillah & Learn buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleBismillahAudio}
                className="btn-tactile flex items-center gap-2 rounded-2xl bg-linear-to-r from-amber-400 to-amber-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-md hover:from-amber-300 hover:to-amber-400 transition cursor-pointer"
              >
                <Volume2 className="h-4 w-4" />
                <span>{isHa ? 'Saurari Bismillah' : 'استمع إلى البسملة'}</span>
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('learn', 1);
                }}
                className="btn-tactile flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-xs hover:bg-white/20 border border-white/20 transition cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white text-white" />
                <span>{isHa ? 'Fara Suratul Fatiha' : 'ابدأ سورة الفاتحة'}</span>
              </button>
            </div>
          </div>

          {/* Right Image Zone: Generated Islamic Kids Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl border-4 border-amber-300/60 max-w-sm w-full aspect-16/10 bg-emerald-950">
              <img
                src="/src/assets/images/hero_noorul_quran_1792515985128.jpg"
                alt="Children learning Quran with radiant light and crescent moon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                <span className="text-xs font-semibold text-amber-200">
                  {isHa ? '✨ Karatun Alƙur\'ani haske ne a cikin zuciya' : '✨ القرآن الكريم نور وهداية للقلوب'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOUR MAIN BUTTONS SECTION (Core User Prompt Requirement) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-black text-emerald-950">
              {isHa ? 'Zaɓi Hanyar Karatu' : 'الأقسام الرئيسية الأربعة'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isHa ? 'Maballai 4 na musamman don koyo, maimaitawa, da hadda' : 'أربعة مسارات تفاعلية لتعليم وتثبيت القرآن للأطفال'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-full self-start">
            <span>{isHa ? 'Aiki Koda Ba Intanet' : 'يعمل بدون إنترنت'}</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {mainButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  soundService.playClick();
                  onNavigate(btn.id);
                }}
                className={`btn-tactile group relative overflow-hidden rounded-3xl bg-linear-to-br ${btn.gradient} p-6 sm:p-7 text-left text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-amber-400/40 cursor-pointer flex flex-col justify-between min-h-[200px]`}
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-36 w-36 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-amber-300 shadow-inner ring-2 ring-amber-400/40 group-hover:scale-110 transition duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
                        {isHa ? btn.tagHa : btn.tagAr}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {btn.num}. {isHa ? btn.titleHa : btn.titleAr}
                      </h3>
                    </div>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-extrabold text-sm shadow-sm group-hover:scale-110 transition">
                    ➔
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-emerald-100/90 leading-relaxed">
                  {isHa ? btn.descHa : btn.descAr}
                </p>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-amber-300">
                  <span>{isHa ? 'Danna Don Fara Aiki' : 'اضغط للبدء الآن'}</span>
                  <span className="text-white/60">★ ★ ★</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Surahs Carousel / Grid (The 6 Required Surahs) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-emerald-950">
              {isHa ? 'Surorin da Za A Koya (Surori 6)' : 'السور المقررة للتعلم (٦ سور)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isHa
                ? 'Danna kowace sura don fara koyo, saurara, ko haddace ta'
                : 'اضغط على السورة للاستماع والتلاوة واختبار الحفظ'}
            </p>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('learn');
            }}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{isHa ? 'Duba Duka' : 'عرض الكل'}</span>
            <span>➔</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SURAHS_DATA.map((surah) => {
            const p = userProgress.surahProgress[surah.number];
            const learnedCount = p?.learnedAyahs?.length || 0;
            const memorizedCount = p?.memorizedAyahs?.length || 0;
            const pct = Math.round(((learnedCount + memorizedCount) / (surah.ayahCount * 2)) * 100);

            return (
              <div
                key={surah.number}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-md border-2 border-slate-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-base border border-emerald-200">
                        {surah.number}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {isHa ? surah.nameHausa : surah.nameArabic}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {isHa ? `${surah.ayahCount} Ayoyi · ${surah.revelationTypeHa}` : `${surah.ayahCount} آيات · ${surah.revelationType === 'Makkah' ? 'مكية' : 'مدنية'}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-quran text-2xl font-bold text-emerald-800">
                        {surah.nameArabic}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {isHa ? surah.meaningHausa : surah.meaningArabic}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>{isHa ? 'Ci gaba' : 'نسبة الإنجاز'}</span>
                      <span className="tabular-nums font-mono text-emerald-700">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons for this Surah */}
                <div className="mt-5 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      soundService.playClick();
                      onNavigate('learn', surah.number);
                    }}
                    className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 py-2 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                    title={isHa ? 'Koyi Karatu' : 'تعلّم'}
                  >
                    <BookOpen className="h-4 w-4 mb-0.5 text-emerald-600" />
                    <span>{isHa ? 'Koyo' : 'تعلّم'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundService.playClick();
                      onNavigate('repeat', surah.number);
                    }}
                    className="flex flex-col items-center justify-center rounded-xl bg-amber-50 py-2 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                    title={isHa ? 'Maimaita' : 'ردد'}
                  >
                    <Repeat className="h-4 w-4 mb-0.5 text-amber-600" />
                    <span>{isHa ? 'Maimaita' : 'ردد'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundService.playClick();
                      onNavigate('memorize', surah.number);
                    }}
                    className="flex flex-col items-center justify-center rounded-xl bg-teal-50 py-2 text-[11px] font-bold text-teal-800 hover:bg-teal-100 transition cursor-pointer"
                    title={isHa ? 'Hadda' : 'حفظ'}
                  >
                    <Brain className="h-4 w-4 mb-0.5 text-teal-600" />
                    <span>{isHa ? 'Hadda' : 'حفظ'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Motivational Hadith Card for Children */}
      <section className="rounded-3xl bg-linear-to-r from-amber-50 to-emerald-50 p-6 border-2 border-amber-300 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-md">
            <Star className="h-8 w-8 fill-slate-900" />
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {isHa ? 'Hadisin Yau Ga Yara' : 'حديث اليوم للأطفال الصغار'}
            </span>
            <p className="font-quran text-2xl font-bold text-emerald-950 leading-relaxed">
              «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»
            </p>
            <p className="text-sm font-semibold text-slate-700 italic">
              {isHa
                ? 'Manzon Allah (SAW) ya ce: "Mafi alherinku shi ne wanda ya koyi Alƙur\'ani kuma ya koyar da shi." (Sahihul Bukhari)'
                : 'قال رسول الله صلى الله عليه وسلم: "خيركم من تعلم القرآن وعلمه" (رواه البخاري)'}
            </p>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('memorize');
            }}
            className="btn-tactile shrink-0 rounded-2xl bg-emerald-700 hover:bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-md transition cursor-pointer"
          >
            {isHa ? 'Fara Hadda Yanzu' : 'ابدأ الحفظ الآن'}
          </button>
        </div>
      </section>
    </div>
  );
};
