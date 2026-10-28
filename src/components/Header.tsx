import React from 'react';
import { Star, Flame, Volume2, VolumeX, BookOpen, Repeat, Brain, Award, Download } from 'lucide-react';
import { Language, UserProgress } from '../types/quran';
import { soundService } from '../services/soundService';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'home' | 'learn' | 'repeat' | 'memorize' | 'progress';
  onSelectTab: (tab: 'home' | 'learn' | 'repeat' | 'memorize' | 'progress') => void;
  language: Language;
  onToggleLanguage: () => void;
  userProgress: UserProgress;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenExportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  userProgress,
  isMuted,
  onToggleMute,
  onOpenExportModal,
}) => {
  const isHa = language === 'ha';

  const navItems = [
    {
      id: 'learn' as const,
      labelHa: 'Koyon Alƙur\'ani',
      labelAr: 'تعلّم القرآن',
      icon: BookOpen,
    },
    {
      id: 'repeat' as const,
      labelHa: 'Saurara da Maimaitawa',
      labelAr: 'استمع وردد',
      icon: Repeat,
    },
    {
      id: 'memorize' as const,
      labelHa: 'Haddar Surori',
      labelAr: 'حفظ السور',
      icon: Brain,
    },
    {
      id: 'progress' as const,
      labelHa: 'Ci gaban Karatu',
      labelAr: 'تقدّم التعلم',
      icon: Award,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/30 bg-[#064E3B] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        
        {/* Zone 1: Single text element wordmark / brand */}
        <button
          onClick={() => {
            soundService.playClick();
            onSelectTab('home');
          }}
          className="group flex items-center gap-2.5 text-left transition cursor-pointer shrink-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-amber-400 to-yellow-300 text-slate-900 shadow-md ring-2 ring-amber-300/60 group-hover:scale-105 transition">
            <span className="font-arabic text-lg font-bold">نُور</span>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-wide text-white flex items-center gap-1.5 whitespace-nowrap">
              NOORUL QURAN
              <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                {isHa ? 'Ga Yara' : 'للأطفال'}
              </span>
            </span>
            <p className="text-[11px] font-medium text-emerald-200/90 whitespace-nowrap">
              {isHa ? 'Koyon Karatu & Hadda (6–10)' : 'تلاوة وحفظ القرآن الكريم'}
            </p>
          </div>
        </button>

        {/* Zone 2: Single-line clean navigation links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundService.playClick();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700/80 text-amber-300 shadow-inner ring-1 ring-amber-400/40'
                    : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-emerald-300'}`} />
                <span>{isHa ? item.labelHa : item.labelAr}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Status (Stars, Streak, Sound, Language, Install) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Total Stars Pill */}
          <button
            onClick={() => {
              soundService.playStarChime();
              onSelectTab('progress');
            }}
            className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition cursor-pointer"
            title={isHa ? "Taurarin da ka samu" : "مجموع النجوم"}
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span className="tabular-nums font-mono text-sm">{userProgress.totalStars}</span>
          </button>

          {/* Daily Streak */}
          <div
            className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-800/50 px-2.5 py-1 text-xs font-bold text-emerald-200 border border-emerald-700/50"
            title={isHa ? "Kwanakin Karatu a Jere" : "أيام متتالية"}
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="tabular-nums font-mono">{userProgress.streakDays}d</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => {
              soundService.playClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1 rounded-full bg-emerald-800/80 px-2.5 py-1 text-xs font-bold text-emerald-100 hover:bg-emerald-700 border border-emerald-600/40 transition cursor-pointer"
            title={isHa ? "Sauya Harshe zuwa Larabci" : "تغيير اللغة إلى الهوسا"}
          >
            <span className="text-amber-300 font-bold">{isHa ? 'HA' : 'عَر'}</span>
            <span className="text-emerald-300/80 text-[10px]">⇄</span>
            <span className="opacity-70">{isHa ? 'عربي' : 'Hausa'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundService.playClick();
            }}
            className="rounded-full p-2 text-emerald-200 hover:bg-emerald-800/80 hover:text-white transition cursor-pointer"
            title={isMuted ? (isHa ? 'Kunna sauti' : 'تشغيل الصوت') : (isHa ? 'Kashe sauti' : 'كتم الصوت')}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-300" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Export / Download Source Code Button */}
          {onOpenExportModal && (
            <button
              onClick={() => {
                soundService.playClick();
                onOpenExportModal();
              }}
              className="flex items-center gap-1.5 rounded-full bg-emerald-800/90 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 transition cursor-pointer"
              title={isHa ? "Sauke Source Code (ZIP)" : "تحميل كود المشروع"}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isHa ? 'Sauke Code' : 'تحميل الكود'}</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton language={language} />
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto no-scrollbar border-t border-emerald-800/60 bg-[#053F30] px-2 py-1.5 gap-1.5">
        <button
          onClick={() => {
            soundService.playClick();
            onSelectTab('home');
          }}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
            currentTab === 'home' ? 'bg-emerald-700 text-amber-300' : 'text-emerald-200'
          }`}
        >
          {isHa ? 'Farko (Gida)' : 'الرئيسية'}
        </button>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundService.playClick();
                onSelectTab(item.id);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-emerald-700 text-amber-300 shadow-xs' : 'text-emerald-200 hover:bg-emerald-800/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{isHa ? item.labelHa : item.labelAr}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
