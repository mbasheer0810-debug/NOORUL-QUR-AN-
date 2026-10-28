import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { Language } from '../types/quran';

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const isHa = language === 'ha';

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600/95 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xs border border-amber-400/40 animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>
        {isHa
          ? 'Yanayin Ba Intanet — Karatu da bayanan da aka ajiye a wayarka suna aiki!'
          : 'وضع عدم الاتصال — يمكنك المتابعة بدون إنترنت عبر الذاكرة المحفوظة!'}
      </span>
    </div>
  );
};
