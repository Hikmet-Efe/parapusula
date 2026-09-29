import React from 'react';
import { 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Settings as SettingsIcon, 
  Bell, 
  BellRing,
  RotateCcw
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function Header({ onOpenSettings, onOpenBudgetSetup }) {
  const {
    selectedYear,
    selectedMonth,
    prevMonth,
    nextMonth,
    resetToCurrentMonth,
    settings,
    permissionState,
    enableNotifications
  } = useBudget();

  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white flex-shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
                ParaPusula
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Offline
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Günlük Bütçe & Tasarruf Pusulası
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 shadow-inner">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-2 text-center min-w-[100px]">
            <span className="text-sm font-semibold text-slate-100 block">
              {MONTH_NAMES_TR[selectedMonth - 1]}
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              {selectedYear}
            </span>
          </div>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Sonraki Ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isCurrentMonth && (
            <button
              onClick={resetToCurrentMonth}
              className="ml-1 p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
              title="Bu Aya Dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenBudgetSetup}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/50 transition flex items-center gap-1.5 text-xs font-medium"
            title="Bütçe Yapılandırması"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Bütçeyi Düzenle</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition"
            title="Ayarlar & Bildirimler"
          >
            <SettingsIcon className="w-4 h-4" />
            {settings.notificationEnabled && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Notification Permission Banner if not enabled */}
      {permissionState !== 'granted' && (
        <div className="max-w-4xl mx-auto mt-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2 px-3 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-400 animate-bounce flex-shrink-0" />
            <span>Her gece saat {settings.notificationTime || '23:00'}'da harcama bildirimini kaçırmamak için bildirimleri açın.</span>
          </div>
          <button
            onClick={enableNotifications}
            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md transition flex-shrink-0 text-[11px]"
          >
            Bildirimleri Aç
          </button>
        </div>
      )}
    </header>
  );
}
