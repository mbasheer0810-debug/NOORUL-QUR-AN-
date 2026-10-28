import React, { useState } from 'react';
import { Download, FolderArchive, Smartphone, Globe, Terminal, X, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Language } from '../types/quran';
import { soundService } from '../services/soundService';

interface ExportSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ExportSourceModal: React.FC<ExportSourceModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'instructions'>('downloads');

  if (!isOpen) return null;

  const isHa = language === 'ha';

  const handleDownload = () => {
    soundService.playStarChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-4 border-amber-400 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-sm">
            <FolderArchive className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isHa ? 'Kyauta 100% · Ba Biyan Google Cloud' : 'مجاني ١٠٠٪ · بدون اشتراك جوجل كلاود'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {isHa ? 'Sauke Fayilolin NOORUL QURAN (ZIP)' : 'تحميل الكود المصدري لنور القرآن'}
            </h2>
            <p className="text-xs text-slate-600">
              {isHa
                ? 'Mallaki cikakken manhajar a wayarka ko kwamfutarka ba tare da biyan kobo ba.'
                : 'امتلك كود التطبيق كاملاً وشغله على هاتفك مجاناً وبدون أي تكاليف.'}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 my-4 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('downloads');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isHa ? 'Fayilolin Saukewa (Download ZIPs)' : 'ملفات التحميل'}
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('instructions');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'instructions'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isHa ? 'Yadda Zaka Sanya a Android (Guide)' : 'طريقة التشغيل على أندرويد'}
          </button>
        </div>

        {/* TAB 1: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            
            {/* Download Option 1: Complete Source Code */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-950">
                    {isHa ? '1. Cikakken Source Code (Project Source)' : '١. الكود المصدري الكامل للمشروع'}
                  </span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    3.1 MB ZIP
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHa
                    ? 'Ya ƙunshi dukkan lambobin React, TypeScript, hotuna, bayanan surori 6, da tsarin PWA.'
                    : 'يحتوي على كافة ملفات البرمجة والصور والآيات والتفسير وتهيئة PWA.'}
                </p>
              </div>

              <a
                href="/noorul-quran-source.zip"
                download="noorul-quran-source.zip"
                onClick={handleDownload}
                className="btn-tactile shrink-0 flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-3 text-xs font-black text-white shadow-md transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isHa ? 'Sauke Source (ZIP)' : 'تحميل الكود'}</span>
              </a>
            </div>

            {/* Download Option 2: Pre-built Dist (Zero-Node needed) */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-amber-950">
                    {isHa ? '2. Shiryeyyen Ginin Dist (Production Build)' : '٢. النسخة الجاهزة للتشغيل المباشر'}
                  </span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    396 KB ZIP
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHa
                    ? 'Kayan aiki ne da aka riga aka gina! Ba ya buƙatar Node.js ko gina komai; kawai jefa a Netlify ko GitHub Pages.'
                    : 'نسخة مجمعة جاهزة للرفع مباشرة على Netlify Drop أو استضافة مجانية بدون الحاجة لتثبيت برامج.'}
                </p>
              </div>

              <a
                href="/noorul-quran-dist.zip"
                download="noorul-quran-dist.zip"
                onClick={handleDownload}
                className="btn-tactile shrink-0 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-xs font-black text-slate-900 shadow-md transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isHa ? 'Sauke Dist (ZIP)' : 'تحميل النسخة الجاهزة'}</span>
              </a>
            </div>

            {/* Reassurance Note */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">
                  {isHa ? 'Babu buƙatar katin banki ko kobo' : 'لا حاجة لبطاقة بنكية أو أي رسوم'}
                </p>
                <p className="mt-0.5">
                  {isHa
                    ? 'Zaka iya sauke waɗannan fayiloli zuwa wayarka ko kwamfutarka ka adana su na dindindin.'
                    : 'يمكنك الاحتفاظ بهذه الملفات على جهازك وتشغيلها للأبد دون أي ارتباط بجوجل كلاود.'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: STEP-BY-STEP ANDROID GUIDE */}
        {activeTab === 'instructions' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            
            {/* Step 1: Netlify / Vercel (Easiest) */}
            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                <Globe className="h-4 w-4 text-emerald-700" />
                <span>{isHa ? 'Hanya 1: Loda a Netlify Drop (Mafi Sauƙi - Minti 1)' : 'الطريقة الأولى: رفع النسخة على Netlify Drop (أسهل طريقة)'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                <li>{isHa ? 'Sauke "noorul-quran-dist.zip" sannan ka buɗe shi (unzip).' : 'حمّل ملف noorul-quran-dist.zip وفك الضغط عنه.'}</li>
                <li>{isHa ? 'Shiga shafin app.netlify.com/drop a wayarka ko kwamfuta.' : 'افتح موقع app.netlify.com/drop.'}</li>
                <li>{isHa ? 'Jefa foldar a ciki. Nan take zai baka link kyauta (misali: noorul-quran.netlify.app).' : 'اسحب المجلد وافلته في الصفحة وسيعطيك رابطاً مجانياً فوراً.'}</li>
                <li>{isHa ? 'Buɗe wannan link a Chrome a Android sannan ka danna "Install app".' : 'افتح الرابط في كروم على هاتفك واضغط "تثبيت التطبيق".'}</li>
              </ol>
            </div>

            {/* Step 2: Make APK via PWABuilder */}
            <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                <Smartphone className="h-4 w-4 text-amber-700" />
                <span>{isHa ? 'Hanya 2: Mayar da shi Manhajar APK (Microsoft PWABuilder)' : 'الطريقة الثانية: تحويله إلى تطبيق أندرويد APK مجاناً'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                <li>{isHa ? 'Shiga pwabuilder.com (aikin Microsoft na kyauta).' : 'افتح موقع pwabuilder.com التابع لمايكروسوفت.'}</li>
                <li>{isHa ? 'Sanya link ɗin manhajarka sannan ka danna "Start".' : 'ضع رابط موقعك واضغط Start.'}</li>
                <li>{isHa ? 'Danna "Package for Android" sannan ka sauke fayil ɗin .apk kai tsaye!' : 'اختر Package for Android وحمل ملف APK مباشرة لهاتفك.'}</li>
              </ol>
            </div>

            {/* Step 3: Run locally in Termux on Android */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Terminal className="h-4 w-4 text-slate-700" />
                <span>{isHa ? 'Hanya 3: Gudunarwa a Wayar Android (Termux)' : 'الطريقة الثالثة: التشغيل المباشر داخل الهاتف عبر Termux'}</span>
              </div>
              <p className="text-slate-600">
                {isHa
                  ? 'Idan kana da Termux a wayarka, shigar da Node.js (pkg install nodejs), ka buɗe foldar source code ɗin sannan ka rubuta `npm run dev -- --host`.'
                  : 'عبر تطبيق Termux يمكنك تشغيل خادم محلي بأمر npm run dev وفتح التطبيق في متصفحك المحلي.'}
              </p>
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            {isHa ? 'NOORUL QURAN · Kyauta don Al\'ummar Musulmi' : 'نور القرآن · وقف خيري تعليمي للأطفال'}
          </span>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2 text-xs font-bold text-slate-800 transition cursor-pointer"
          >
            {isHa ? 'Na Fahimta' : 'إغلاق'}
          </button>
        </div>

      </div>
    </div>
  );
};
