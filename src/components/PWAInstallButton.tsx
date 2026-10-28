import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { Language } from '../types/quran';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const isHa = language === 'ha';

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition btn-tactile cursor-pointer"
        title={isHa ? "Sanya Noorul Quran a wayarka" : "تثبيت نور القرآن على جهازك"}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isHa ? 'Sauke App' : 'تثبيت التطبيق'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-800/40 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-700/50 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isHa ? 'Sanya a iPhone' : 'تثبيت على آيفون'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border-2 border-emerald-500">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-emerald-900">
                  {isHa ? 'Yadda ake sanyawa a iPhone/iPad' : 'كيفية التثبيت على أجهزة آبل'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-xs">1</span>
                  <span>{isHa ? 'Taba maballin Share (Tura) a kasan Safari.' : 'اضغط على زر المشاركة (Share) في متصفح سفاري.'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-xs">2</span>
                  <span>{isHa ? 'Gungura kasa sannan ka zabi "Add to Home Screen" (Sanya a fuskar waya).' : 'مرر للأسفل واختر "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-xs">3</span>
                  <span>{isHa ? 'Yanzu za ka iya bude app koda ba intanet!' : 'الآن يمكنك فتح التطبيق في أي وقت حتى بدون إنترنت!'}</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition"
              >
                {isHa ? 'Na fahimta' : 'فهمت ذلك'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
