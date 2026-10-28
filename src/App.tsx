import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { LearnQuran } from './components/LearnQuran';
import { ListenRepeat } from './components/ListenRepeat';
import { MemorizeSurahs } from './components/MemorizeSurahs';
import { LearningProgress } from './components/LearningProgress';
import { OfflineIndicator } from './components/OfflineIndicator';
import { KidsCelebrationModal } from './components/KidsCelebrationModal';
import { ExportSourceModal } from './components/ExportSourceModal';
import {
  loadUserProgress,
  saveUserProgress,
  getLanguagePreference,
  setLanguagePreference,
  getTranslitPreference,
  setTranslitPreference,
} from './services/storageService';
import { soundService } from './services/soundService';
import { Language, UserProgress } from './types/quran';
import { BookOpen, Repeat, Brain, Award, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'learn' | 'repeat' | 'memorize' | 'progress'>('home');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [language, setLanguage] = useState<Language>(getLanguagePreference());
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress());
  const [showTransliteration, setShowTransliteration] = useState<boolean>(getTranslitPreference());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Celebration Modal State
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    titleHa: string;
    titleAr: string;
    messageHa: string;
    messageAr: string;
    stars: number;
    badgeHa?: string;
    badgeAr?: string;
  }>({
    isOpen: false,
    titleHa: '',
    titleAr: '',
    messageHa: '',
    messageAr: '',
    stars: 0,
  });

  // Sync HTML lang and dir when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
    setLanguagePreference(language);
  }, [language]);

  const handleToggleLanguage = () => {
    const nextLang = language === 'ha' ? 'ar' : 'ha';
    setLanguage(nextLang);
  };

  const handleUpdateProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    saveUserProgress(newProgress);
  };

  const handleToggleTransliteration = () => {
    soundService.playClick();
    const nextVal = !showTransliteration;
    setShowTransliteration(nextVal);
    setTranslitPreference(nextVal);
  };

  const handleToggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleNavigate = (
    tab: 'home' | 'learn' | 'repeat' | 'memorize' | 'progress',
    surahNumber?: number
  ) => {
    if (surahNumber) {
      setSelectedSurahNumber(surahNumber);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCelebration = (data: {
    titleHa: string;
    titleAr: string;
    messageHa: string;
    messageAr: string;
    stars: number;
    badgeHa?: string;
    badgeAr?: string;
  }) => {
    setCelebrationData({
      isOpen: true,
      titleHa: data.titleHa,
      titleAr: data.titleAr,
      messageHa: data.messageHa,
      messageAr: data.messageAr,
      stars: data.stars,
      badgeHa: data.badgeHa,
      badgeAr: data.badgeAr,
    });
  };

  const isHa = language === 'ha';

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#1E293B] flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        userProgress={userProgress}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'home' && (
          <HomeScreen
            language={language}
            userProgress={userProgress}
            onNavigate={(tab, surahNumber) => handleNavigate(tab, surahNumber)}
          />
        )}

        {currentTab === 'learn' && (
          <LearnQuran
            initialSurahNumber={selectedSurahNumber}
            language={language}
            userProgress={userProgress}
            onUpdateProgress={handleUpdateProgress}
            onNavigateTab={(tab, surahNumber) => handleNavigate(tab, surahNumber)}
            showTransliteration={showTransliteration}
            onToggleTransliteration={handleToggleTransliteration}
            onOpenCelebration={handleOpenCelebration}
          />
        )}

        {currentTab === 'repeat' && (
          <ListenRepeat
            initialSurahNumber={selectedSurahNumber}
            language={language}
            userProgress={userProgress}
            onUpdateProgress={handleUpdateProgress}
            onOpenCelebration={handleOpenCelebration}
          />
        )}

        {currentTab === 'memorize' && (
          <MemorizeSurahs
            initialSurahNumber={selectedSurahNumber}
            language={language}
            userProgress={userProgress}
            onUpdateProgress={handleUpdateProgress}
            onOpenCelebration={handleOpenCelebration}
          />
        )}

        {currentTab === 'progress' && (
          <LearningProgress
            language={language}
            userProgress={userProgress}
            onUpdateProgress={handleUpdateProgress}
            onNavigateTab={(tab, surahNumber) => handleNavigate(tab, surahNumber)}
            onOpenCelebration={handleOpenCelebration}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Fixed Navigation Bar (Kid thumb-friendly) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-emerald-800/20 bg-white/95 backdrop-blur-md shadow-lg py-1 px-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => handleNavigate('learn')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold transition cursor-pointer ${
              currentTab === 'learn' ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="h-5 w-5 mb-0.5" />
            <span>{isHa ? 'Koyo' : 'تعلّم'}</span>
          </button>

          <button
            onClick={() => handleNavigate('repeat')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold transition cursor-pointer ${
              currentTab === 'repeat' ? 'text-amber-600 font-extrabold' : 'text-slate-500'
            }`}
          >
            <Repeat className="h-5 w-5 mb-0.5" />
            <span>{isHa ? 'Maimaita' : 'ردد'}</span>
          </button>

          <button
            onClick={() => handleNavigate('home')}
            className="flex flex-col items-center -mt-4 bg-emerald-700 text-amber-300 p-2.5 rounded-full shadow-lg border-2 border-amber-300 cursor-pointer active:scale-95 transition"
          >
            <span className="font-arabic font-bold text-sm">نور</span>
          </button>

          <button
            onClick={() => handleNavigate('memorize')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold transition cursor-pointer ${
              currentTab === 'memorize' ? 'text-teal-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <Brain className="h-5 w-5 mb-0.5" />
            <span>{isHa ? 'Hadda' : 'حفظ'}</span>
          </button>

          <button
            onClick={() => handleNavigate('progress')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold transition cursor-pointer ${
              currentTab === 'progress' ? 'text-indigo-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <Award className="h-5 w-5 mb-0.5" />
            <span>{isHa ? 'Ci gaba' : 'الإنجاز'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/90 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <span className="font-arabic text-base text-emerald-800">نُورُ القُرْآن</span>
            <span>·</span>
            <span>NOORUL QURAN</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal">{isHa ? 'Koyon Alƙur\'ani Ga Yara' : 'تعليم القرآن للأطفال'}</span>
          </div>

          <p className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span>{isHa ? 'Alƙur\'ani Mai Girma da fassarar Hausa da Larabci' : 'تلاوة مباركة وترجمة بالهوسا والعربية'}</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          </p>

          <p className="text-slate-400">
            {isHa ? 'Ajiye ci gaba a wayarka · Aiki koda ba intanet' : 'حفظ التقدم على الجهاز · يعمل دون إنترنت'}
          </p>
        </div>
      </footer>

      {/* Offline Alert Indicator */}
      <OfflineIndicator language={language} />

      {/* Celebration Modal */}
      <KidsCelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        titleHa={celebrationData.titleHa}
        titleAr={celebrationData.titleAr}
        messageHa={celebrationData.messageHa}
        messageAr={celebrationData.messageAr}
        starsEarned={celebrationData.stars}
        badgeNameHa={celebrationData.badgeHa}
        badgeNameAr={celebrationData.badgeAr}
        language={language}
      />

      {/* Export Source Code & Free Android Guide Modal */}
      <ExportSourceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        language={language}
      />
    </div>
  );
}
