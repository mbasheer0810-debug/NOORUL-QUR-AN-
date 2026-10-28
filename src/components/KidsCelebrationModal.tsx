import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, Sparkles, X } from 'lucide-react';
import { soundService } from '../services/soundService';
import { Language } from '../types/quran';

interface KidsCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleHa: string;
  titleAr: string;
  messageHa: string;
  messageAr: string;
  starsEarned: number;
  badgeNameHa?: string;
  badgeNameAr?: string;
  language: Language;
}

export const KidsCelebrationModal: React.FC<KidsCelebrationModalProps> = ({
  isOpen,
  onClose,
  titleHa,
  titleAr,
  messageHa,
  messageAr,
  starsEarned,
  badgeNameHa,
  badgeNameAr,
  language,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundService.playFanfare();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHa = language === 'ha';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-linear-to-b from-amber-50 via-white to-emerald-50 p-6 text-center shadow-2xl border-4 border-amber-400">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big celebratory star or trophy */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-tr from-amber-400 to-yellow-200 shadow-lg ring-8 ring-amber-100 animate-bounce">
          <Trophy className="h-10 w-10 text-amber-900" />
        </div>

        <h3 className="text-2xl font-black text-emerald-900">
          {isHa ? titleHa : titleAr}
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-700 leading-relaxed">
          {isHa ? messageHa : messageAr}
        </p>

        {/* Stars earned badge */}
        <div className="my-5 inline-flex items-center gap-2 rounded-2xl bg-amber-100/80 px-4 py-2 border border-amber-300">
          <Sparkles className="h-5 w-5 text-amber-600 animate-spin" />
          <span className="text-base font-extrabold text-amber-900">
            +{starsEarned} {isHa ? 'Taurari (Stars)' : 'نجوم جديدة'}
          </span>
          <div className="flex text-amber-500">
            {Array.from({ length: Math.min(starsEarned, 5) }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
            ))}
          </div>
        </div>

        {badgeNameHa && (
          <div className="mb-5 rounded-2xl bg-emerald-100/70 p-3 border border-emerald-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {isHa ? 'Lambar Yabo (Sabon Badge)' : 'وسام جديد'}
            </span>
            <p className="text-base font-black text-emerald-900 mt-0.5">
              🏅 {isHa ? badgeNameHa : badgeNameAr}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 py-3.5 text-base font-black text-white shadow-lg shadow-emerald-700/30 hover:from-emerald-700 hover:to-emerald-800 transition active:scale-98 cursor-pointer"
        >
          {isHa ? 'Alhamdulillah! Ci gaba' : 'الحمد لله! استمر في التعلم'}
        </button>
      </div>
    </div>
  );
};
